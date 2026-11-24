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
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          rewardClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "o'rta":
      case "orta":
        return {
          label: "O'rta",
          reward: "+20 💵",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          rewardClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "qiyin":
        return {
          label: "Qiyin",
          reward: "+30 💵",
          className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          rewardClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        };
      default:
        return {
          label: difficulty,
          reward: "+10 💵",
          className: "bg-slate-800 text-slate-300 border-slate-700",
          rewardClass: "text-slate-300 bg-slate-800 border-slate-700",
        };
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString() === search.trim();
    const matchesDifficulty =
      filterDifficulty === "all" ||
      p.difficulty.toLowerCase().includes(filterDifficulty.toLowerCase());
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>C++ Masalalar Banki</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Dasturlash Masalalari
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Masalalarni to&apos;g&apos;ri yechib kuponlar (💵) yig&apos;ing: Oson (+10 💵), O&apos;rta (+20 💵), Qiyin (+30 💵)!
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-xs text-slate-400">Jami masalalar</div>
                <div className="text-lg font-bold text-slate-100">{problems.length} ta</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Masala nomi yoki raqami bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
            >
              <option value="all">Barcha darajalar</option>
              <option value="oson">Oson (+10 💵)</option>
              <option value="o'rta">O&apos;rta (+20 💵)</option>
              <option value="qiyin">Qiyin (+30 💵)</option>
            </select>
          </div>
        </div>

        {/* Problems Table / Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">Masala topilmadi</h3>
            <p className="text-sm text-slate-500 mt-1">
              Qidiruv so&apos;zini yoki filtrni o&apos;zgartirib ko&apos;ring
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/80">
              {filteredProblems.map((problem) => {
                const badge = getDifficultyBadge(problem.difficulty);

                return (
                  <div
                    key={problem.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition group"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Status Badge */}
                      <div className="mt-0.5 sm:mt-0 flex-shrink-0">
                        {problem.isSolved ? (
                          <div
                            className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
                            title="Yechilgan"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : problem.isAttempted ? (
                          <div
                            className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs"
                            title="Urinilgan"
                          >
                            TRY
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 font-mono text-sm font-bold">
                            #{problem.id}
                          </div>
                        )}
                      </div>

                      {/* Problem Info */}
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Link
                            href={`/masalalar/${problem.id}`}
                            className="font-semibold text-base text-slate-100 hover:text-emerald-400 transition"
                          >
                            {problem.title}
                          </Link>

                          {/* Difficulty badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>

                          {/* Reward badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border font-mono ${badge.rewardClass}`}
                          >
                            {badge.reward}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {problem.timeLimit} ms
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                            {problem.memoryLimit} MB
                          </span>
                          <span className="text-slate-500">
                            {problem._count.submissions} ta urinish
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Link
                        href={`/masalalar/${problem.id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 group-hover:bg-emerald-500 text-slate-200 group-hover:text-slate-950 border border-slate-700 group-hover:border-emerald-400 shadow-md transition"
                      >
                        <span>Yechish</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
