"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronLeft, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useState } from "react";
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

          <nav className="account-side-nav" aria-label="Hesap menüsü">
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
