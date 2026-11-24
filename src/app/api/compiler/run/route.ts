import { NextResponse } from "next/server";
import { executeCppCode } from "@/lib/cppExecutor";
import vm from "vm";

const PISTON_CONFIG: Record<
  string,
  { pistonLang: string; version: string; filename: string }
> = {
  cpp: {
    pistonLang: "c++",
    version: "10.2.0",
    filename: "main.cpp",
  },
  python: {
    pistonLang: "python",
    version: "3.10.0",
    filename: "main.py",
  },
  javascript: {
    pistonLang: "javascript",
    version: "18.15.0",
    filename: "main.js",
  },
};

const JUDGE0_LANGUAGE_ID: Record<string, number> = {
  cpp: 105,       // C++ (GCC 14.1.0)
  python: 100,    // Python (3.12.5)
  javascript: 102 // JavaScript (Node.js 22.08.0)
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language = "cpp", code = "", stdin = "" } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Kod kiritilmagan. Iltimos, dastur kodini yozing." },
        { status: 400 }
      );
    }

    const config = PISTON_CONFIG[language] || PISTON_CONFIG.cpp;
    const startTime = performance.now();

    // 1. Try Piston API execution first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const pistonResponse = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          language: config.pistonLang,
          version: config.version,
          files: [
            {
              name: config.filename,
              content: code,
            },
          ],
          stdin: stdin || "",
        }),
      });

      clearTimeout(timeoutId);

      if (pistonResponse.ok) {
        const result = await pistonResponse.json();
        const duration = Math.round(performance.now() - startTime);

        const compileStderr = result.compile?.stderr || "";
        const runStderr = result.run?.stderr || "";
        const runStdout = result.run?.stdout || "";
        const exitCode = result.run?.code ?? (compileStderr ? 1 : 0);

        return NextResponse.json({
          success: exitCode === 0 && !compileStderr,
          stdout: runStdout,
          stderr: compileStderr || runStderr,
          exitCode,
          duration,
          provider: "Piston API",
        });
      }
    } catch {
      // Piston offline or blocked, proceed to Judge0
    }

    // 2. High-speed Cloud Compiler (Judge0 CE Engine)
    const judge0LangId = JUDGE0_LANGUAGE_ID[language];
    if (judge0LangId) {
      try {
        const j0Controller = new AbortController();
        const j0Timeout = setTimeout(() => j0Controller.abort(), 9000);

        const j0Response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: j0Controller.signal,
          body: JSON.stringify({
            source_code: code,
            language_id: judge0LangId,
            stdin: stdin || "",
          }),
        });

        clearTimeout(j0Timeout);

        if (j0Response.ok) {
          const j0Result = await j0Response.json();
          const duration = Math.round(performance.now() - startTime);

          const stdout = j0Result.stdout || "";
          const stderr = j0Result.stderr || j0Result.compile_output || j0Result.message || "";
          const isSuccess = j0Result.status?.id === 3; // 3 = Accepted

          return NextResponse.json({
            success: isSuccess,
            stdout,
            stderr,
            exitCode: isSuccess ? 0 : 1,
            duration,
            provider: "Judge0 Engine",
          });
        }
      } catch {
        // Fall back to local runners
      }
    }

    // 3. Local Fallbacks
    const duration = Math.round(performance.now() - startTime);

    if (language === "cpp") {
      const localResult = executeCppCode(code, stdin || "");
      return NextResponse.json({
        success: localResult.status === "Accepted",
        stdout: localResult.output,
        stderr: localResult.error || "",
        exitCode: localResult.status === "Accepted" ? 0 : 1,
        duration: localResult.executionTime,
        provider: "NDTU Local Sandbox",
      });
    }

    if (language === "javascript") {
      let outputBuffer = "";
      let errorBuffer = "";

      const sandbox = {
        console: {
          log: (...args: unknown[]) => {
            outputBuffer += args.map(String).join(" ") + "\n";
          },
          error: (...args: unknown[]) => {
            errorBuffer += args.map(String).join(" ") + "\n";
          },
        },
        prompt: () => stdin,
      };

      try {
        const script = new vm.Script(code);
        const context = vm.createContext(sandbox);
        script.runInContext(context, { timeout: 2000 });

        return NextResponse.json({
          success: !errorBuffer,
          stdout: outputBuffer,
          stderr: errorBuffer,
          exitCode: errorBuffer ? 1 : 0,
          duration,
          provider: "NDTU Local JS Sandbox",
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          stdout: outputBuffer,
          stderr: err instanceof Error ? err.message : String(err),
          exitCode: 1,
          duration,
          provider: "NDTU Local JS Sandbox",
        });
      }
    }

    return NextResponse.json({
      success: false,
      stdout: "",
      stderr: "Kompilyator xizmati vaqtincha band. Qaytadan urinib ko'ring.",
      exitCode: 1,
      duration,
      provider: "Compiler Service",
    });
  } catch (error) {
    console.error("Compiler API error:", error);
    return NextResponse.json(
      { error: "Kompilyatorda kutilmagan xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
