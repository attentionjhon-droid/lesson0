"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Sparkles,
  User,
  Star,
  CheckCircle2,
  XCircle,
  Lock,
  Zap,
  Crown,
  Palette,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { STORE_ITEMS, StoreItem, ItemCategory } from "@/lib/storeItems";

interface StoreData {
  coupons: number;
  purchasedItems: string[];
  activeNameAnim: string | null;
  activeAvatarFrame: string | null;
  activeTitle: string | null;
}

type TabKey = "all" | ItemCategory;

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "Hammasi", icon: <ShoppingBag className="w-4 h-4" /> },
  { key: "nameAnim", label: "Ism Animatsiyalari", icon: <Sparkles className="w-4 h-4" /> },
  { key: "avatarFrame", label: "Avatar Ramkalari", icon: <User className="w-4 h-4" /> },
  { key: "title", label: "Unvonlar", icon: <Crown className="w-4 h-4" /> },
];

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  nameAnim: "Ism Animatsiyasi",
  avatarFrame: "Avatar Ramkasi",
  title: "Unvon (Badge)",
};

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md text-sm font-semibold transition-all
        ${type === "success"
          ? "bg-emerald-900/90 border-emerald-500/40 text-emerald-300"
          : "bg-rose-900/90 border-rose-500/40 text-rose-300"
        }`}
    >
      {type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer">✕</button>
    </div>
  );
}

function AvatarPreview({ cssClass, initials }: { cssClass: string; initials: string }) {
  return (
    <div className="relative w-16 h-16 mx-auto">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 relative z-10 ${cssClass}`}
      >
        {initials}
      </div>
    </div>
  );
}

