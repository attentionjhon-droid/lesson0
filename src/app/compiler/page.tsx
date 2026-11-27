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
  Code2,
  FileInput,
  FileCode,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";

// Dynamically import Monaco Editor with SSR disabled
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-[#0b1120] text-slate-500 dark:text-slate-400 font-mono text-xs">
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  // Mobile segmented tab: 'code' | 'stdin' | 'output'
  const [mobileTab, setMobileTab] = useState<"code" | "stdin" | "output">("code");

  // Define custom "ndtu-dark" and "ndtu-light" themes
  const handleBeforeMount = (monaco: Monaco) => {
    // Dark Theme: #0b1120 background
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

    // Clean Bento Light Theme: crisp white/slate background
    monaco.editor.defineTheme("ndtu-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
        { token: "keyword", foreground: "0284c7", fontStyle: "bold" },
        { token: "keyword.control", foreground: "db2777" },
        { token: "string", foreground: "059669" },
        { token: "string.escape", foreground: "0d9488" },
        { token: "number", foreground: "d97706" },
        { token: "type", foreground: "7c3aed", fontStyle: "bold" },
        { token: "function", foreground: "2563eb" },
        { token: "variable", foreground: "0f172a" },
        { token: "operator", foreground: "0f766e" },
        { token: "delimiter", foreground: "64748b" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#0f172a",
        "editorGutter.background": "#f8fafc",
        "editorCursor.foreground": "#059669",
        "editor.lineHighlightBackground": "#f1f5f9",
        "editor.lineHighlightBorder": "#00000000",
        "editorLineNumber.foreground": "#94a3b8",
        "editorLineNumber.activeForeground": "#059669",
        "editor.selectionBackground": "#bae6fd80",
        "editor.inactiveSelectionBackground": "#e2e8f080",
        "editorWidget.background": "#ffffff",
        "editorWidget.border": "#e2e8f0",
        "editorSuggestWidget.background": "#ffffff",
        "editorSuggestWidget.border": "#e2e8f0",
        "editorSuggestWidget.selectedBackground": "#f1f5f9",
        "scrollbarSlider.background": "#cbd5e150",
        "scrollbarSlider.hoverBackground": "#94a3b880",
        "scrollbarSlider.activeBackground": "#64748bb0",
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

    // Auto-switch to output tab on mobile when running
    setMobileTab("output");

    try {
      const res = await fetch("/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      const data = await res.json();

      setStdout(data.stdout || "");
      setStderr(data.stderr || "");
      setRunSuccess(data.success);
      setExecutionTime(data.executionTime ?? null);
      setProvider(data.provider || "");
    } catch {
      setStderr("Tarmoq xatosi. Bajaruvchi server bilan aloqa uzildi.");
      setRunSuccess(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 md:pb-0"
    >
      <Navbar />

      {/* Compiler Top Toolbar */}
      <div className="border-b transition-colors px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sticky top-16 z-20 backdrop-blur-2xl bg-white/75 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
                <span>Kompilyator</span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hidden xs:inline">
                  Judge0 / Piston
                </span>
              </h1>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">Til:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
              className="px-3 py-1.5 rounded-2xl text-xs font-semibold focus:outline-none transition cursor-pointer border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm"
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
            className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium border transition cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 shadow-sm"
            title="Kodni nusxalash"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 hidden xs:inline">Nusxalandi</span>
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
            className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium border transition cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 shadow-sm"
            title="Dastlabki shablonga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Qaytarish</span>
          </button>

          {/* Green Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-2xl text-xs font-bold text-white dark:text-slate-950 bg-emerald-600 dark:bg-emerald-400 hover:bg-emerald-500 dark:hover:bg-emerald-300 active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            title="Ishga tushirish (Ctrl + Enter)"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Ishga tushirish</span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented Tab Controller (Visible ONLY on mobile screens < 1024px) */}
      <div className="lg:hidden px-3 py-2 bg-slate-100/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="flex items-center p-1 rounded-2xl bg-white/90 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner w-full max-w-sm">
          <button
            onClick={() => setMobileTab("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mobileTab === "code"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kod</span>
          </button>
          <button
            onClick={() => setMobileTab("stdin")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mobileTab === "stdin"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileInput className="w-3.5 h-3.5" />
            <span>Kirish (Stdin)</span>
          </button>
          <button
            onClick={() => setMobileTab("output")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mobileTab === "output"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Natija</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Editor (Left) and I/O (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT / MAIN COLUMN: Monaco Editor */}
        <div
          className={`lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col h-[500px] lg:h-[calc(100vh-125px)] ${
            mobileTab === "code" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="px-4 py-2 border-b flex items-center justify-between text-xs font-mono bg-slate-100/90 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {language === "cpp"
                  ? "main.cpp"
                  : language === "python"
                  ? "main.py"
                  : "main.js"}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-bold">
                {isDark ? "ndtu-dark" : "ndtu-light"}
              </span>
            </div>
            <div className="text-slate-400 dark:text-slate-500 text-[11px] hidden sm:block">
              Tezkor tugma: <kbd className="px-1.5 py-0.5 rounded-md font-sans text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Ctrl + Enter</kbd>
            </div>
          </div>

          <div className="flex-1 w-full overflow-hidden bg-white dark:bg-[#0b1120]">
            <Editor
              height="100%"
              language={language}
              theme={isDark ? "ndtu-dark" : "ndtu-light"}
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
        <div
          className={`lg:col-span-5 flex-col h-auto min-h-[420px] lg:h-[calc(100vh-125px)] overflow-hidden bg-slate-50 dark:bg-slate-950 ${
            mobileTab !== "code" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Top Half: Stdin / Input */}
          <div
            className={`border-b transition-colors bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 ${
              mobileTab === "stdin"
                ? "flex-1 flex flex-col"
                : mobileTab === "output"
                ? "hidden lg:flex lg:h-1/3 lg:min-h-[140px] flex-col"
                : "h-1/3 min-h-[140px] flex flex-col"
            }`}
          >
            <div className="px-4 py-2 border-b flex items-center justify-between text-xs font-semibold bg-slate-100/80 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <FileInput className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Kirish ma&apos;lumotlari (Stdin / Input)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Standart kiritish</span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Dastur cin, input() yoki prompt() orqali o'qiydigan qiymatlarni kiriting..."
              className="flex-1 w-full p-4 font-mono text-xs focus:outline-none resize-none border-none leading-relaxed transition-colors bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Bottom Half: Stdout / Stderr Output */}
          <div
            className={`flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 ${
              mobileTab === "output"
                ? "flex-1 flex"
                : mobileTab === "stdin"
                ? "hidden lg:flex lg:flex-1"
                : "flex-1 flex"
            }`}
          >
            {/* Output Bar */}
            <div className="px-4 py-2 border-b flex items-center justify-between text-xs font-semibold bg-slate-100/80 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-800 dark:text-slate-200">Natija (Output)</span>
                {runSuccess !== null && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      runSuccess
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
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
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {executionTime} ms
                  </span>
                )}
                <button
                  onClick={handleClearOutput}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Konsolni tozalash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Output Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs select-text bg-white dark:bg-slate-950">
              {isRunning ? (
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 py-10 justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Kod kompilyatsiya qilinmoqda...</span>
                </div>
              ) : !stdout && !stderr ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-xs py-10">
                  <Terminal className="w-8 h-8 mb-2 opacity-40" />
                  <span>Kodni ishga tushirish uchun yashil &apos;Run&apos; tugmasini bosing</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {stdout && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                        Standart Chiqish (stdout):
                      </div>
                      <pre className="text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap leading-relaxed p-3.5 rounded-2xl border bg-emerald-50/70 dark:bg-slate-900/60 border-emerald-200/80 dark:border-slate-800">
                        {stdout}
                      </pre>
                    </div>
                  )}

                  {stderr && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">
                        Xatolik (stderr):
                      </div>
                      <pre className="text-rose-700 dark:text-rose-300 whitespace-pre-wrap leading-relaxed p-3.5 rounded-2xl border bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20">
                        {stderr}
                      </pre>
                    </div>
                  )}

                  {provider && (
                    <div className="text-[10px] text-slate-400 font-sans pt-1">
                      Bajaruvchi server: <span className="text-slate-600 dark:text-slate-400 font-mono">{provider}</span>
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
