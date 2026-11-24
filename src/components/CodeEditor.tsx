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
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden xs:flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-xs font-mono font-medium text-emerald-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>solution.cpp</span>
            <span className="text-[10px] text-slate-400 font-sans ml-1 hidden xs:inline">(C++ 17)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center bg-slate-800/80 rounded-md p-0.5 border border-slate-700/50 text-[11px]">
            <button
              onClick={() => setFontSize("sm")}
              className={`px-2 py-0.5 rounded ${fontSize === "sm" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("base")}
              className={`px-2 py-0.5 rounded ${fontSize === "base" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              className={`px-2 py-0.5 rounded ${fontSize === "lg" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              A+
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition cursor-pointer"
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

          {/* Reset Template Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition cursor-pointer"
            title="Dastlabki shablonga qaytarish"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Qaytarish</span>
          </button>
        </div>
      </div>

      {/* Code Textarea & Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono bg-slate-950">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 select-none py-4 text-right pr-3 bg-slate-900/50 text-slate-500 border-r border-slate-800/80 overflow-hidden"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className={`${fontSizeClasses[fontSize]} text-slate-500`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className={`flex-1 w-full h-full p-4 bg-transparent text-emerald-100 resize-none outline-none focus:outline-none border-none font-mono ${fontSizeClasses[fontSize]} selection:bg-emerald-800/50 overflow-auto whitespace-pre`}
          placeholder="// C++ kodingizni bu yerga yozing..."
        />
      </div>

      {/* Editor Status Bar */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Qatorlar: {lines.length}</span>
          <span>Belgilar: {value.length}</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <Sparkles className="w-3 h-3" />
          <span>NDTU Coding Platform Sandbox C++</span>
        </div>
      </div>
    </div>
  );
}
