"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Eye,
  X,
  Search,
  MessageSquare,
  FileCode2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Award,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface UserStat {
  id: string;
  username: string;
  name?: string | null;
  role: string;
  coupons?: number;
  createdAt: string;
  totalSubmissions: number;
  acceptedCount: number;
  wrongCount: number;
  compileErrorCount: number;
}

interface AdminSubmission {
  id: string;
  userId: string | null;
  user?: {
    id: string;
    username: string;
    name?: string | null;
  } | null;
  problem: {
    id: number;
    title: string;
    difficulty: string;
  };
  code: string;
  language: string;
  status: string;
  passedTests: number;
  totalTests: number;
  executionTime?: number | null;
  memoryUsed?: number | null;
  outputLog?: string | null;
  createdAt: string;
}

interface AdminFeedback {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface AdminData {
  metrics: {
    totalUsers: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
    totalFeedbacks: number;
  };
  users: UserStat[];
  submissions: AdminSubmission[];
  feedbacks: AdminFeedback[];
}

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "submissions" | "feedbacks">("users");
  const [searchUser, setSearchUser] = useState("");
  const [searchSubmission, setSearchSubmission] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("all");

  // Code inspection modal state
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchAdminData = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403 || res.status === 401) {
            router.push("/login?redirect=/admin&reason=admin_required");
            return;
          }
          throw new Error("Admin ma'lumotlarini yuklab bo'lmadi");
        }
        return res.json();
      })
      .then((d) => {
        if (d) setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredUsers = data?.users.filter((u) => {
    return (
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchUser.toLowerCase()))
    );
  }) || [];

  const filteredSubmissions = data?.submissions.filter((s) => {
    const matchesUser =
      (s.user?.username && s.user.username.toLowerCase().includes(searchSubmission.toLowerCase())) ||
      s.problem.title.toLowerCase().includes(searchSubmission.toLowerCase()) ||
      s.problem.id.toString() === searchSubmission.trim();
    const matchesFilter =
      submissionFilter === "all" || s.status.toLowerCase() === submissionFilter.toLowerCase();
    return matchesUser && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Admin panel yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md">
            <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">Kirish cheklangan</h2>
            <p className="text-sm text-slate-400 mt-2">{error}</p>
            <Link
              href="/login"
              className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
            >
              Admin akkaunti orqali kirish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Boshqaruv Paneli</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Administrator Paneli
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              O&apos;quvchilar ro&apos;yxati, yuborilgan C++ yechimlari, xatolar tahlili va takliflar monitoringi.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition cursor-pointer self-start md:self-end"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ma&apos;lumotlarni yangilash</span>
          </button>
        </div>

        {/* Metrics Cards */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Jami O&apos;quvchilar</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data.metrics.totalUsers} nafar</div>
              <div className="text-[11px] text-slate-500 mt-1">Ro&apos;yxatdan o&apos;tgan foydalanuvchilar</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Jami Yechimlar</span>
                <FileCode2 className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data.metrics.totalSubmissions} ta</div>
              <div className="text-[11px] text-slate-500 mt-1">Hamma masalalar bo&apos;yicha urinishlar</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Accepted (Qabul qilingan)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{data.metrics.acceptedSubmissions} ta</div>
              <div className="text-[11px] text-slate-500 mt-1">{data.metrics.acceptanceRate}% umumiy muvaffaqiyat</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Sharh va Takliflar</span>
                <MessageSquare className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{data.metrics.totalFeedbacks} ta</div>
              <div className="text-[11px] text-slate-500 mt-1">O&apos;quvchilar fikrlari</div>
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center overflow-x-auto no-scrollbar border-b border-slate-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === "users"
                ? "border-emerald-400 text-emerald-400 bg-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>O&apos;quvchilar ({filteredUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === "submissions"
                ? "border-emerald-400 text-emerald-400 bg-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Yechimlar ({filteredSubmissions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("feedbacks")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === "feedbacks"
                ? "border-emerald-400 text-emerald-400 bg-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Takliflar ({data?.feedbacks.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: USERS LIST */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Foydalanuvchi nomi yoki ismi..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="p-4">Foydalanuvchi</th>
                      <th className="p-4">Roli</th>
                      <th className="p-4">Kuponlar</th>
                      <th className="p-4">Yechilgan Masalalar</th>
                      <th className="p-4">Jami Urinishlar</th>
                      <th className="p-4">Xatolar (WA / CE)</th>
                      <th className="p-4">Ro&apos;yxatdan o&apos;tgan vaqti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">{user.username}</div>
                              {user.name && (
                                <div className="text-[11px] text-slate-400">{user.name}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              user.role === "ADMIN"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 font-bold text-emerald-400 font-mono">
                            <span>💵</span>
                            <span>{user.coupons ?? 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                            <Award className="w-4 h-4" />
                            <span>{user.acceptedCount} ta masala</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-300">
                          {user.totalSubmissions} ta urinish
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          <span className="text-rose-400">{user.wrongCount} WA</span> /{" "}
                          <span className="text-amber-400">{user.compileErrorCount} CE</span>
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSIONS LIST WITH CODE VIEWER */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchSubmission}
                  onChange={(e) => setSearchSubmission(e.target.value)}
                  placeholder="O'quvchi yoki masala nomi bo'yicha qidirish..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <select
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="all">Barcha holatlar</option>
                <option value="accepted">Accepted (Qabul qilingan)</option>
                <option value="wrong answer">Wrong Answer (Xato)</option>
                <option value="compilation error">Compilation Error</option>
                <option value="runtime error">Runtime Error</option>
              </select>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="p-4">O&apos;quvchi</th>
                      <th className="p-4">Masala</th>
                      <th className="p-4">Holat (Verdict)</th>
                      <th className="p-4">Testlar</th>
                      <th className="p-4">Vaqt / Xotira</th>
                      <th className="p-4">Sana</th>
                      <th className="p-4 text-right">C++ Kodi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 font-semibold text-slate-200">
                          {sub.user ? sub.user.username : "Anonim"}
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/masalalar/${sub.problem.id}`}
                            className="text-slate-200 hover:text-emerald-400 font-medium transition"
                          >
                            #{sub.problem.id}. {sub.problem.title}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              sub.status === "Accepted"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : sub.status === "Wrong Answer"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {sub.status === "Accepted" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : sub.status === "Wrong Answer" ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            <span>{sub.status}</span>
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-300">
                          {sub.passedTests}/{sub.totalTests}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {sub.executionTime || 1} ms / {sub.memoryUsed || 1024} KB
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-semibold transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Kodni ko&apos;rish</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEEDBACKS LIST */}
        {activeTab === "feedbacks" && (
          <div className="space-y-4">
            {(!data?.feedbacks || data.feedbacks.length === 0) ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Hozircha hech qanday sharh kelib tushmagan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.feedbacks.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div>
                        <div className="font-bold text-sm text-white">{f.name}</div>
                        <div className="text-xs text-emerald-400 font-mono">{f.email}</div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      {f.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CODE INSPECTOR MODAL */}
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
                    {selectedSubmission.user?.username || "Anonim"} yozgan C++ kodi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Masala: #{selectedSubmission.problem.id}. {selectedSubmission.problem.title}
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
                <span className="text-slate-400">Holat:</span>
                <span
                  className={`font-bold ${
                    selectedSubmission.status === "Accepted"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {selectedSubmission.status} ({selectedSubmission.passedTests}/{selectedSubmission.totalTests} test)
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Vaqt: {selectedSubmission.executionTime || 1} ms | Xotira: {selectedSubmission.memoryUsed || 1024} KB
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs">
              <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed select-text">
                {selectedSubmission.code}
              </pre>

              {/* Error Output Log if any */}
              {selectedSubmission.outputLog && selectedSubmission.status !== "Accepted" && (
                <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <div className="font-bold mb-1">Xatolik tavsifi:</div>
                  <div>{selectedSubmission.outputLog}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
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
