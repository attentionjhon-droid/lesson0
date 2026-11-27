import { Code2 } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t transition-colors duration-300 py-8 mt-auto bg-white/70 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
          <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">NDTU Coding Platform</span>
          <span>— C++ dasturlash bo&apos;yicha masalalar platformasi</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/masalalar" className="hover:text-emerald-600 dark:hover:text-slate-200 transition">
            Masalalar
          </Link>
          <Link href="/compiler" className="hover:text-emerald-600 dark:hover:text-slate-200 transition">
            Kompilyator
          </Link>
          <Link href="/store" className="hover:text-amber-600 dark:hover:text-amber-300 transition">
            Do&apos;kon
          </Link>
          <Link href="/feedback" className="hover:text-emerald-600 dark:hover:text-slate-200 transition">
            Sharh va Takliflar
          </Link>
          <Link href="/login" className="hover:text-emerald-600 dark:hover:text-slate-200 transition">
            Kirish
          </Link>
          <Link href="/register" className="hover:text-emerald-600 dark:hover:text-slate-200 transition">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </div>
      </div>
    </footer>
  );
}
