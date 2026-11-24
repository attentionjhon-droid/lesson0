import Link from "next/link";
import {
  Code2,
  Terminal,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Coins,
  Award,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const problems = await prisma.problem.findMany({
    orderBy: { id: "asc" },
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>NDTU Coding Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            C++ Dasturlash Masalalarini{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Onlayn Yeching
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            NDTU Coding Platform — C++ dasturlash bo&apos;yicha boshlang&apos;ich, o&apos;rta va murakkab masalalarni yeching va har bir to&apos;g&apos;ri yechim uchun kuponlar (💵) yig&apos;ing!
          </p>

          {/* Rewards banner pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5">
              <span>🟢 Oson masalalar:</span>
              <strong className="text-emerald-400">+10 💵</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5">
              <span>🟡 O&apos;rta masalalar:</span>
              <strong className="text-amber-400">+20 💵</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1.5">
              <span>🔴 Qiyin masalalar:</span>
              <strong className="text-rose-400">+30 💵</strong>
            </span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/masalalar"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/25 transition active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Masalalarni yechish (9 ta masala)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/compiler"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Onlayn Kompilyator</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition"
            >
              <span>Ro&apos;yxatdan o&apos;tish</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured 9 Problems Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-1">
              Masalalar Banki (9 ta masala)
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Oson, O&apos;rta va Qiyin Bosqichlar
            </h2>
          </div>
          <Link
            href="/masalalar"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
          >
            <span>Barcha masalalar ro&apos;yxati</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem) => {
            const badge = getDifficultyBadge(problem.difficulty);

            return (
              <div
                key={problem.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700/80 hover:bg-slate-900/90 transition shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                      #{problem.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border ${badge.rewardClass}`}>
                        {badge.reward}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                    {problem.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {problem.description}
                  </p>

                  {/* Sample preview box */}
                  <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Kirish: {problem.sampleInput}</span>
                      <span className="text-emerald-400">Chiqish: {problem.sampleOutput}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">
                    {problem.timeLimit} ms / {problem.memoryLimit} MB
                  </span>
                  <Link
                    href={`/masalalar/${problem.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 group-hover:bg-emerald-400 text-slate-200 group-hover:text-slate-950 transition"
                  >
                    <span>Yechish</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-white">Platforma Imkoniyatlari</h2>
            <p className="text-sm text-slate-400 mt-2">
              Dasturlashni o&apos;rganuvchilar uchun qulay, tezkor va rag&apos;batlantiruvchi online judge tizimi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <span className="text-xl">💵</span>
              </div>
              <h3 className="font-bold text-white mb-2">Kupon va Mukofot Tizimi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Har bir masalani birinchi marta to&apos;g&apos;ri yechganingizda darajaga qarab kuponlar beriladi: Oson (+10), O&apos;rta (+20), Qiyin (+30).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white mb-2">Qulay C++ Kod Muharriri</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Qator raqamlari, Tab (4 bo&apos;sh joy) qo&apos;llab-quvvatlash, shablonni tiklash va matn o&apos;lchamini o&apos;zgartirish imkoniyatlari.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white mb-2">Avtorizatsiya va Xavfsizlik</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Foydalanuvchi hisobi, xavfsiz sessiya, masalalarni ishlash uchun majburiy avtorizatsiya va Administrator paneli.
              </p>
            </div>
          </div>
        </div>
      </section>
{/* Platforma yaratuvchisi haqida */}
<section className="max-w-5xl mx-auto px-4 py-12">
  <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-6 md:p-8 backdrop-blur-sm">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
          Platforma yaratuvchisi
        </span>
        <h3 className="text-2xl font-bold text-white">
          Jumabayev Ozodbek
        </h3>
        <p className="text-sm text-emerald-300/90 font-medium">
          Nukus davlat texnika universiteti • Sun&apos;iy intellekt fakulteti • 104-26 Dasturiy injiniring (1-kurs)
        </p>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed pt-1">
          Ushbu platforma talabalarga C++ dasturlash tilini amaliy masalalar, tezkor onlayn kompilyator va rag&apos;batlantiruvchi kuponlar tizimi orqali oson hamda qiziqarli o&apos;rganishga yordam berish maqsadida yaratilgan.
        </p>
      </div>
    </div>
  </div>
</section>
      <Footer />
    </div>
  );
}
