"use client";

import Link from "next/link";
import {
  Award,
  ChevronLeft,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Menu,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const PANEL_LINKS = [
  { href: "/hesap/siparislerim", icon: Package, title: "Siparişlerim", desc: "Geçmiş ve devam eden kiralamaların." },
  { href: "/hesap/favorilerim", icon: Heart, title: "Favorilerim", desc: "Beğendiğin ürünlere hızlıca ulaş." },
  { href: "/hesap/adreslerim", icon: MapPin, title: "Adreslerim", desc: "Teslimat bilgilerini düzenle." },
  { href: "/hesap/puanlarim", icon: Award, title: "Puanlarım", desc: "Kazandığın avantajları takip et." },
  { href: "/hesap/destek", icon: LifeBuoy, title: "Destek Taleplerim", desc: "Soruların ve destek geçmişin." },
];

export function AccountPanelClient({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
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
            <Link href="/hesap/panel" className="account-side-brand" aria-label="Hesap paneli">
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
            {PANEL_LINKS.map(({ href, icon: Icon, title, desc }) => (
              <Link key={href} href={href}>
                <span className="account-side-icon"><Icon size={18} /></span>
                <span className="account-side-copy">
                  <b>{title}</b>
                  <small>{desc}</small>
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="account-panel-content">
          <div className="account-panel-hero">
            <span className="section-kicker">Hesabım</span>
            <h1>Merhaba, {displayName}</h1>
            <p>Siparişlerini, favorilerini, teslimat adreslerini ve destek süreçlerini sol menüden yönetebilirsin.</p>
          </div>

          <div className="account-panel-overview">
            <article>
              <span><ShieldCheck size={18} /></span>
              <b>Güvenli hesap merkezi</b>
              <small>Kiralama, teslimat ve destek işlemleri tek yerde.</small>
            </article>
            <article>
              <span><Sparkles size={18} /></span>
              <b>Hızlı erişim</b>
              <small>Menüyü daraltıp sadece ikonlarla devam edebilirsin.</small>
            </article>
          </div>

          <div className="account-panel-mobile-list">
            {PANEL_LINKS.map(({ href, icon: Icon, title }) => (
              <Link key={href} href={href}>
                <Icon size={18} />
                <span>{title}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
