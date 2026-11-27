import type { Metadata } from "next";
import "./globals.css";
import AdminDeviceSimulator from "@/components/AdminDeviceSimulator";
import MobileBottomDock from "@/components/MobileBottomDock";
import { ThemeProvider } from "@/context/ThemeContext";

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
    <html lang="uz" className="dark h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white pb-16 md:pb-0">
        <ThemeProvider>
          {children}
          <MobileBottomDock />
          <AdminDeviceSimulator />
        </ThemeProvider>
      </body>
    </html>
  );
}