export default function StorePage() {
  const router = useRouter();
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [username, setUsername] = useState("U");

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/store");
      if (res.status === 401) { router.push("/login"); return; }
      const json = await res.json();
      setData(json);
    } catch {
      showToast("Ma'lumotlar yuklanmadi", "error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => { if (d.user?.username) setUsername(d.user.username.slice(0, 2).toUpperCase()); });
  }, [fetchData]);

  const doAction = async (action: "buy" | "equip" | "unequip", item?: StoreItem, category?: ItemCategory) => {
    if (!item && action !== "unequip") return;
    const key = item?.id ?? category ?? "?";
    setBusy(key);
    try {
      const body: Record<string, string> = { action };
      if (item) body.itemId = item.id;
      if (action === "unequip" && category) body.category = category;

      const res = await fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Xato yuz berdi", "error");
      } else {
        if (action === "buy") showToast(`"${item!.name}" sotib olindi! 🎉`, "success");
        else if (action === "equip") showToast(`"${item!.name}" faollashtirildi ✓`, "success");
        else showToast("O'chirildi", "success");
        await fetchData();
      }
    } catch {
      showToast("Server bilan aloqa xatosi", "error");
    } finally {
      setBusy(null);
    }
  };

  const getActiveId = (category: ItemCategory) => {
    if (!data) return null;
    if (category === "nameAnim") return data.activeNameAnim;
    if (category === "avatarFrame") return data.activeAvatarFrame;
    return data.activeTitle;
  };

  const filteredItems = STORE_ITEMS.filter(i => tab === "all" || i.category === tab);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <span className="text-slate-400 text-sm">Do'kon yuklanmoqda…</span>
        </div>
      </div>
      <Footer />
    </div>
  );

  const activeEquips = {
    nameAnim: data?.activeNameAnim ? STORE_ITEMS.find(i => i.id === data.activeNameAnim) : null,
    avatarFrame: data?.activeAvatarFrame ? STORE_ITEMS.find(i => i.id === data.activeAvatarFrame) : null,
    title: data?.activeTitle ? STORE_ITEMS.find(i => i.id === data.activeTitle) : null,
  };
  const anyEquipped = Object.values(activeEquips).some(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#10b98130_0%,_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-5">
            <ShoppingBag className="w-3.5 h-3.5" /> NDTU Do'koni
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Kuponlaringizni{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">sarflang</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
            Masalalarni yechib yig'ilgan kuponlar bilan profilingizni bezatuvchi animatsiyalar, ramkalar va unvonlar sotib oling.
          </p>

          {/* Balance card */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl">
            <div className="text-3xl">💵</div>
            <div className="text-left">
              <div className="text-xs text-slate-400 font-medium">Joriy balans</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{data?.coupons ?? 0}</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-left">
              <div className="text-xs text-slate-400 font-medium">Sotib olingan</div>
              <div className="text-2xl font-extrabold text-teal-400 font-mono">{data?.purchasedItems.length ?? 0}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Active Cosmetics summary ── */}
      {anyEquipped && (
        <div className="max-w-5xl mx-auto w-full px-4 pt-6">
          <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest shrink-0">Faol kosmetika:</span>
            {activeEquips.nameAnim && (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className={`text-sm font-bold ${activeEquips.nameAnim.cssClass}`}>{activeEquips.nameAnim.name}</span>
                <button
                  onClick={() => doAction("unequip", undefined, "nameAnim")}
                  className="text-slate-500 hover:text-rose-400 ml-1 text-xs cursor-pointer"
                >✕</button>
              </div>
            )}
            {activeEquips.avatarFrame && (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-sm font-semibold text-white">{activeEquips.avatarFrame.emoji} {activeEquips.avatarFrame.name}</span>
                <button
                  onClick={() => doAction("unequip", undefined, "avatarFrame")}
                  className="text-slate-500 hover:text-rose-400 ml-1 text-xs cursor-pointer"
                >✕</button>
              </div>
            )}
            {activeEquips.title && (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className={activeEquips.title.cssClass}>{activeEquips.title.emoji} {activeEquips.title.name}</span>
                <button
                  onClick={() => doAction("unequip", undefined, "title")}
                  className="text-slate-500 hover:text-rose-400 ml-1 text-xs cursor-pointer"
                >✕</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-8">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer
                ${tab === t.key
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                }`}
            >
              {t.icon}
              {t.label}
              {t.key !== "all" && (
                <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">
                  {STORE_ITEMS.filter(i => i.category === t.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category sections */}
        {(["nameAnim", "avatarFrame", "title"] as ItemCategory[]).map(cat => {
          const catItems = filteredItems.filter(i => i.category === cat);
          if (catItems.length === 0) return null;
          const catIcon = cat === "nameAnim" ? <Sparkles className="w-4 h-4 text-cyan-400" /> : cat === "avatarFrame" ? <User className="w-4 h-4 text-teal-400" /> : <Crown className="w-4 h-4 text-amber-400" />;
          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                {catIcon}
                <h2 className="text-base font-bold text-slate-200">{CATEGORY_LABELS[cat]}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catItems.map(item => {
                  const purchased = data?.purchasedItems.includes(item.id) ?? false;
                  const activeId = getActiveId(item.category);
                  const isActive = activeId === item.id;
                  const canAfford = (data?.coupons ?? 0) >= item.price;
                  const isBusy = busy === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition
                        ${isActive
                          ? "bg-emerald-900/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                          : purchased
                          ? "bg-slate-900/80 border-slate-700/60"
                          : "bg-slate-900/50 border-slate-800/60 hover:border-slate-700"
                        }`}
                    >
                      {/* Active badge */}
                      {isActive && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Faol
                        </div>
                      )}
                      {/* Purchased badge */}
                      {purchased && !isActive && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Sizniki
                        </div>
                      )}

                      {/* Live Preview */}
                      <div className="flex flex-col items-center gap-3 bg-slate-950/60 rounded-xl p-4 min-h-[100px] justify-center">
                        {item.category === "nameAnim" && (
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-2">Ko'rinishi:</div>
                            <span className={`text-lg font-extrabold ${item.cssClass}`}>
                              {item.previewText ?? item.name}
                            </span>
                          </div>
                        )}
                        {item.category === "avatarFrame" && (
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-3">Ko'rinishi:</div>
                            <AvatarPreview cssClass={item.cssClass} initials={username} />
                          </div>
                        )}
                        {item.category === "title" && (
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-3">Ko'rinishi:</div>
                            <span className={item.cssClass}>{item.emoji} {item.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Item info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{item.emoji}</span>
                          <span className="text-sm font-bold text-white">{item.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                      </div>

                      {/* Price + Action */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">💵</span>
                          <span className={`font-mono font-bold text-sm ${purchased ? "text-slate-500 line-through" : canAfford ? "text-amber-400" : "text-rose-400"}`}>
                            {item.price}
                          </span>
                          {!purchased && !canAfford && (
                            <span className="text-[10px] text-rose-400/70 font-medium">(yetmaydi)</span>
                          )}
                        </div>

                        {/* Action button */}
                        {!purchased ? (
                          <button
                            onClick={() => doAction("buy", item)}
                            disabled={!canAfford || isBusy}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer
                              ${canAfford
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                              }`}
                          >
                            {isBusy ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : canAfford ? (
                              <><ShoppingBag className="w-3.5 h-3.5" /> Sotib olish</>
                            ) : (
                              <><Lock className="w-3.5 h-3.5" /> Kupon yetarli emas</>
                            )}
                          </button>
                        ) : isActive ? (
                          <button
                            onClick={() => doAction("unequip", undefined, item.category)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
                          >
                            {isBusy ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> Faol ✓</>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => doAction("equip", item)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30 hover:bg-teal-500/25 transition cursor-pointer"
                          >
                            {isBusy ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <><Zap className="w-3.5 h-3.5" /> Faollashtirish</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Palette className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Bu kategoriyada buyumlar mavjud emas</p>
          </div>
        )}

        {/* Info tip */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 flex items-start gap-3">
          <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Kuponlarni yig&apos;ish uchun{" "}
            <Link href="/masalalar" className="text-emerald-400 hover:underline">masalalar</Link>{" "}
            bo&apos;limiga o&apos;ting. Oson masalalar <span className="text-emerald-400 font-semibold">+10 💵</span>,
            O&apos;rta <span className="text-amber-400 font-semibold">+20 💵</span>,
            Qiyin <span className="text-rose-400 font-semibold">+30 💵</span> beradi.
          </p>
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <Footer />
    </div>
  );
}
