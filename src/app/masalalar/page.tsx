"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  HardDrive,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Filter,
  Coins,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ProblemItem {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  isSolved: boolean;
  isAttempted: boolean;
  _count: {
    submissions: number;
  };
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  useEffect(() => {
    fetch("/api/problems")
      .then((res) => res.json())
      .then((data) => {
        if (data.problems) {
          setProblems(data.problems);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "oson":
        return {
          label: "Oson",
          reward: "+10 💵",
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          rewardClass: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "o'rta":
      case "orta":
        return {
          label: "O'rta",
          reward: "+20 💵",
          className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          rewardClass: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "qiyin":
        return {
          label: "Qiyin",
          reward: "+30 💵",
          className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          rewardClass: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
        };
      default:
        return {
          label: difficulty,
          reward: "+10 💵",
          className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          rewardClass: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString().includes(search.trim());
    const matchesDifficulty =
      filterDifficulty === "all" ||
      p.difficulty.toLowerCase().includes(filterDifficulty.toLowerCase());
    return matchesSearch && matchesDifficulty;
  });

  const filterTabs = [
    { key: "all", label: "Barchasi" },
    { key: "oson", label: "Oson (+10 💵)" },
    { key: "o'rta", label: "O'rta (+20 💵)" },
    { key: "qiyin", label: "Qiyin (+30 💵)" },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Hero Card */}
        <div className="glass-bento rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>C++ Masalalar Banki</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Dasturlash Masalalari
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed">
                Masalalarni to&apos;g&apos;ri yechib kuponlar (💵) yig&apos;ing: Oson (+10 💵), O&apos;rta (+20 💵), Qiyin (+30 💵)!
              </p>
            </div>

            {/* Quick Stats Bento */}
            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl border transition-all bg-white/90 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Jami masalalar</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{problems.length} ta</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Horizontal Pill Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          {/* Horizontal Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterDifficulty(tab.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                  filterDifficulty === tab.key
                    ? "bg-emerald-600 dark:bg-emerald-400 text-white dark:text-slate-950 scale-105"
                    : "glass-bento text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish (nomi yoki raqami)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border focus:outline-none transition bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* Problems Bento Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 glass-bento rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-16 glass-bento rounded-3xl">
            <HelpCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">Masala topilmadi</h3>
            <p className="text-sm text-slate-500 mt-1">
              Qidiruv so&apos;zini yoki filtrni o&apos;zgartirib ko&apos;ring
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProblems.map((problem) => {
              const badge = getDifficultyBadge(problem.difficulty);

              return (
                <div
                  key={problem.id}
                  className="glass-bento rounded-3xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Status Badge */}
                    <div className="flex-shrink-0 mt-0.5">
                      {problem.isSolved ? (
                        <div
                          className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm"
                          title="Yechilgan"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : problem.isAttempted ? (
                        <div
                          className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs shadow-sm"
                          title="Urinilgan"
                        >
                          TRY
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-400 font-mono text-sm font-bold shadow-sm">
                          #{problem.id}
                        </div>
                      )}
                    </div>

                    {/* Problem Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          href={`/masalalar/${problem.id}`}
                          className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate"
                        >
                          {problem.title}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Difficulty badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                        >
                          {badge.label}
                        </span>

                        {/* Reward badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${badge.rewardClass}`}
                        >
                          {badge.reward}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Limits + CTA Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {problem.timeLimit} ms
                      </span>
                      <span className="flex items-center gap-1 hidden xs:flex">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                        {problem.memoryLimit} MB
                      </span>
                    </div>

                    <Link
                      href={`/masalalar/${problem.id}`}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-bold transition-all bg-emerald-600 dark:bg-emerald-400 hover:bg-emerald-500 dark:hover:bg-emerald-300 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      <span>Yechish</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
