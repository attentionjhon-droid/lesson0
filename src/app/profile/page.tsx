"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Eye,
  X,
  Code2,
  Copy,
  Check,
  ArrowRight,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  Zap,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { STORE_ITEMS } from "@/lib/storeItems";

interface UserProfile {
  id: string;
  username: string;
  name?: string | null;
  role: string;
  coupons: number;
  createdAt: string;
  activeNameAnim?: string | null;
  activeAvatarFrame?: string | null;
  activeTitle?: string | null;
}

interface SolvedProblemItem {
  problemId: number;
  title: string;
  difficulty: string;
  reward: string;
  solvedAt: string;
  submissionId: string;
  code: string;
  executionTime?: number | null;
  memoryUsed?: number | null;
  passedTests: number;
  totalTests: number;
}

interface UnsolvedProblemItem {
  id: number;
  title: string;
  difficulty: string;
  reward: string;
  timeLimit: number;
  memoryLimit: number;
  sampleInput: string;
  sampleOutput: string;
}

interface ProfileData {
  user: UserProfile;
  metrics: {
    totalProblems: number;
    solvedCount: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    wrongCount: number;
    compileErrorCount: number;
    runtimeErrorCount: number;
    acceptanceRate: number;
  };
  difficultyStats: {
    easy: { solved: number; total: number; percent: number };
    medium: { solved: number; total: number; percent: number };
    hard: { solved: number; total: number; percent: number };
  };
  solvedProblems: SolvedProblemItem[];
  unsolvedProblems: UnsolvedProblemItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Code inspection modal state
  const [selectedSubmission, setSelectedSubmission] = useState<SolvedProblemItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.status === 401) {
        router.push("/login?redirect=/profile&reason=auth_required");
        return;
      }
      if (!res.ok) {
        throw new Error("Profil ma'lumotlarini yuklab bo'lmadi");
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "oson":
        return {
          label: "Oson",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          rewardClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "o'rta":
      case "orta":
        return {
          label: "O'rta",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          rewardClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "qiyin":
        return {
          label: "Qiyin",
          className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          rewardClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        };
      default:
        return {
          label: difficulty,
          className: "bg-slate-800 text-slate-300 border-slate-700",
          rewardClass: "text-slate-300 bg-slate-800 border-slate-700",
        };
    }
  };

  const getUserInitials = (user: UserProfile) => {
    if (user.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-medium">
              Shaxsiy kabinet yuklanmoqda...
            </span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">Xatolik yuz berdi</h2>
            <p className="text-sm text-slate-400 mt-2">{error || "Ma'lumot topilmadi"}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={fetchProfile}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Qayta urinish
              </button>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold"
              >
                Kirish sahifasi
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { user, metrics, difficultyStats, solvedProblems, unsolvedProblems } = data;
  const progressPercent =
    metrics.totalProblems > 0
      ? Math.round((metrics.solvedCount / metrics.totalProblems) * 100)
      : 0;

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* TOP USER CARD */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 blur-[90px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Left: Avatar + Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Big Avatar */}
              <div className={`relative group ${activeFrameItem ? activeFrameItem.cssClass : ""}`}>
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 shadow-2xl flex items-center justify-center ${
                    user.role === "ADMIN"
                      ? "bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 shadow-purple-500/20"
                      : "bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-emerald-500/20"
                  }`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold tracking-wider ${
                        user.role === "ADMIN"
                          ? "bg-gradient-to-tr from-purple-300 via-indigo-200 to-pink-300 bg-clip-text text-transparent"
                          : "bg-gradient-to-tr from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent"
                      }`}
                    >
                      {getUserInitials(user)}
                    </span>
                  </div>
                </div>

                {/* Role Pill on Avatar */}
                <span
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-md ${
                    user.role === "ADMIN"
                      ? "bg-purple-500/90 text-white border-purple-400"
                      : "bg-emerald-500/90 text-slate-950 border-emerald-400"
                  }`}
                >
                  {user.role === "ADMIN" ? "ADMIN" : "TALABA"}
                </span>
              </div>

              {/* Name & Credentials */}
              <div className="space-y-1.5 mt-2 sm:mt-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      activeNameItem ? activeNameItem.cssClass : "text-white"
                    }`}
                  >
                    {user.name || user.username}
                  </h1>
                  {activeTitleItem && (
                    <span className={activeTitleItem.cssClass}>
                      {activeTitleItem.emoji} {activeTitleItem.name}
                    </span>
                  )}
                  {user.role === "ADMIN" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Administrator
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-400 font-mono">@{user.username}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Ro&apos;yxatdan o&apos;tgan:{" "}
                    <strong className="text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Big Coupons Balance Card */}
            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-slate-900 border border-emerald-500/30 shadow-xl shadow-emerald-500/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                  💵
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Kuponlar Balansi
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                    {user.coupons} <span className="text-base text-emerald-300/80 font-sans">💵</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 font-mono">
                To&apos;g&apos;ri yechimlar uchun berilgan mukofotlar
              </div>
            </div>
          </div>
        </div>

        {/* 3 STATISTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Solved Problems */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Yechilgan Masalalar
                </span>
                <Award className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {metrics.solvedCount}
                </span>
                <span className="text-base text-slate-500 font-medium">
                  / {metrics.totalProblems} ta masala
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Platformadagi masalalarning {progressPercent}% qismi muvaffaqiyatli yechildi.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>0%</span>
                <span className="text-emerald-400 font-semibold">{progressPercent}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Submissions & Success Rate */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Urinishlar & Muvaffaqiyat
                </span>
                <Zap className="w-5 h-5 text-teal-400" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {metrics.totalSubmissions}
                </span>
                <span className="text-base text-slate-500 font-medium">
                  ta yuborilgan yechim
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {metrics.acceptanceRate}% Muvaffaqiyat
                </span>
                <span className="text-xs text-slate-400">
                  ({metrics.acceptedSubmissions} ta Accepted)
                </span>
              </div>
            </div>

            {/* Submission Stats Breakdown */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400">
                ✓ {metrics.acceptedSubmissions} AC
              </span>
              <span className="text-rose-400">
                ✗ {metrics.wrongCount} WA
              </span>
              <span className="text-amber-400">
                ⚠ {metrics.compileErrorCount} CE
              </span>
            </div>
          </div>

          {/* Card 3: Difficulties Progress */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Darajalar Bo&apos;yicha Progress
                </span>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="space-y-3 mt-1">
                {/* Oson */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span>🟢 Oson (10 💵)</span>
                    </span>
                    <span className="font-mono text-slate-300">
                      {difficultyStats.easy.solved} / {difficultyStats.easy.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${difficultyStats.easy.percent}%` }}
                    />
                  </div>
                </div>

                {/* O'rta */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <span>🟡 O&apos;rta (20 💵)</span>
                    </span>
                    <span className="font-mono text-slate-300">
                      {difficultyStats.medium.solved} / {difficultyStats.medium.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${difficultyStats.medium.percent}%` }}
                    />
                  </div>
                </div>

                {/* Qiyin */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <span>🔴 Qiyin (30 💵)</span>
                    </span>
                    <span className="font-mono text-slate-300">
                      {difficultyStats.hard.solved} / {difficultyStats.hard.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-400 h-full rounded-full transition-all"
                      style={{ width: `${difficultyStats.hard.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono text-right">
              Hammasi bo&apos;lib 9 ta algoritmik masala
            </div>
          </div>
        </div>

        {/* SECTION 1: SOLVED PROBLEMS */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                Yechilgan Masalalar
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Mening Yechgan Masalalarim</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {solvedProblems.length} ta
                </span>
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Har bir masalada yozgan kodingizni qayta ko&apos;rishingiz mumkin
            </span>
          </div>

          {solvedProblems.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">
                Hozircha hech qanday masala yechilmagan
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Masalalar bo&apos;limiga o&apos;ting, birinchi masalangizni yeching va kuponlar
                yig&apos;ishni boshlang!
              </p>
              <Link
                href="/masalalar"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
              >
                <span>Masalalar ro&apos;yxati</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="p-4">Masala</th>
                      <th className="p-4">Darajasi</th>
                      <th className="p-4">Mukofot</th>
                      <th className="p-4">Testlar</th>
                      <th className="p-4">Ijro Vaqti / Xotira</th>
                      <th className="p-4">Yechilgan Sana</th>
                      <th className="p-4 text-right">Harakat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {solvedProblems.map((prob) => {
                      const badge = getDifficultyBadge(prob.difficulty);
                      return (
                        <tr key={prob.problemId} className="hover:bg-slate-800/40 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                                #{prob.problemId}
                              </span>
                              <Link
                                href={`/masalalar/${prob.problemId}`}
                                className="font-semibold text-slate-200 hover:text-emerald-400 transition"
                              >
                                {prob.title}
                              </Link>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono font-bold text-emerald-400">
                              {prob.reward}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-300">
                            <span className="text-emerald-400 font-bold">
                              {prob.passedTests}/{prob.totalTests}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-400">
                            {prob.executionTime || 1} ms / {prob.memoryUsed || 1024} KB
                          </td>
                          <td className="p-4 text-slate-500 font-mono text-[11px]">
                            {new Date(prob.solvedAt).toLocaleDateString()} {new Date(prob.solvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedSubmission(prob)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition cursor-pointer"
                              title="Yozilgan C++ kodini ko'rish"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Kodni ko&apos;rish</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: UNSOLVED PROBLEMS */}
        {unsolvedProblems.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Kutayotgan Masalalar
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Hali Yechilmagan Masalalar</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {unsolvedProblems.length} ta
                  </span>
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Ularni yechib, hisobingizga yangi kuponlar yig&apos;ing!
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {unsolvedProblems.map((prob) => {
                const badge = getDifficultyBadge(prob.difficulty);
                return (
                  <div
                    key={prob.id}
                    className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-mono font-bold text-xs flex items-center justify-center">
                          #{prob.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                            {prob.reward}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                        {prob.title}
                      </h3>

                      <div className="mt-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                        <span>Kirish: {prob.sampleInput}</span>
                        <span className="text-emerald-400">Chiqish: {prob.sampleOutput}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        {prob.timeLimit} ms / {prob.memoryLimit} MB
                      </span>
                      <Link
                        href={`/masalalar/${prob.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition shadow-md shadow-emerald-500/10"
                      >
                        <span>Yechish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* CODE VIEWER MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Masala #{selectedSubmission.problemId}. {selectedSubmission.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sizning qabul qilingan (Accepted) C++ yechimingiz
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(selectedSubmission.code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxa olish</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Verdict Summary Bar */}
            <div className="px-5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-emerald-400">
                  Accepted ({selectedSubmission.passedTests}/{selectedSubmission.totalTests} test)
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-bold">{selectedSubmission.reward}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Vaqt: {selectedSubmission.executionTime || 1} ms | Xotira: {selectedSubmission.memoryUsed || 1024} KB
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#0b1120] font-mono text-xs select-text">
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {selectedSubmission.code}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <Link
                href={`/masalalar/${selectedSubmission.problemId}`}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Masala sahifasiga o&apos;tish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
