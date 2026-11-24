"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Send,
  Clock,
  HardDrive,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  FileCode2,
  History,
  Info,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CodeEditor from "@/components/CodeEditor";

interface TestCase {
  id: number;
  input: string;
  output: string;
  isSample: boolean;
}

interface ProblemDetail {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  notes?: string | null;
  sampleInput: string;
  sampleOutput: string;
  testCases: TestCase[];
}

interface SubmissionItem {
  id: string;
  status: string;
  passedTests: number;
  totalTests: number;
  executionTime?: number | null;
  memoryUsed?: number | null;
  createdAt: string;
}

export default function ProblemSolvePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"statement" | "submissions">("statement");

  // Code state
  const defaultTemplate = `#include <iostream>
using namespace std;

int main() {
    // Masalani yechish kodingizni bu yerga yozing
    
    return 0;
}
`;
  const [code, setCode] = useState(defaultTemplate);

  // Console & Runner state
  const [consoleTab, setConsoleTab] = useState<"testcase" | "result">("testcase");
  const [customInput, setCustomInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [submitVerdict, setSubmitVerdict] = useState<any>(null);
  const [submitRewards, setSubmitRewards] = useState<{
    awardedCoupons: number;
    isFirstSolve: boolean;
    totalCoupons: number;
  } | null>(null);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Load problem details & verify auth
  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.currentUser) {
          router.push(`/login?redirect=/masalalar/${id}&reason=auth_required`);
          return;
        }
        if (data.problem) {
          setProblem(data.problem);
          setCustomInput(data.problem.sampleInput);
          if (data.submissions) {
            setSubmissions(data.submissions);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id, router]);

  // Load submissions
  const refreshSubmissions = () => {
    fetch(`/api/problems/${id}/submissions`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) {
          setSubmissions(data.submissions);
        }
      });
  };

  // Run handler
  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setConsoleTab("result");

    try {
      const res = await fetch(`/api/problems/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          input: customInput,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?redirect=/masalalar/${id}&reason=auth_required`);
        return;
      }
      setRunResult(data);
    } catch {
      setRunResult({
        status: "Runtime Error",
        error: "Tarmoq yoki server xatosi yuz berdi.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setConsoleTab("result");
    setSubmitVerdict(null);
    setSubmitRewards(null);

    try {
      const res = await fetch(`/api/problems/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?redirect=/masalalar/${id}&reason=auth_required`);
        return;
      }

      if (data.submission) {
        setSubmitVerdict(data.submission);
        if (data.rewards) {
          setSubmitRewards(data.rewards);
        }
        refreshSubmissions();
      } else {
        setSubmitVerdict({
          status: "Error",
          compilationError: data.error || "Xatolik yuz berdi",
        });
      }
    } catch {
      setSubmitVerdict({
        status: "Error",
        compilationError: "Tarmoq xatosi. Qaytadan urinib ko'ring.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: "input" | "output") => {
    navigator.clipboard.writeText(text);
    if (type === "input") {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Masala yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Masala topilmadi</h2>
            <Link
              href="/masalalar"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl font-semibold text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Masalalar ro&apos;yxatiga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Subheader / Breadcrumb Bar */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/masalalar"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-md hover:bg-slate-800 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Masalalar</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono font-bold text-slate-300 truncate">
            #{problem.id}. {problem.title}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full font-semibold border ${
              problem.difficulty === "O'rta"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : problem.difficulty === "Qiyin"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded-full font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {problem.difficulty === "O'rta" ? "+20 💵" : problem.difficulty === "Qiyin" ? "+30 💵" : "+10 💵"}
          </span>
          <span className="hidden sm:flex items-center gap-1 text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {problem.timeLimit} ms
          </span>
          <span className="hidden sm:flex items-center gap-1 text-slate-400 font-mono">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            {problem.memoryLimit} MB
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT COLUMN: Problem Statement & Submissions */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col h-auto max-h-[500px] lg:max-h-none lg:h-[calc(100vh-105px)] overflow-y-auto bg-slate-950/60">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 pt-2 gap-2 sticky top-0 z-10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("statement")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
                activeTab === "statement"
                  ? "border-emerald-400 text-emerald-400 bg-slate-800/60"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>Masala sharti</span>
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer ${
                activeTab === "submissions"
                  ? "border-emerald-400 text-emerald-400 bg-slate-800/60"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Urinishlar tarixi ({submissions.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 space-y-6">
            {activeTab === "statement" ? (
              <>
                {/* Title & Limits */}
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {problem.id}. {problem.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Vaqt: {problem.timeLimit} ms
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      Xotira: {problem.memoryLimit} MB
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Masala tavsifi
                  </h3>
                  <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    {problem.description}
                  </div>
                </div>

                {/* Input Format */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Kirish ma&apos;lumotlari
                  </h3>
                  <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    {problem.inputFormat}
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Chiqish ma&apos;lumotlari
                  </h3>
                  <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    {problem.outputFormat}
                  </div>
                </div>

                {/* Samples */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Namunalar (Sample Test Cases)
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Input Box */}
                      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                          <span>Kirish (stdin)</span>
                          <button
                            onClick={() => copyToClipboard(problem.sampleInput, "input")}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                          >
                            {copiedInput ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          {problem.sampleInput}
                        </pre>
                      </div>

                      {/* Output Box */}
                      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                          <span>Chiqish (stdout)</span>
                          <button
                            onClick={() => copyToClipboard(problem.sampleOutput, "output")}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                          >
                            {copiedOutput ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <pre className="font-mono text-xs text-cyan-300 whitespace-pre-wrap bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          {problem.sampleOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes / Tips */}
                {problem.notes && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>Izoh va maslahat</span>
                    </h3>
                    <div className="text-xs text-slate-300 leading-relaxed bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl">
                      {problem.notes}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Submissions History Tab */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Sizning urinishlaringiz
                  </h3>
                  <button
                    onClick={refreshSubmissions}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Yangilash
                  </button>
                </div>

                {submissions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800/80">
                    <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">
                      Hozircha hech qanday urinish yuborilmagan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {sub.status === "Accepted" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <div>
                            <span
                              className={`font-bold ${
                                sub.status === "Accepted"
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Testlar: {sub.passedTests}/{sub.totalTests}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-400 font-mono">
                          <div>{sub.executionTime || 1} ms</div>
                          <div className="text-slate-500">
                            {new Date(sub.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor, Console & Actions */}
        <div className="lg:col-span-7 flex flex-col h-auto lg:h-[calc(100vh-105px)] overflow-hidden bg-slate-950">
          {/* Top Half: Code Editor */}
          <div className="flex-1 p-3 pb-1 min-h-[350px]">
            <CodeEditor
              value={code}
              onChange={setCode}
              defaultCode={defaultTemplate}
            />
          </div>

          {/* Bottom Half: Test Case & Console Panel */}
          <div className="h-64 p-3 pt-1 flex flex-col">
            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              {/* Console Tabs */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConsoleTab("testcase")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      consoleTab === "testcase"
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Kirish ma&apos;lumoti (Testcase)</span>
                  </button>
                  <button
                    onClick={() => setConsoleTab("result")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      consoleTab === "result"
                        ? "bg-slate-800 text-emerald-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Natija va Terminal</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  {consoleTab === "testcase" ? "Standart kirish (stdin)" : "Standart chiqish (stdout)"}
                </div>
              </div>

              {/* Console Body */}
              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs">
                {consoleTab === "testcase" ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-slate-400">
                        Masala uchun kirish o&apos;zgaruvchilari:
                      </span>
                      <button
                        onClick={() => setCustomInput(problem.sampleInput)}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Namunani qaytarish
                      </button>
                    </div>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Masalan: 4 7"
                      className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Submit Verdict Display */}
                    {submitVerdict && (
                      <div
                        className={`p-3.5 rounded-xl border ${
                          submitVerdict.status === "Accepted"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {submitVerdict.status === "Accepted" ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                            <div>
                              <span className="text-sm font-bold">
                                {submitVerdict.status === "Accepted"
                                  ? "Accepted (Qabul qilindi!) 🎉"
                                  : submitVerdict.status === "Wrong Answer"
                                  ? `Wrong Answer (Test #${submitVerdict.failedTestCaseIndex} da xato) ❌`
                                  : submitVerdict.status}
                              </span>
                              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                                Testlar: {submitVerdict.passedTests}/{submitVerdict.totalTests} ta o&apos;tdi
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-[11px] font-mono text-slate-400">
                            <div>Vaqt: {submitVerdict.executionTime || 1} ms</div>
                            <div>Xotira: {submitVerdict.memoryUsed || 1024} KB</div>
                          </div>
                        </div>

                        {/* First-time solve coupon reward celebration */}
                        {submitRewards && submitRewards.awardedCoupons > 0 ? (
                          <div className="mt-3 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-between text-xs font-semibold text-emerald-200">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎉</span>
                              <span>Birinchi marta to&apos;g&apos;ri yechildi! Mukofot:</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-400 font-mono">+{submitRewards.awardedCoupons} 💵</span>
                          </div>
                        ) : submitVerdict.status === "Accepted" && submitRewards && !submitRewards.isFirstSolve ? (
                          <div className="mt-2.5 text-[11px] text-slate-400 font-mono">
                            ℹ️ Ushbu masala avval to&apos;g&apos;ri yechilgan. Kupon faqat birinchi muvaffaqiyatli yechimda beriladi.
                          </div>
                        ) : null}

                        {/* Error info if compile error */}
                        {submitVerdict.compilationError && (
                          <div className="mt-3 p-2 bg-slate-950 rounded-lg border border-rose-500/20 text-rose-300 text-xs font-mono whitespace-pre-wrap">
                            {submitVerdict.compilationError}
                          </div>
                        )}

                        {/* Test case diff for Wrong Answer */}
                        {submitVerdict.failedInput && (
                          <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-2 text-xs font-mono">
                            <div>
                              <span className="text-slate-400">Kirish: </span>
                              <span className="text-slate-200">{submitVerdict.failedInput}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Kutilgan chiqish: </span>
                              <span className="text-emerald-400">{submitVerdict.failedExpected}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Sizning chiqishingiz: </span>
                              <span className="text-rose-400">{submitVerdict.failedActual || "(bo'sh)"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Run Result Display */}
                    {runResult && !submitVerdict && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              runResult.status === "Accepted"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {runResult.status}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Vaqt: {runResult.executionTime} ms | Xotira: {runResult.memory} KB
                          </span>
                        </div>

                        {runResult.error ? (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 whitespace-pre-wrap">
                            {runResult.error}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200">
                            <div className="text-[10px] uppercase text-slate-500 mb-1">
                              Chiqish:
                            </div>
                            <pre className="text-emerald-300 whitespace-pre-wrap">
                              {runResult.output || "(Hech narsa chiqarilmadi)"}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {!runResult && !submitVerdict && (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                        Kodni sinash uchun &apos;Ishga tushirish (Run)&apos; yoki &apos;Tekshirish (Submit)&apos; tugmasini bosing
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer Bar */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                C++17 Tayyor
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Run Button */}
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 disabled:opacity-50 transition cursor-pointer shadow-md"
              >
                {isRunning ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                )}
                <span>Run</span>
              </button>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-slate-950 disabled:opacity-50 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
