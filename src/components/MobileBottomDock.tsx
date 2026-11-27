"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Terminal, ShoppingBag, User } from "lucide-react";

export default function MobileBottomDock() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Masalalar",
      href: "/masalalar",
      icon: BookOpen,
      isActive: pathname.startsWith("/masalalar"),
    },
    {
      label: "Kompilyator",
      href: "/compiler",
      icon: Terminal,
      isActive: pathname === "/compiler",
    },
    {
      label: "Do'kon",
      href: "/store",
      icon: ShoppingBag,
      isActive: pathname === "/store",
    },
    {
      label: "Profil",
      href: "/profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-around gap-1 px-3 py-2 rounded-full border shadow-2xl backdrop-blur-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/85 border-white/60 dark:border-slate-800/80 shadow-slate-900/10 dark:shadow-black/50 max-w-sm w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all duration-200 relative group ${
                item.isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  item.isActive
                    ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-sans">
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
