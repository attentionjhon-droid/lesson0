"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-8 h-8 rounded-full ${className}`} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm active:scale-90 flex items-center justify-center ${
        isDark
          ? "bg-slate-900/80 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:text-amber-300 hover:border-amber-400/30"
          : "bg-white/90 border-slate-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
      } ${className}`}
      title={isDark ? "Kunduzgi (Yorug') rejimga o'tish" : "Tungi (Qorong'i) rejimga o'tish"}
      aria-label="Mavzuni o'zgartirish"
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
