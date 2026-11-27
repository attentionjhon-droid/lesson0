"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Code2,
  LogIn,
  LogOut,
  UserPlus,
  BookOpen,
  ShieldCheck,
  MessageSquare,
  Terminal,
  ShoppingBag,
  User,
  ChevronDown,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { STORE_ITEMS } from "@/lib/storeItems";
import ThemeToggle from "@/components/ThemeToggle";

interface CurrentUser {
  id: string;
  username: string;
  name?: string | null;
  role: string;
  coupons?: number;
  activeNameAnim?: string | null;
  activeAvatarFrame?: string | null;
  activeTitle?: string | null;
}

export default function Navbar() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = () => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setDropdownOpen(false);
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitials = (u: CurrentUser) => {
    if (u.name) {
      const parts = u.name.trim().split(" ");
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return u.username.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Find cosmetics
  const activeNameItem = user?.activeNameAnim
    ? STORE_ITEMS.find((i) => i.id === user.activeNameAnim)
    : null;
  const activeFrameItem = user?.activeAvatarFrame
    ? STORE_ITEMS.find((i) => i.id === user.activeAvatarFrame)
    : null;
  const activeTitleItem = user?.activeTitle
    ? STORE_ITEMS.find((i) => i.id === user.activeTitle)
    : null;

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-2xl transition-colors duration-300 bg-white/70 dark:bg-slate-950/85 border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
              NDTU Coding
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 font-mono hidden xs:inline">
              C++ Online Judge
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
          <Link
            href="/masalalar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
              pathname.startsWith("/masalalar")
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Masalalar</span>
          </Link>

          <Link
            href="/compiler"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
              pathname === "/compiler"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Kompilyator</span>
          </Link>

          <Link
            href="/store"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
              pathname === "/store"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                : "text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/5"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span>Do&apos;kon</span>
          </Link>

          <Link
            href="/feedback"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
              pathname === "/feedback"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Takliflar</span>
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                pathname === "/admin"
                  ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Theme Toggle + Auth / Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Day / Night Theme Toggle */}
          <ThemeToggle />

          {loading ? (
            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Coupons Badge (Always Visible on Mobile & Desktop) */}
              <Link
                href="/store"
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border transition shrink-0 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm"
                title="Sizning kuponlaringiz (Do'konga o'tish)"
              >
                <span className="text-sm sm:text-base select-none leading-none">💵</span>
                <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                  {user.coupons ?? 0}
                </span>
              </Link>

              {/* User Avatar Pill */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl transition cursor-pointer border ${
                    pathname === "/profile" || dropdownOpen
                      ? "bg-slate-100 dark:bg-slate-900 border-emerald-500/50 shadow-md"
                      : "bg-white/80 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                  title="Shaxsiy kabinet / Profil"
                >
                  {/* Circular Avatar with Active Cosmetic Frame */}
                  <div className={`relative ${activeFrameItem ? activeFrameItem.cssClass : ""}`}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm ${
                        user.role === "ADMIN"
                          ? "bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 text-white shadow-purple-500/30"
                          : "bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 shadow-emerald-500/30"
                      }`}
                    >
                      {getUserInitials(user)}
                    </div>
                  </div>

                  {/* Name with Active Name Animation */}
                  <span
                    className={`text-xs sm:text-sm font-semibold max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline ${
                      activeNameItem
                        ? activeNameItem.cssClass
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {user.name || user.username}
                  </span>

                  {/* Active Title Badge */}
                  {activeTitleItem && (
                    <span className={`hidden md:inline ${activeTitleItem.cssClass}`}>
                      {activeTitleItem.emoji}
                    </span>
                  )}

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180 text-emerald-500" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 border backdrop-blur-2xl bg-white/95 dark:bg-slate-900/98 border-slate-200 dark:border-slate-800">
                    {/* User Header in Dropdown */}
                    <div className="p-3 rounded-2xl border flex items-center gap-3 mb-1.5 bg-slate-50 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80">
                      <div className={`relative ${activeFrameItem ? activeFrameItem.cssClass : ""}`}>
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-extrabold shadow-md ${
                            user.role === "ADMIN"
                              ? "bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 text-white"
                              : "bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 text-slate-950"
                          }`}
                        >
                          {getUserInitials(user)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-bold text-sm truncate ${
                            activeNameItem
                              ? activeNameItem.cssClass
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {user.name || user.username}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                          @{user.username}
                        </div>
                        {activeTitleItem && (
                          <div className="mt-1">
                            <span className={activeTitleItem.cssClass}>
                              {activeTitleItem.emoji} {activeTitleItem.name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              user.role === "ADMIN"
                                ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                                : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {user.role === "ADMIN" ? "ADMIN" : "TALABA"}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            💵 {user.coupons ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition ${
                          pathname === "/profile"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Mening profilim</span>
                      </Link>

                      <Link
                        href="/store"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition ${
                          pathname === "/store"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        <span>Do&apos;kon (Kuponlar)</span>
                      </Link>

                      <Link
                        href="/feedback"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition ${
                          pathname === "/feedback"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-teal-500" />
                        <span>Takliflar va Sharhlar</span>
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition ${
                            pathname === "/admin"
                              ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25"
                              : "text-purple-600 dark:text-purple-300 hover:bg-purple-500/10"
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-500" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div className="h-[1px] bg-slate-200 dark:bg-slate-800/80 my-1" />

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Chiqish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Kirish</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-bold text-white dark:text-slate-950 bg-emerald-600 dark:bg-emerald-400 hover:bg-emerald-500 dark:hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ro&apos;yxatdan o&apos;tish</span>
                <span className="sm:hidden">Qo&apos;shilish</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
