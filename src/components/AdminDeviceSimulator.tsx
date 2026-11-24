"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Smartphone,
  RotateCw,
  X,
  ExternalLink,
  ChevronDown,
  Monitor,
  Sparkles,
} from "lucide-react";

export interface DeviceModel {
  id: string;
  name: string;
  width: number;
  height: number;
  notchType: "dynamic-island" | "notch";
}

export const IPHONE_MODELS: DeviceModel[] = [
  { id: "xs", name: "iPhone XS / 11 Pro", width: 375, height: 812, notchType: "notch" },
  { id: "xr", name: "iPhone XR / 11", width: 414, height: 896, notchType: "notch" },
  { id: "12", name: "iPhone 12 / 13 / 14", width: 390, height: 844, notchType: "notch" },
  { id: "12pm", name: "iPhone 12 / 13 / 14 Pro Max", width: 428, height: 926, notchType: "notch" },
  { id: "15", name: "iPhone 15 / 16 / 17", width: 393, height: 852, notchType: "dynamic-island" },
  { id: "15pm", name: "iPhone 15 / 16 Pro Max", width: 430, height: 932, notchType: "dynamic-island" },
  { id: "17pm", name: "iPhone 17 / 18 Pro Max", width: 440, height: 956, notchType: "dynamic-island" },
];

export const OPEN_DEVICE_SIMULATOR_EVENT = "ndtu:open-device-simulator";

export function openDeviceSimulator(modelId?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(OPEN_DEVICE_SIMULATOR_EVENT, {
        detail: { modelId: modelId || "15" },
      })
    );
  }
}

export default function AdminDeviceSimulator() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>("15");
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("/");
  const pathname = usePathname();

  const checkAdminAuth = () => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Auth failed");
        return res.json();
      })
      .then((data) => {
        if (
          data &&
          data.user &&
          (data.user.role === "ADMIN" || data.user.username?.toLowerCase() === "admin")
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false));
  };

  useEffect(() => {
    checkAdminAuth();
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname + window.location.search);
    }
  }, [pathname]);

  useEffect(() => {
    const handleOpenEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ modelId?: string }>;
      if (customEvent.detail?.modelId) {
        setSelectedModelId(customEvent.detail.modelId);
      }
      if (typeof window !== "undefined") {
        setCurrentUrl(window.location.pathname + window.location.search);
      }
      setIsActive(true);
    };

    window.addEventListener(OPEN_DEVICE_SIMULATOR_EVENT, handleOpenEvent);
    return () => {
      window.removeEventListener(OPEN_DEVICE_SIMULATOR_EVENT, handleOpenEvent);
    };
  }, []);

  // If not admin, strictly render NOTHING in the DOM
  if (!isAdmin) {
    return null;
  }

  const selectedModel =
    IPHONE_MODELS.find((m) => m.id === selectedModelId) || IPHONE_MODELS[4];

  const deviceWidth = isLandscape ? selectedModel.height : selectedModel.width;
  const deviceHeight = isLandscape ? selectedModel.width : selectedModel.height;

  return (
    <>
      {/* Floating Button in bottom-right corner for Admin across all pages */}
      {!isActive && (
        <button
          onClick={() => {
            setCurrentUrl(window.location.pathname + window.location.search);
            setIsActive(true);
          }}
          className="fixed bottom-5 right-5 z-[999] flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-xs shadow-2xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 backdrop-blur-md"
          title="Admin iPhone Qurilma Simulyatori"
        >
          <Smartphone className="w-4 h-4 text-pink-200 animate-pulse" />
          <span>Device Preview</span>
          <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-mono text-purple-200">
            ADMIN
          </span>
        </button>
      )}

      {/* Simulator Modal & Frame */}
      {isActive && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between overflow-hidden animate-in fade-in duration-200 select-none">
          {/* Top Control Toolbar */}
          <header className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl z-20">
            {/* Left: Branding & Model selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>iPhone Simulyator</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                      ADMIN ONLY
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {deviceWidth} x {deviceHeight} px ({isLandscape ? "Landscape" : "Portrait"})
                  </div>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-800 hidden sm:block" />

              {/* Model Dropdown */}
              <div className="relative">
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {IPHONE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.width}x{model.height})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Middle: Fast Page Navigation Links inside preview */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 mr-1">Sahifalar:</span>
              {[
                { label: "Bosh sahifa", path: "/" },
                { label: "Masalalar", path: "/masalalar" },
                { label: "IDE Masala #1", path: "/masalalar/1" },
                { label: "Kompilyator", path: "/compiler" },
                { label: "Do'kon", path: "/store" },
                { label: "Profil", path: "/profile" },
                { label: "Admin", path: "/admin" },
              ].map((p) => (
                <button
                  key={p.path}
                  onClick={() => setCurrentUrl(p.path)}
                  className={`px-2 py-1 rounded-lg transition font-medium cursor-pointer ${
                    currentUrl === p.path
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Right: Controls (Rotate, Close) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLandscape(!isLandscape)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                title="Aylantirish (Portrait / Landscape)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotate</span>
              </button>

              <button
                onClick={() => setIsActive(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition cursor-pointer"
                title="Simulyatorni yopish"
              >
                <X className="w-4 h-4" />
                <span>Yopish</span>
              </button>
            </div>
          </header>

          {/* Device Showcase Stage */}
          <main className="flex-1 w-full overflow-auto flex items-center justify-center p-4 sm:p-8">
            {/* Realistic iPhone Bezel Body */}
            <div
              style={{
                width: `${deviceWidth + 24}px`,
                height: `${deviceHeight + 24}px`,
                maxWidth: "100%",
                maxHeight: "calc(100vh - 120px)",
              }}
              className="relative bg-slate-900 border-[10px] border-slate-800 rounded-[52px] shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.25)] flex flex-col overflow-hidden transition-all duration-300 shrink-0"
            >
              {/* Device Frame Glass Bezel Accent */}
              <div className="absolute inset-0 rounded-[42px] border border-white/10 pointer-events-none z-30" />

              {/* Dynamic Island / Notch at top */}
              {!isLandscape && (
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex items-center justify-center">
                  {selectedModel.notchType === "dynamic-island" ? (
                    <div className="w-28 h-6 bg-black rounded-full flex items-center justify-end pr-2.5 shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                    </div>
                  ) : (
                    <div className="w-36 h-5 bg-black rounded-b-2xl flex items-center justify-center gap-2 shadow-md">
                      <div className="w-10 h-1 bg-slate-800 rounded-full" />
                      <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                    </div>
                  )}
                </div>
              )}

              {/* Iframe Hosting the live platform */}
              <div className="flex-1 w-full h-full bg-slate-950 overflow-hidden relative rounded-[38px]">
                <iframe
                  src={currentUrl}
                  title="iPhone Device Preview"
                  className="w-full h-full border-none bg-slate-950"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full pointer-events-none z-40" />
            </div>
          </main>
        </div>
      )}
    </>
  );
}
