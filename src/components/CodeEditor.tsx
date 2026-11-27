"use client";

import React, { useRef, useState } from "react";
import { RotateCcw, Copy, Check, Terminal, Sparkles } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  defaultCode: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  defaultCode,
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("sm");

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 18);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 4 spaces
      const newValue =
        value.substring(0, start) + "    " + value.substring(end);
      onChange(newValue);

      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Kodni dastlabki shablon holatiga qaytarmoqchimisiz?")) {
      onChange(defaultCode);
    }
  };

  const fontSizeClasses = {
    sm: "text-xs leading-5",
    base: "text-sm leading-6",
    lg: "text-base leading-7",
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border overflow-hidden shadow-xl transition-colors duration-300 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 border-b gap-2 transition-colors duration-300 bg-slate-100/90 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden xs:flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border text-xs font-mono font-medium bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60 text-emerald-700 dark:text-emerald-400 shadow-sm">
            <Terminal className="w-3.5 h-3.5" />
            <span>solution.cpp</span>
            <span className="text-[10px] text-slate-400 font-sans ml-1 hidden xs:inline">(C++ 17)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center rounded-xl p-0.5 border text-[11px] bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50">
            <button
              onClick={() => setFontSize("sm")}
              className={`px-2 py-0.5 rounded-lg ${fontSize === "sm" ? "bg-slate-200 dark:bg-slate-700 font-bold" : "text-slate-500 dark:text-slate-400"}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("base")}
              className={`px-2 py-0.5 rounded-lg ${fontSize === "base" ? "bg-slate-200 dark:bg-slate-700 font-bold" : "text-slate-500 dark:text-slate-400"}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-2 py-0.5 rounded-lg ${fontSize === "lg" ? "bg-slate-200 dark:bg-slate-700 font-bold" : "text-slate-500 dark:text-slate-400"}`}
            >
              A+
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 shadow-sm"
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

          {/* Reset Template Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 shadow-sm"
            title="Dastlabki shablonga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Qaytarish</span>
          </button>
        </div>
      </div>

      {/* Code Textarea & Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono transition-colors duration-300 bg-white dark:bg-slate-950">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 select-none py-4 text-right pr-3 overflow-hidden border-r transition-colors duration-300 bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800/80"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className={`${fontSizeClasses[fontSize]}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative flex-1 h-full">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="// Kodingizni shu yerga yozing..."
            className={`w-full h-full p-4 font-mono ${fontSizeClasses[fontSize]} resize-none focus:outline-none transition-colors duration-300 bg-transparent text-slate-900 dark:text-emerald-300 selection:bg-emerald-500 selection:text-white caret-emerald-600 dark:caret-emerald-400 leading-relaxed`}
          />
        </div>
      </div>
    </div>
  );
}
