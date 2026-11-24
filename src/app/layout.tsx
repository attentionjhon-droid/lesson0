import type { Metadata } from "next";
import "./globals.css";
import AdminDeviceSimulator from "@/components/AdminDeviceSimulator";

export const metadata: Metadata = {
  title: "NDTU Coding Platform - C++ Dasturlash Masalalari",
  description: "NDTU Coding Platform - C++ dasturlash bo'yicha masalalarni yechish va bilimlarni oshirish platformasi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        {children}
        <AdminDeviceSimulator />
      </body>
    </html>
  );
}
