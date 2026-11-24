"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  Cpu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Dynamically import Monaco Editor with SSR disabled for optimal Next.js performance
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0b1120] text-slate-400 font-mono text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Monaco Editor yuklanmoqda...</span>
      </div>
    </div>
  ),
});

const DEFAULT_CODE_SNIPPETS: Record<string, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, NDTU Coding Platform!" << endl;
    
    // Foydalanuvchidan ma'lumot olish namunasi:
    // int son;
    // if (cin >> son) {
    //     cout << "Kiritilgan son: " << son << endl;
    // }
    
    return 0;
}
`,
  python: `# Python 3 dasturi
print("Hello, NDTU Coding Platform!")

# Foydalanuvchidan ma'lumot olish namunasi:
# ism = input("Ismingiz: ")
# print("Salom,", ism)
`,
  javascript: `// JavaScript (Node.js) dasturi
console.log("Hello, NDTU Coding Platform!");

// Namuna: 1 dan 5 gacha sonlar kvadratlari
for (let i = 1; i <= 5; i++) {
    console.log(\`\${i}^2 = \${i * i}\`);
}
`,
};

type LanguageKey = "cpp" | "python" | "javascript";

export default function CompilerPage() {
  const [language, setLanguage] = useState<LanguageKey>("cpp");
  const [code, setCode] = useState<string>(DEFAULT_CODE_SNIPPETS.cpp);
  const [stdin, setStdin] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [runSuccess, setRunSuccess] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Define custom "ndtu-dark" theme with #0b1120 background matching Slate-950/900 palette
  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme("ndtu-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "38bdf8", fontStyle: "bold" },
        { token: "keyword.control", foreground: "f472b6" },
        { token: "string", foreground: "34d399" },
        { token: "string.escape", foreground: "2dd4bf" },
        { token: "number", foreground: "fbbf24" },
        { token: "type", foreground: "a78bfa", fontStyle: "bold" },
        { token: "function", foreground: "60a5fa" },
        { token: "variable", foreground: "f1f5f9" },
        { token: "operator", foreground: "2dd4bf" },
        { token: "delimiter", foreground: "94a3b8" },
      ],
      colors: {
        "editor.background": "#0b1120",
        "editor.foreground": "#f8fafc",
        "editorGutter.background": "#0b1120",
        "editorCursor.foreground": "#34d399",
        "editor.lineHighlightBackground": "#1e293b45",
        "editor.lineHighlightBorder": "#00000000",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#34d399",
        "editor.selectionBackground": "#1e3a5f80",
        "editor.inactiveSelectionBackground": "#1e293b50",
        "editorWidget.background": "#0f172a",
        "editorWidget.border": "#334155",
        "editorSuggestWidget.background": "#0f172a",
        "editorSuggestWidget.border": "#334155",
        "editorSuggestWidget.selectedBackground": "#1e293b",
        "scrollbarSlider.background": "#33415540",
        "scrollbarSlider.hoverBackground": "#47556970",
        "scrollbarSlider.activeBackground": "#64748b90",
      },
    });
  };

  const handleLanguageChange = (newLang: LanguageKey) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE_SNIPPETS[newLang]);
    setStdout("");
    setStderr("");
    setRunSuccess(null);
  };

  const handleReset = () => {
    if (confirm("Kodni dastlabki shablonga qaytarmoqchimisiz?")) {
      setCode(DEFAULT_CODE_SNIPPETS[language]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearOutput = () => {
    setStdout("");
    setStderr("");
    setRunSuccess(null);
    setExecutionTime(null);
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setStdout("");
    setStderr("");
    setRunSuccess(null);

    try {
      const res = await fetch("/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          stdin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStderr(data.error || "Ishga tushirishda xatolik yuz berdi");
        setRunSuccess(false);
      } else {
        setStdout(data.stdout || "");
        setStderr(data.stderr || "");
        setRunSuccess(data.success);
        setExecutionTime(data.duration);
        setProvider(data.provider || "Piston API");
      }
    } catch {
      setStderr("Tarmoq xatosi. Qaytadan urinib ko'ring.");
      setRunSuccess(false);
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter to run
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="min-h-screen flex flex-col bg-slate-950 text-slate-100"
    >
      <Navbar />

      {/* Compiler Top Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sticky top-16 z-20 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
                <span>Kompilyator</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono hidden xs:inline">
                  Judge0 / Piston
                </span>
              </h1>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden md:inline">Til:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
              className="px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="cpp">C++ (GCC / C++17)</option>
              <option value="python">Python (3.10+)</option>
              <option value="javascript">JavaScript (Node.js)</option>
            </select>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition cursor-pointer"
            title="Kodni nusxalash"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 hidden xs:inline">Nusxalandi</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Nusxa</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition cursor-pointer"
            title="Dastlabki shablonga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Qaytarish</span>
          </button>

          {/* Green Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 sm:px-5 py-1 sm:py-1.5 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-slate-950 disabled:opacity-50 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            title="Ishga tushirish (Ctrl + Enter)"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span>Ishga tushirish</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Editor (Left/Top) and I/O (Right/Bottom) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT / MAIN COLUMN: Monaco Editor */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col h-[400px] sm:h-[480px] lg:h-[calc(100vh-125px)] bg-[#0b1120]">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">
                {language === "cpp"
                  ? "main.cpp"
                  : language === "python"
                  ? "main.py"
                  : "main.js"}
              </span>
              <span className="text-emerald-400 text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                ndtu-dark
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Tezkor tugma: <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">Ctrl + Enter</kbd>
            </div>
          </div>

          <div className="flex-1 w-full overflow-hidden bg-[#0b1120]">
            <Editor
              height="100%"
              language={language}
              theme="ndtu-dark"
              beforeMount={handleBeforeMount}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                formatOnPaste: true,
                fontFamily: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Stdin & Output Console */}
        <div className="lg:col-span-5 flex flex-col h-auto min-h-[400px] lg:h-[calc(100vh-125px)] bg-slate-950 overflow-hidden">
          {/* Top Half of Right Pane: Stdin / Input */}
          <div className="h-44 lg:h-1/3 min-h-[140px] flex flex-col border-b border-slate-800 bg-slate-900/40">
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kirish ma&apos;lumotlari (Stdin / Input)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Dastur kiritishi</span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Dastur cin, input() yoki prompt() orqali o'qiydigan ma'lumotlarni shu yerga yozing..."
              className="flex-1 w-full p-3.5 bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none resize-none border-none leading-relaxed placeholder:text-slate-600"
            />
          </div>

          {/* Bottom Half of Right Pane: Stdout / Stderr Output */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Output Bar */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="text-slate-200">Natija (Output)</span>
                {runSuccess !== null && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      runSuccess
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {runSuccess ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Muvaffaqiyatli</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Xatolik</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {executionTime !== null && (
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {executionTime} ms
                  </span>
                )}
                <button
                  onClick={handleClearOutput}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Konsolni tozalash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Output Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs select-text bg-slate-950">
              {isRunning ? (
                <div className="flex items-center gap-2.5 text-slate-400 py-8 justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Kod Piston API orqali bajarilmoqda...</span>
                </div>
              ) : !stdout && !stderr ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-8">
                  <Terminal className="w-8 h-8 mb-2 opacity-50" />
                  <span>Kodni ishga tushirish uchun yashil &apos;Run&apos; tugmasini bosing</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {stdout && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Standart Chiqish (stdout):
                      </div>
                      <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        {stdout}
                      </pre>
                    </div>
                  )}

                  {stderr && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                        Xatolik (stderr):
                      </div>
                      <pre className="text-rose-300 whitespace-pre-wrap leading-relaxed bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                        {stderr}
                      </pre>
                    </div>
                  )}

                  {provider && (
                    <div className="text-[10px] text-slate-500 font-sans pt-1">
                      Bajaruvchi server: <span className="text-slate-400 font-mono">{provider}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
