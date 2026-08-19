"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Heart, ShoppingCart, Menu, Home, Search, Sun, Moon, LogOut, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useTheme } from "@/context/ThemeContext";
import { formatPrice, defaultPeriod, monthlyPrice } from "@/lib/catalog-shared";
import { ACCOUNT_MENU_LINKS } from "@/lib/account-menu";
import { CookieConsent } from "@/components/CookieConsent";
import { CookieScripts } from "@/components/CookieScripts";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { LiveSupportWidget } from "@/components/LiveSupportWidget";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const userFirstName = session?.user?.name ? session.user.name.trim().split(" ")[0] : "";
  const userInitials = session?.user?.name
    ? session.user.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : "";

  let accountLinkHref = "/hesap/giris";
  if (isLoggedIn) {
    if (session?.user?.role === "ADMIN") {
      accountLinkHref = "/admin";
    } else if (session?.user?.role === "SUPPORT") {
      accountLinkHref = "/destek";
    } else {
      accountLinkHref = "/hesap/kullanici-bilgilerim";
    }
  }
  const { theme, toggleTheme } = useTheme();
  const {
    cart,
    removeFromCart,
    updateCartItemQty,
    cartCount,
    monthlyTotal,
    isCartOpen,
    setIsCartOpen,
    favorites,
    toggleFavorite,
    isFavoritesOpen,
    setIsFavoritesOpen,
    products,
    getProductById,
  } = useStore();
  const drawerSuggestedProducts = products.slice(0, 3);

  // Navigasyonda sadece içinde ürün olan gerçek kategoriler görünür — DB'deki
  // ürün-dışı kategoriler (Blog, Hizmet, Sigorta vb.) hiç ürün taşımadığından
  // burada kendiliğinden elenir.
  const navCategories = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => ({ name, href: `/kategori?cat=${encodeURIComponent(name)}` }));
  }, [products]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [navPanelSuppressed, setNavPanelSuppressed] = useState(false);

  const searchRef = useRef<HTMLFormElement>(null);

  // Kategori linkine tıklayınca header yeniden mount olmadığı için (aynı
  // layout kalıyor) mega panel açık kalabiliyordu: fare hareket etmeden
  // tıklanan linkte :hover kalmaya devam ediyor, sayfa değişse bile panel
  // ekranda asılı duruyordu — tam da "başka bir yere gelmezsen açık kalıyor"
  // dediğin durum. Sabit bir süre yerine, route değiştiğinde paneli
  // bastırıp fare gerçekten hareket edene kadar (nereye gittiği önemli
  // değil) öyle tutuyoruz; ilk hareket görülünce normal hover/focus
  // davranışına geri dönüyor.
  useEffect(() => {
    setNavPanelSuppressed(true);
    const clear = () => setNavPanelSuppressed(false);
    window.addEventListener("mousemove", clear, { once: true });
    return () => window.removeEventListener("mousemove", clear);
  }, [pathname]);

  // Suggestions search list
  const suggestedProducts = searchQuery.trim()
    ? products.filter((p) => {
        const name = p.name.toLocaleLowerCase("tr-TR");
        const brand = p.brand.toLocaleLowerCase("tr-TR");
        const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
        return name.startsWith(query) || brand.startsWith(query) || name.includes(query);
      }).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Update dynamic year
  const [currentYear] = useState(() => new Date().getFullYear());


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/kategori?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={`${mobileMenuOpen ? "mobile-open" : ""} ${mobileCategoriesOpen ? "mobile-categories-open" : ""} ${mobileAccountOpen ? "mobile-account-open" : ""} ${isCartOpen ? "cart-open" : ""}`}>
      {/* HEADER */}
      <header className="commerce-header">
        <div className="container commerce-top">
          <Link className="brand-logo" href="/" aria-label="Castapos ana sayfa">
            <img src="/assets/castapos-real-logo.png" alt="Castapos" />
            <span>Tek tıkla kirala</span>
          </Link>
          
          <form className="main-search" onSubmit={handleSearchSubmit} ref={searchRef}>
            <span className="search-icon"><Search size={19} /></span>
            <input
              name="q"
              autoComplete="off"
              placeholder="Ürün, kategori veya marka ara"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit">Ara</button>

            {/* SEARCH SUGGESTIONS */}
            {showSuggestions && suggestedProducts.length > 0 && (
              <div className="search-suggest-box open">
                {suggestedProducts.map((p) => (
                  <Link
                    key={p.id}
                    className="search-suggest-item"
                    href={`/urun/${p.id}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery("");
                    }}
                  >
                    <img src={p.image} alt={p.name} />
                    <span>{p.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </form>

          <div className="commerce-actions">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={theme === "dark" ? "Gündüz moduna geç" : "Gece moduna geç"}
              title={theme === "dark" ? "Gündüz modu" : "Gece modu"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              className={`action-link fav-action ${favorites.length > 0 ? "has-items" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span className="action-icon"><Heart size={22} /></span>
              <small>Favorilerim</small>
            </button>

            <Link
              href="/sepet"
              className={`action-link cart-action ${cartCount > 0 ? "has-items" : ""}`}
              style={{ background: "none", border: "none" }}
            >
              <span className="action-icon"><ShoppingCart size={22} /></span>
              <small>Sepetim</small>
              <b data-cart-count className="cart-count-pill">
                {cartCount} Ürün
              </b>
            </Link>

            <div className="account-wrap">
              <Link href={accountLinkHref} className="action-link account-link">
                <span className="action-icon account-person-icon" aria-hidden="true"></span>
                <small>{isLoggedIn ? (userFirstName || "Hesabım") : "Giriş Yap"}</small>
              </Link>
              <div className="account-menu" aria-label="Hesabım menüsü">
                {isLoggedIn ? (
                  <>
                    <div className="account-user-head">
                      <span className="account-avatar" aria-hidden="true">{userInitials}</span>
                      <div className="account-user-info">
                        <b>{session.user.name}</b>
                        <small>{session.user.email} ({session.user.role === "ADMIN" ? "Yönetici" : session.user.role === "SUPPORT" ? "Destek" : "Müşteri"})</small>
                      </div>
                    </div>
                    {session.user.role === "ADMIN" && (
                      <Link href="/admin" style={{ fontWeight: "bold", color: "var(--brand)" }}>
                        CRM Yönetim Paneli
                      </Link>
                    )}
                    {session.user.role === "SUPPORT" && (
                      <Link href="/destek" style={{ fontWeight: "bold", color: "var(--brand)" }}>
                        Destek Masası
                      </Link>
                    )}
                    {session.user.role === "CUSTOMER" && (
                      <div className="account-menu-links">
                        {ACCOUNT_MENU_LINKS.map(({ href, icon: Icon, label }) => (
                          <Link key={href} href={href}><Icon size={15} /> {label}</Link>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="account-logout"
                    >
                      <LogOut size={15} /> Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <div className="account-auth-intro">
                      <span className="account-auth-badge">Castapos Üyeliği</span>
                      <b>Üye Girişi</b>
                      <p>Siparişlerini, favorilerini ve kiralama avantajlarını tek ekrandan yönet.</p>
                    </div>
                    <div className="account-auth-benefits">
                      <span>Planlı teslimat takibi</span>
                      <span>Favori ürün listesi</span>
                    </div>
                    <Link href="/hesap/giris" className="account-menu-primary">Giriş Yap</Link>
                    <Link href="/hesap/kayit" className="account-menu-secondary">Yeni Üye Ol</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            Menü
          </button>
        </div>

        {/* NAVIGATION BAR */}
        <nav className="category-bar" aria-label="Kategori menüsü">
          <div className={`container category-scroll ${navPanelSuppressed ? "nav-panel-suppressed" : ""}`} data-nav-categories>
            <div className="nav-category">
              <Link href="/kategori">Tüm Ürünler</Link>
            </div>
            {navCategories.map((cat, idx) => (
              <div key={idx} className={`nav-category nav-category-${idx}`}>
                <Link href={cat.href} onClick={(e) => e.currentTarget.blur()}>{cat.name}</Link>
              </div>
            ))}
          </div>
        </nav>
      </header>

      {/* CHILDREN PAGE CONTENT */}
      <main>{children}</main>

      {/* FOOTER */}
      <div className="footer-transition" aria-hidden="true" />
      <footer className="footer official-footer">
        <div className="container official-footer-grid">
          <section className="footer-contact-column">
            <h4>İletişim</h4>
            <div className="footer-address-block">
              <b>Türkiye</b>
              <p>Levent Mah. Büyükdere Caddesi Yapı Kredi Plaza, C Blok Kat:17 No:40-41, Beşiktaş/İstanbul</p>
            </div>
            <div className="footer-address-block">
              <b>ABD</b>
              <p>4695 MacArthur Ct #1100, Newport Beach, CA 92660, Amerika Birleşik Devletleri</p>
            </div>
            <a className="footer-mail" href="mailto:bilgi@castapos.com">
              bilgi@castapos.com
            </a>
            <div className="footer-socials" aria-label="Sosyal medya bağlantıları">
              <a href="https://www.facebook.com/castapos" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.2-1.5 1.5-1.5h1.8V3.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.4H8v3.2h2.4V21h3.1Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/castapos.official/" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.85 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 1.8A2.7 2.7 0 1 0 14.7 12 2.7 2.7 0 0 0 12 9.3Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@castapos" target="_blank" rel="noopener" aria-label="YouTube">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21.4 7.2a2.9 2.9 0 0 0-2-2C17.6 4.7 12 4.7 12 4.7s-5.6 0-7.4.5a2.9 2.9 0 0 0-2-2A30.6 30.6 0 0 0 2 12a30.6 30.6 0 0 0 .6 4.8 2.9 2.9 0 0 0 2 2c1.8.5 7.4.5 7.4.5s5.6 0 7.4-.5a2.9 2.9 0 0 0 2-2A30.6 30.6 0 0 0 22 12a30.6 30.6 0 0 0-.6-4.8ZM10 15.6V8.4L16 12l-6 3.6Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/castapos/" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.2 8.1H3.2V21h3V8.1Zm.2-4.1A1.8 1.8 0 1 0 6.4 7.6a1.8 1.8 0 0 0 0-3.6ZM20.8 13.1c0-3.1-1.7-5.4-4.8-5.4a4.1 4.1 0 0 0-3.7 2V8.1H9.4c0 1 .1 12.9.1 12.9h3V13.8c0-.4 0-.8.2-1.1a2.5 2.5 0 0 1 2.3-1.7c1.7 0 2.3 1.3 2.3 3.1V21h3v-7.9Z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </section>
          
          <section className="footer-link-chip-list">
            <h4>Bilgiler</h4>
            <Link href="/bilgi/hakkimizda">Hakkımızda</Link>
            <Link href="/bilgi/sikca-sorulan-sorular">Sıkça Sorulan Sorular</Link>
            <Link href="/bilgi/iletisim">İletişim</Link>
            <Link href="/bilgi/hizmet-sartlari">Hizmet Şartları</Link>
            <Link href="/bilgi/para-iade-politikasi">Para Iade Politikası</Link>
            <Link href="/bilgi/musteri-urun-bilgilendirme">Müşteri Ürün Bilgilendirme</Link>
          </section>
          
          <section className="footer-link-chip-list">
            <h4>Sözleşmeler</h4>
            <Link href="/sozlesmeler/gizlilik-politikasi">Gizlilik ve Güvenlik Politikası</Link>
            <Link href="/sozlesmeler/mesafeli-sozlesme">Mesafeli Sözleşme</Link>
            <Link href="/sozlesmeler/on-bilgilendirme-formu">Ön Bilgilendirme Formu</Link>
            <Link href="/sozlesmeler/aydinlatma-metni">Aydınlatma Metni</Link>
            <Link href="/sozlesmeler/cerez-politikasi">Çerez Politikası</Link>
            <CookiePreferencesButton className="footer-cookie-preferences">
              Çerezleri Yönet
            </CookiePreferencesButton>
            <Link href="/sozlesmeler/uyelik-sozlesmesi">Üyelik Sözleşmesi</Link>
            <Link href="/sozlesmeler/tacir-satis-sozlesmesi">Tacir Satış Sözleşmesi</Link>
            <Link href="/sozlesmeler/kullanim-sartlari">Kullanım Şartları</Link>
          </section>
        </div>
        <div className="container footer-bottom">
          <span>© {currentYear} Castapos</span>
          <span>Tek tıkla kiralamanın en basit yolu.</span>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom-nav" data-mobile-bottom-nav>
        <Link href="/">
          <span><Home size={20} /></span>
          <b>Ana Sayfa</b>
        </Link>
        <button type="button" onClick={() => setMobileCategoriesOpen(true)}>
          <span><Menu size={20} /></span>
          <b>Kategoriler</b>
        </button>
        <Link href="/sepet">
          <span><ShoppingCart size={20} /></span>
          <b>Sepetim</b>
        </Link>
        <Link href="/hesap/favorilerim">
          <span><Heart size={20} /></span>
          <b>Favoriler</b>
        </Link>
        <button type="button" onClick={() => setMobileAccountOpen(true)}>
          <span className="mobile-user-outline"></span>
          <b>Hesabım</b>
        </button>
      </nav>

      {/* MOBILE ACCOUNT SHEET — Kategoriler ile birebir aynı backdrop/sheet mekanizması */}
      {mobileAccountOpen && (
        <div className="mobile-category-backdrop" onClick={() => setMobileAccountOpen(false)}>
          <aside className="mobile-category-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-category-sheet-head">
              <h2>Hesabım</h2>
              <button type="button" onClick={() => setMobileAccountOpen(false)}>
                ×
              </button>
            </div>
            {isLoggedIn ? (
              <div className="mobile-category-list">
                {ACCOUNT_MENU_LINKS.map((item) => (
                  <div key={item.href} className="mobile-category-row">
                    <div className="mobile-category-main">
                      <Link href={item.href} onClick={() => setMobileAccountOpen(false)}>
                        {item.label}
                      </Link>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="mobile-account-logout"
                  onClick={() => {
                    setMobileAccountOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="mobile-category-list">
                <div className="mobile-auth-intro">
                  <h3>Hesabına giriş yap</h3>
                  <p>Siparişlerini takip et, favorilerine hızlıca eriş ve kiralama sürecini yönet.</p>
                </div>
                <Link href="/hesap/giris" className="mobile-auth-primary" onClick={() => setMobileAccountOpen(false)}>
                  Giriş Yap
                </Link>
                <Link href="/hesap/kayit" className="mobile-auth-secondary" onClick={() => setMobileAccountOpen(false)}>
                  Hesap Oluştur
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* MOBILE CATEGORY SHEET */}
      {mobileCategoriesOpen && (
        <div className="mobile-category-backdrop" onClick={() => setMobileCategoriesOpen(false)}>
          <aside className="mobile-category-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-category-sheet-head">
              <h2>Kategoriler</h2>
              <button type="button" onClick={() => setMobileCategoriesOpen(false)}>
                ×
              </button>
            </div>
            <div className="mobile-category-list">
              {navCategories.map((cat, index) => (
                <article key={index} className="mobile-category-row">
                  <div className="mobile-category-main">
                    <Link href={cat.href} onClick={() => setMobileCategoriesOpen(false)}>
                      {cat.name}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* SIDE CART DRAWER */}
      <div className={`cart-backdrop ${isCartOpen ? "open" : ""}`} onClick={() => setIsCartOpen(false)}>
        <aside className="side-cart" onClick={(e) => e.stopPropagation()}>
          <div className="side-cart-head">
            <strong>Sepetim</strong>
            <button type="button" onClick={() => setIsCartOpen(false)}>
              ×
            </button>
          </div>
          
          <div className="side-cart-body">
            {cart.length === 0 ? (
              <div className="empty-mini-cart premium-empty-mini-cart">
                <div className="empty-cart-orb">
                  <ShoppingCart size={30} />
                </div>
                <span className="empty-cart-kicker">Kiralama planı</span>
                <h3>Sepetin hazır bekliyor</h3>
                <p>Popüler ürünleri aylık fiyatlarıyla inceleyip sana uygun kiralama planını birkaç adımda başlatabilirsin.</p>
                <div className="empty-mini-benefits">
                  <span><ShieldCheck size={15} /> Güvenli ödeme</span>
                  <span><Truck size={15} /> Planlı teslimat</span>
                  <span><Sparkles size={15} /> Esnek süre</span>
                </div>
                <div className="empty-mini-picks">
                  {drawerSuggestedProducts.map((p) => (
                    <Link key={p.id} href={`/urun/${p.id}`} onClick={() => setIsCartOpen(false)}>
                      <img src={p.image} alt={p.name} />
                      <span>
                        <b>{p.name}</b>
                        <small>{formatPrice(monthlyPrice(p, defaultPeriod(p)))} / Aylık</small>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="drawer-items">
                {cart.map((item, idx) => {
                  const p = getProductById(item.id);
                  if (!p) return null;
                  const period = Number(item.period || defaultPeriod(p));
                  const total = monthlyPrice(p, period) * item.qty * period;

                  return (
                    <article key={idx} className="drawer-item">
                      <img src={p.image} alt={p.name} />
                      <div>
                        <b>{p.name}</b>
                        <span className="drawer-period-meta">
                          {`${period} aylık kiralama · ${item.qty} adet`}
                        </span>
                        <small className="drawer-total-label">Toplam ödeme</small>
                        <strong>{formatPrice(total)}</strong>
                      </div>

                      <button
                        className="remove-line"
                        type="button"
                        onClick={() => removeFromCart(idx)}
                      >
                        Sil
                      </button>

                      <div className="drawer-item-actions" style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%", gridColumn: "2 / -1" }}>
                        <div className="qty-control">
                          <button type="button" onClick={() => updateCartItemQty(idx, -1)}>
                            −
                          </button>
                          <input type="text" value={item.qty} readOnly />
                          <button type="button" onClick={() => updateCartItemQty(idx, 1)}>
                            +
                          </button>
                        </div>
                        <Link
                          href={`/urun/${p.id}?period=${period}`}
                          className="text-link"
                          onClick={() => setIsCartOpen(false)}
                        >
                          Ürüne git →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="side-cart-footer">
            {cart.length > 0 && (
              <div className="drawer-summary">
                <p className="grand">
                  <span>Aylık ödeme toplamı</span>
                  <b>{formatPrice(monthlyTotal)}</b>
                </p>
                <p>
                  <span>Teslimat</span>
                  <b>Ücretsiz</b>
                </p>
              </div>
            )}
            {cart.length === 0 ? (
              <>
                <Link
                  className="btn btn-primary full"
                  href="/kategori"
                  onClick={() => setIsCartOpen(false)}
                >
                  Ürünleri Keşfet
                </Link>
                <button className="btn btn-soft full" type="button" onClick={() => setIsCartOpen(false)}>
                  Şimdilik Kapat
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-soft full" type="button" onClick={() => setIsCartOpen(false)}>
                  Alışverişe Devam Et
                </button>
                <Link
                  className="btn btn-primary full"
                  href="/sepet"
                  onClick={() => setIsCartOpen(false)}
                >
                  Sepete Git
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* SIDE FAVORITES DRAWER */}
      <div className={`cart-backdrop ${isFavoritesOpen ? "open" : ""}`} onClick={() => setIsFavoritesOpen(false)}>
        <aside className="side-cart" onClick={(e) => e.stopPropagation()}>
          <div className="side-cart-head">
            <strong>Favorilerim</strong>
            <button type="button" onClick={() => setIsFavoritesOpen(false)}>
              ×
            </button>
          </div>

          <div className="side-cart-body">
            {favorites.length === 0 ? (
              <div className="empty-mini-cart premium-empty-mini-cart">
                <div className="empty-cart-orb">
                  <Heart size={30} />
                </div>
                <span className="empty-cart-kicker">Favori listen</span>
                <h3>Favori listen boş</h3>
                <p>Ürün kartlarındaki kalp simgesini kullanarak favori listeni oluşturabilirsin.</p>
              </div>
            ) : (
              <div className="drawer-items">
                {favorites.map((entry) => {
                  const p = getProductById(entry.id);
                  if (!p) return null;
                  const period = entry.period;
                  const monthly = monthlyPrice(p, period);

                  return (
                    <article key={entry.id} className="drawer-item">
                      <img src={p.image} alt={p.name} />
                      <div>
                        <b>{p.name}</b>
                        <span className="drawer-period-meta">{period} aylık plan</span>
                        <small className="drawer-total-label">Aylık ödeme</small>
                        <strong>{formatPrice(monthly)}</strong>
                      </div>

                      <button
                        className="remove-line"
                        type="button"
                        onClick={() => toggleFavorite(entry.id, period)}
                      >
                        Sil
                      </button>

                      <div className="drawer-item-actions" style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%", gridColumn: "2 / -1" }}>
                        <Link
                          href={`/urun/${p.id}?period=${period}`}
                          className="text-link"
                          onClick={() => setIsFavoritesOpen(false)}
                        >
                          Ürüne git →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="side-cart-footer">
            <Link
              className="btn btn-primary full"
              href="/kategori"
              onClick={() => setIsFavoritesOpen(false)}
            >
              Ürünleri Keşfet
            </Link>
          </div>
        </aside>
      </div>

      <LiveSupportWidget />
      <CookieConsent />
      <CookieScripts />
    </div>
  );
}
