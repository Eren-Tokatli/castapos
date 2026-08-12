"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronLeft, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useRef, useState } from "react";
import { ACCOUNT_MENU_LINKS } from "@/lib/account-menu";

export { ACCOUNT_MENU_LINKS };

export function AccountShell({
  displayName,
  email,
  children,
}: {
  displayName: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Dar ekranda menü yatay kaydırmalı bara dönüşüyor; dokunmatikte parmakla
  // kaydırma zaten native çalışır ama masaüstünde fareyle tutup sürüklemek
  // için bu olmadan hiçbir şey olmuyordu — o yüzden fareye özel drag-scroll ekliyoruz.
  const navRef = useRef<HTMLElement>(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onNavPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    dragRef.current = { isDown: true, startX: e.clientX, scrollLeft: e.currentTarget.scrollLeft, moved: false };
  };
  const onNavPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current.isDown) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    e.currentTarget.scrollLeft = dragRef.current.scrollLeft - dx;
  };
  const onNavPointerUp = () => {
    dragRef.current.isDown = false;
  };
  const onNavClickCapture = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="account-page account-panel-page">
      <section className={`account-panel-shell container ${collapsed ? "is-collapsed" : ""}`}>
        <aside className={`account-side-panel ${collapsed ? "is-collapsed" : ""}`}>
          <div className="account-side-head">
            <Link href="/hesap/kullanici-bilgilerim" className="account-side-brand" aria-label="Hesap paneli">
              <span><LayoutDashboard size={18} /></span>
              <b>Hesabım</b>
            </Link>
            <button
              type="button"
              className="account-side-toggle"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <div className="account-side-user">
            <span>{initials || "C"}</span>
            <div>
              <strong>{displayName}</strong>
              <small>{email}</small>
            </div>
          </div>

          <nav
            className="account-side-nav"
            aria-label="Hesap menüsü"
            ref={navRef}
            onPointerDown={onNavPointerDown}
            onPointerMove={onNavPointerMove}
            onPointerUp={onNavPointerUp}
            onPointerLeave={onNavPointerUp}
            onClickCapture={onNavClickCapture}
          >
            {ACCOUNT_MENU_LINKS.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className={pathname === href ? "is-active" : ""}>
                <span className="account-side-icon"><Icon size={18} /></span>
                <span className="account-side-copy">
                  <b>{label}</b>
                  <small>{desc}</small>
                </span>
              </Link>
            ))}
            <button type="button" className="is-danger" onClick={() => signOut({ callbackUrl: "/" })}>
              <span className="account-side-icon"><LogOut size={18} /></span>
              <span className="account-side-copy">
                <b>Çıkış Yap</b>
                <small>Hesabından güvenle çık.</small>
              </span>
            </button>
          </nav>
        </aside>

        <section className="account-panel-content">{children}</section>
      </section>
    </main>
  );
}
