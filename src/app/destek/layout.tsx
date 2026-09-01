import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export const metadata = {
  title: "Castapos Destek Portali",
  description: "Customer Support and Ticket Resolution Portal",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900 text-slate-100 flex items-center justify-between px-6 sticky top-0 z-10 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/destek" className="flex items-center gap-2">
            <span className="text-blue-500 text-2xl font-black tracking-wider">CASTAPOS</span>
            <span className="text-[10px] bg-blue-900/50 text-blue-300 font-extrabold px-1.5 py-0.5 rounded border border-blue-800">DESTEK</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white hover:underline flex items-center gap-1.5 font-semibold"
          >
            <Home size={14} /> Ana Sayfa
          </Link>
          <span className="h-4 w-px bg-slate-800"></span>
          <span className="text-sm font-semibold text-slate-300">Destek Ekibi</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
