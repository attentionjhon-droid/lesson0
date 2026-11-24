import vm from "vm";

export interface ExecutionResult {
  status: "Accepted" | "Wrong Answer" | "Compilation Error" | "Runtime Error" | "Time Limit Exceeded";
  output: string;
  error?: string;
  executionTime: number; // ms
  memory: number; // KB
}

// Convert common C++ code to safe JavaScript executable code for algorithmic problems
function transpilerCppToJs(cppCode: string): { jsCode: string; error?: string } {
  // Check for basic structure
  if (!cppCode.includes("main")) {
    return {
      jsCode: "",
      error: "Kompilatsiya xatosi: Dasturda 'main()' funksiyasi aniqlanmadi.",
    };
  }

  // Check brackets balance
  let braceCount = 0;
  for (const ch of cppCode) {
    if (ch === "{") braceCount++;
    if (ch === "}") braceCount--;
    if (braceCount < 0) {
      return {
        jsCode: "",
        error: "Kompilatsiya xatosi: Qavslar '}' noto'g'ri yopilgan.",
      };
    }
  }
  if (braceCount !== 0) {
    return {
      jsCode: "",
      error: "Kompilatsiya xatosi: Qavslar '{' to'liq yopilmagan.",
    };
  }

  // Extract main function body
  const mainRegex = /int\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/;
  const match = cppCode.match(mainRegex);
  if (!match) {
    return {
      jsCode: "",
      error: "Kompilatsiya xatosi: 'int main()' funksiyasining tanasi noto'g'ri shakllantirilgan.",
    };
  }

  let body = match[1];

  // Remove single line and multi-line comments
  body = body.replace(/\/\*[\s\S]*?\*\//g, "");
  body = body.replace(/\/\/.*/g, "");

  // Transform C++ vector / array declarations:
  // e.g. vector<int> a(n); or vector<int> a;
  body = body.replace(/vector\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*(\([^)]*\))?\s*;/g, "let $1 = [];");

  // Fixed array declarations: e.g. int arr[100]; or int a[n];
  body = body.replace(/\b(long\s+long|int|double|float|char|bool|string)\s+([a-zA-Z_]\w*)\s*\[[^\]]*\]\s*;/g, "let $2 = [];");

  // Type declarations: int, long long, double, float, char, bool, auto, string
  body = body.replace(/\b(long\s+long|int|double|float|char|bool|auto|string)\s+/g, "let ");

  // Handle cin >> ...
  // e.g. `cin >> a >> b[i];` -> `a = __readNext(); b[i] = __readNext();`
  body = body.replace(/cin\s*>>([^;]+);/g, (_, chain) => {
    const vars = chain
      .split(">>")
      .map((v: string) => v.trim())
      .filter((v: string) => v.length > 0);
    return vars.map((v: string) => `${v} = __readNext();`).join(" ");
  });

  // Handle cout << ...
  body = body.replace(/cout\s*<<([^;]+);/g, (_, chain) => {
    const parts = chain
      .split("<<")
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);
    return parts
      .map((p: string) => {
        if (p === "endl") return `__print("\\n");`;
        return `__print(${p});`;
      })
      .join(" ");
  });

  // Common C++ vector/string methods
  body = body.replace(/\.push_back\s*\(/g, ".push(");
  body = body.replace(/\.size\s*\(\s*\)/g, ".length");
  body = body.replace(/\.length\s*\(\s*\)/g, ".length");

  // std::max / max, std::min / min, std::abs / abs, std::sqrt / sqrt, std::pow / pow
  body = body.replace(/\b(std::)?max\s*\(/g, "Math.max(");
  body = body.replace(/\b(std::)?min\s*\(/g, "Math.min(");
  body = body.replace(/\b(std::)?abs\s*\(/g, "Math.abs(");
  body = body.replace(/\b(std::)?sqrt\s*\(/g, "Math.sqrt(");
  body = body.replace(/\b(std::)?pow\s*\(/g, "Math.pow(");

  // Replace `return 0;` with `return;`
  body = body.replace(/return\s+0\s*;/g, "return;");

  return { jsCode: body };
}

export function executeCppCode(
  code: string,
  rawInput: string,
  timeLimitMs: number = 1000
): ExecutionResult {
  const startTime = performance.now();

  const { jsCode, error: compileError } = transpilerCppToJs(code);
  if (compileError) {
    return {
      status: "Compilation Error",
      output: "",
      error: compileError,
      executionTime: 0,
      memory: 256,
    };
  }

  // Tokenize input by whitespace
  const tokens = rawInput
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  let tokenIndex = 0;
  let stdoutBuffer = "";

  const sandboxContext = {
    __readNext: () => {
      if (tokenIndex >= tokens.length) return 0;
      const t = tokens[tokenIndex++];
      const num = Number(t);
      return isNaN(num) ? t : num;
    },
    __print: (val: unknown) => {
      if (val === undefined || val === null) return;
      stdoutBuffer += String(val);
    },
    Math: Math,
  };

  try {
    const script = new vm.Script(`
      (function() {
        ${jsCode}
      })();
    `);

    const context = vm.createContext(sandboxContext);
    script.runInContext(context, { timeout: timeLimitMs });

    const executionTime = Math.max(1, Math.round(performance.now() - startTime));

    return {
      status: "Accepted",
      output: stdoutBuffer.trim(),
      executionTime,
      memory: Math.floor(1024 + Math.random() * 512), // KB simulation
    };
  } catch (err: unknown) {
    const executionTime = Math.max(1, Math.round(performance.now() - startTime));
    const errMsg = err instanceof Error ? err.message : String(err);

    if (errMsg.includes("timed out") || errMsg.includes("Script execution timed out")) {
      return {
        status: "Time Limit Exceeded",
        output: stdoutBuffer.trim(),
        error: `Vaqt chegarasidan oshib ketdi (${timeLimitMs}ms)`,
        executionTime: timeLimitMs,
        memory: 2048,
      };
    }

    return {
      status: "Runtime Error",
      output: stdoutBuffer.trim(),
      error: `Dastur bajarilishida xatolik: ${errMsg}`,
      executionTime,
      memory: 512,
    };
  }
}
