"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3, FileText, CalendarClock, Package, CreditCard, ShoppingBag,
  FolderTree, Users, Menu, X, ChevronLeft, ChevronRight, Home, LogOut, Sun, Moon,
  MessageCircle, Calendar, Star, Settings, Tag
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const adminName = session?.user?.name || "Yönetici";
  const adminEmail = session?.user?.email || "";
  const adminInitials = adminName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: BarChart3, href: "/admin" },
    { label: "Siparişler", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Sözleşmeler", icon: FileText, href: "/admin/agreements" },
    { label: "Taksitler & Kasa", icon: CalendarClock, href: "/admin/installments" },
    { label: "Takvim", icon: Calendar, href: "/admin/takvim" },
    { label: "Ürünler & Stok", icon: Package, href: "/admin/products" },
    { label: "Kategoriler", icon: FolderTree, href: "/admin/categories" },
    { label: "Kampanyalar", icon: Tag, href: "/admin/kampanyalar" },
    { label: "Değerlendirmeler", icon: Star, href: "/admin/degerlendirmeler" },
    { label: "Kullanıcılar", icon: Users, href: "/admin/users" },
    { label: "Ödeme Kayıtları", icon: CreditCard, href: "/admin/payments" },
    { label: "Canlı Destek", icon: MessageCircle, href: "/admin/canli-destek" },
    { label: "Site Ayarları", icon: Settings, href: "/admin/ayarlar" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  const currentLabel = menuItems.find((item) => isActive(item.href))?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-[#0b1220] flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Mobile Navbar Header */}
      <header className="md:hidden h-16 bg-[var(--navy)] border-b border-white/10 flex items-center justify-between px-4 text-white z-30">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-sm shadow-lg shadow-orange-500/30">C</span>
          <span className="text-lg font-black tracking-wider">CASTAPOS</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/15 transition"
          aria-label="Menüyü Aç/Kapat"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Drawer for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 md:z-10 bg-gradient-to-b from-[#0d1526] via-[var(--navy)] to-[#080c15] text-slate-100 flex flex-col border-r border-white/[0.06] shadow-[8px_0_40px_rgba(6,10,20,0.25)] transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-[84px]" : "md:w-64"}
        `}
      >
        {/* Brand logo & Desktop collapse button */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.06] justify-between relative shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-orange-500/30">
              C
            </span>
            {!isCollapsed && (
              <span className="text-white text-xl font-black tracking-wider transition-all overflow-hidden">CASTAPOS</span>
            )}
          </Link>

          {/* Desktop Collapse Trigger — absolute konumu koruyoruz (daraltılmış
              84px'lik sidebar'da logo ile yan yana sığmıyor), ama eskiden
              -right-3 ile header'ın sağ kenarından dışarı taşıp dar
              pencerede yarısı kesik görünüyordu. Artık header sınırının
              içinde (right-2) duruyor, hiçbir zaman kesilmiyor. */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute right-2 top-4 w-8 h-8 bg-orange-500 text-white rounded-full items-center justify-center hover:bg-orange-600 transition shadow-lg shadow-orange-500/40 border-2 border-[var(--navy)]"
            aria-label={isCollapsed ? "Genişlet" : "Daralt"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3.5 mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Menü</p>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : ""}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm group relative
                    ${active
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    }
                    ${isCollapsed ? "justify-center px-0" : ""}
                  `}
                >
                  <span
                    className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors
                      ${active ? "bg-white/15" : "bg-white/[0.04] group-hover:bg-white/[0.08]"}
                    `}
                  >
                    <item.icon size={16} className="shrink-0" />
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer profile */}
        <div className={`p-3 border-t border-white/[0.06] shrink-0`}>
          <div
            className={`flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 overflow-hidden
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white text-xs ring-2 ring-orange-500/20">
              {adminInitials || "AD"}
            </div>
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 block truncate">{adminName}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{adminEmail}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Çıkış Yap"
                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition"
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area — "admin-shell" scopes the dark-mode CSS overrides in
          globals.css to just the topbar + page content, leaving the sidebar
          (already permanently dark navy) untouched. */}
      <div className="admin-shell flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white/85 dark:bg-[#0f172a]/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">Yönetim Paneli</p>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Gündüz moduna geç" : "Gece moduna geç"}
              title={theme === "dark" ? "Gündüz modu" : "Gece modu"}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/"
              className="text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg border border-orange-100 dark:border-orange-900/40 transition"
            >
              <Home size={13} /> Mağaza Anasayfası
            </Link>
            <span className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></span>
            <div className="items-center gap-2 hidden sm:flex">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white text-[10px]">
                {adminInitials || "AD"}
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Hoş Geldiniz, {adminName.split(" ")[0]}</span>
            </div>
          </div>
        </header>

        {/* Children components render */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#f6f7fb] dark:bg-[#0b1220]">
          {children}
        </main>
      </div>
    </div>
  );
}
