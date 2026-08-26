"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CalendarDays, MousePointerClick, Package, Repeat, Sparkles } from "lucide-react";
import { CatalogProduct } from "@/lib/catalog-shared";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { CountdownTimer } from "@/components/CountdownTimer";

export interface HomeTestimonial {
  product: CatalogProduct;
  rating: number;
  name: string;
  date: string;
  text: string;
}

const EASY_STEPS = [
  {
    icon: MousePointerClick,
    title: "Ürünü seç",
    text: "Binlerce ürün arasından ihtiyacına uygun modeli bul, fiyatı ve kiralama süresini anında gör.",
    image: "/assets/products/real-walkingpad-r2.jpg",
    label: "Akıllı seçim",
    note: "Popüler modeller, dönem ve fiyat bilgisi tek ekranda.",
  },
  {
    icon: CalendarDays,
    title: "Planını oluştur",
    text: "Teslimat adresini, başlangıç tarihini ve kiralama süresini seç; ücretler şeffaf şekilde hesaplanır.",
    image: "/assets/products/spotclean.svg",
    label: "Plan hazır",
    note: "Randevulu teslimat ve güvenli ödeme ile ilerle.",
  },
  {
    icon: Package,
    title: "Kapında teslim al",
    text: "Ürün adresine gelir, kurulumu kolayca tamamlanır ve kiralama boyunca destek yanında olur.",
    image: "/assets/products/voit-super-fit.svg",
    label: "Teslimat aktif",
    note: "Kiralama sürecin panelinden takip edilir.",
  },
  {
    icon: Repeat,
    title: "Kararını rahat ver",
    text: "Süreni uzat veya kiralama bitiminde ürünü kolayca iade et.",
    image: "/assets/products/bissell-proheat.svg",
    label: "Esnek kapanış",
    note: "Satın almadan önce gerçek kullanım deneyimi.",
  }
];

export interface HomeBanner {
  url: string;
  alt: string;
  href?: string;
}

export interface CampaignTile {
  url: string;
  alt: string;
  href?: string;
}

export function HomeClient({
  popularProducts,
  newProducts,
  flashSaleProducts,
  testimonials,
  banners,
  bannerIntervalSeconds,
  campaignTiles,
}: {
  popularProducts: CatalogProduct[];
  newProducts: CatalogProduct[];
  flashSaleProducts: CatalogProduct[];
  testimonials: HomeTestimonial[];
  banners: HomeBanner[];
  bannerIntervalSeconds: number;
  // Sabit 3 slot; null olan pozisyon admin panelde doldurulmamış demektir,
  // varsayılan (gradient) görsel + eski href/alt gösterilir.
  campaignTiles: (CampaignTile | null)[];
}) {
  const [activeEasyStep, setActiveEasyStep] = useState(0);

  // Hover ile önizleme geçişi sadece masaüstü genişliğinde çalışsın; dar ekranda
  // (accordion modunda) mouse üzerinden geçiş açılıp kapanmayı tetiklemesin, sadece tıklama açsın.
  const activateOnHover = (idx: number) => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 761px)").matches) {
      setActiveEasyStep(idx);
    }
  };

  // Slider State — anasayfa banner'ları ve geçiş süresi admin panelden
  // (Site Ayarları) yönetiliyor, bkz. lib/site-settings.ts.
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = banners.map((b) => ({ href: b.href || undefined, img: b.url, alt: b.alt }));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, Math.max(2, bannerIntervalSeconds) * 1000);
    return () => clearInterval(timer);
  }, [slides.length, bannerIntervalSeconds]);

  const popularRailRef = useRef<HTMLDivElement>(null);
  const newRailRef = useRef<HTMLDivElement>(null);
  const flashSaleRailRef = useRef<HTMLDivElement>(null);

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -620 : 620;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="home-shell">
      {/* HERO SLIDER SECTION — anasayfa banner'ı hiç eklenmemişse (admin
          hepsini sildiyse) bölüm tamamen gizlenir. */}
      {slides.length > 0 && (
      <section className="home-hero">
        <div className="promo-slider">
          <div className="promo-track">
            {slides.map((slide, idx) =>
              slide.href ? (
                <Link
                  key={idx}
                  className={`promo-slide ${idx === activeSlide ? "active" : ""}`}
                  href={slide.href}
                >
                  <img src={slide.img} alt={slide.alt} />
                </Link>
              ) : (
                <div key={idx} className={`promo-slide ${idx === activeSlide ? "active" : ""}`}>
                  <img src={slide.img} alt={slide.alt} />
                </div>
              )
            )}
          </div>

          {slides.length > 1 && (
            <>
              <button
                className="slider-arrow prev"
                type="button"
                onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                aria-label="Önceki afiş"
              >
                ‹
              </button>
              <button
                className="slider-arrow next"
                type="button"
                onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                aria-label="Sonraki afiş"
              >
                ›
              </button>

              <div className="slider-dots">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    className={idx === activeSlide ? "active" : ""}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`${idx + 1}. afiş`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      )}

      {/* FLASH SALE SECTION */}
      {flashSaleProducts.length > 0 && (
        <section className="section compact-section flash-sale-section" id="flash-sale">
          <div className="container flash-sale-head">
            <div className="flash-sale-title">
              <h2>İndirimli Ürünler</h2>
              <p>Popüler ürünlerde sınırlı süreli kiralama avantajları.</p>
            </div>
            <div className="flash-sale-countdown">
              <span className="flash-sale-countdown-label">Kampanya bitimine</span>
              <CountdownTimer />
            </div>
          </div>
          <div className="container carousel-shell">
            <button
              className="rail-btn left"
              type="button"
              onClick={() => scrollRail(flashSaleRailRef, "left")}
              aria-label="Sola kaydır"
            >
              ‹
            </button>
            <div className="product-rail flash-sale-rail five-up" ref={flashSaleRailRef}>
              {flashSaleProducts.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
            <button
              className="rail-btn right"
              type="button"
              onClick={() => scrollRail(flashSaleRailRef, "right")}
              aria-label="Sağa kaydır"
            >
              ›
            </button>
          </div>
        </section>
      )}

      {/* EASY RENT STEPS SECTION */}
      <section className="section easy-rent-section">
        <div className="container section-title-row easy-title-row">
          <div>
            <h2>Tek tıkla kiralamanın en basit yolu</h2>
            <p className="section-subtitle">Her adımda ne olacağını gör, kiralama kararını daha güvenle ver.</p>
          </div>
          <Link className="text-link" href="/bilgi/nasil-calisir">
            Nasıl Çalışır? →
          </Link>
        </div>
        <div className="container easy-experience-grid">
          <div className="easy-step-list">
            {EASY_STEPS.map((item, idx) => {
              const isActive = activeEasyStep === idx;
              return (
                <div key={item.title} className={`easy-step-item ${isActive ? "active" : ""}`}>
                  <button
                    type="button"
                    className={`easy-step-card ${isActive ? "active" : ""}`}
                    onMouseEnter={() => activateOnHover(idx)}
                    onFocus={() => activateOnHover(idx)}
                    onClick={() => setActiveEasyStep(idx)}
                  >
                    <span className="easy-step-number">{idx + 1}</span>
                    <span className="easy-step-copy">
                      <span className="easy-step-title">{item.title}</span>
                      <p>{item.text}</p>
                    </span>
                    <span className="easy-step-icon"><item.icon size={20} /></span>
                  </button>
                  <div className="easy-step-accordion">
                    <div className="easy-step-accordion-inner">
                      <img src={item.image} alt="" loading="lazy" decoding="async" />
                      <p>{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="easy-preview-panel" aria-live="polite">
            <div className="easy-preview-window">
              <div className="easy-preview-browser">
                <span />
                <span />
                <span />
              </div>
              <div className="easy-preview-content">
                <div>
                  <span className="easy-preview-kicker">{EASY_STEPS[activeEasyStep].label}</span>
                  <h3>{EASY_STEPS[activeEasyStep].title}</h3>
                  <p>{EASY_STEPS[activeEasyStep].note}</p>
                </div>
                <img src={EASY_STEPS[activeEasyStep].image} alt="" loading="lazy" decoding="async" />
              </div>
            </div>
            <div className="easy-preview-badge">
              <Sparkles size={15} />
              <div>
                <strong>{EASY_STEPS[activeEasyStep].label}</strong>
                <span>{EASY_STEPS[activeEasyStep].note}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR PRODUCTS SECTION */}
      <section className="section compact-section" id="popular-products">
        <div className="container section-title-row">
          <div>
            <h1>Öne çıkan kiralama ürünleri</h1>
            <p className="section-subtitle">Daha az seçenek, daha net karar: en çok tercih edilen modelleri senin için derledik.</p>
          </div>
          <Link className="text-link" href="/kategori">
            Tümünü Gör →
          </Link>
        </div>
        <div className="container carousel-shell">
          <button
            className="rail-btn left"
            type="button"
            onClick={() => scrollRail(popularRailRef, "left")}
            aria-label="Sola kaydır"
          >
            ‹
          </button>
          <div className="product-rail" ref={popularRailRef}>
            {popularProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          <button
            className="rail-btn right"
            type="button"
            onClick={() => scrollRail(popularRailRef, "right")}
            aria-label="Sağa kaydır"
          >
            ›
          </button>
        </div>
      </section>

      {/* CAMPAIGN BANNER STRIP — sabit 3 kutucuk, admin panelden (Site
          Ayarları) doldurulmamış pozisyon kendi varsayılan görseline döner. */}
      <section className="campaign-strip-section" aria-label="Kampanya alanları">
        <div className="container campaign-strip-grid">
          {[
            { fallbackClass: "tile-orange", fallbackImg: "/assets/campaign-orange.svg", fallbackHref: "/kategori?cat=Yaz%20Sezonu", fallbackAlt: "Yaz sezonu kampanya görseli" },
            { fallbackClass: "tile-purple", fallbackImg: "/assets/campaign-purple.svg", fallbackHref: "/kategori?cat=Koşu%20Bantları", fallbackAlt: "Koşu bantları kampanya görseli" },
            { fallbackClass: "tile-blue", fallbackImg: "/assets/campaign-blue.svg", fallbackHref: "/kategori?cat=Ev%20Aletleri", fallbackAlt: "Ev aletleri kampanya görseli" },
          ].map((fallback, idx) => {
            const tile = campaignTiles[idx];
            return (
              <Link
                key={idx}
                className={`campaign-tile campaign-visual-tile ${tile ? "campaign-tile-custom" : fallback.fallbackClass}`}
                href={tile ? tile.href || "/" : fallback.fallbackHref}
                aria-label={tile ? tile.alt : fallback.fallbackAlt}
              >
                <img src={tile ? tile.url : fallback.fallbackImg} alt={tile ? tile.alt : fallback.fallbackAlt} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="section testimonials-section" id="sizden-gelenler">
        <div className="container section-title-row testimonials-title-row">
          <div className="testimonial-heading">
            <h2>Sizden Gelenler</h2>
            <div className="testimonial-summary">
              <span className="gold-stars"><StarRating rating={5} /></span>
              <b>4,9</b>
            </div>
          </div>
          <Link className="text-link" href="/kategori">
            Tümünü Gör →
          </Link>
        </div>
        <div className="container testimonials-grid">
          {testimonials.map((item, idx) => {
            const p = item.product;
            return (
              <Link
                key={idx}
                className="testimonial-card"
                href={`/urun/${p.id}`}
              >
                <div className="testimonial-top">
                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
                  <div>
                    <h3>{p.name}</h3>
                    <div className="gold-stars small">
                      <StarRating rating={item.rating} size={13} />
                    </div>
                  </div>
                </div>
                <p>{item.text}</p>
                <div className="testimonial-meta">
                  <span>{item.name}</span>
                  <b>{item.date}</b>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* NEW PRODUCTS SECTION */}
      <section className="section compact-section" id="new-products">
        <div className="container section-title-row">
          <div>
            <h2>Yeni gelen kiralama ürünleri</h2>
            <p className="section-subtitle">Katalogdaki en yeni seçenekleri ilk deneyenlerden ol.</p>
          </div>
          <Link className="text-link" href="/kategori?sort=new">
            Tümünü Gör →
          </Link>
        </div>
        <div className="container carousel-shell">
          <button
            className="rail-btn left"
            type="button"
            onClick={() => scrollRail(newRailRef, "left")}
            aria-label="Sola kaydır"
          >
            ‹
          </button>
          <div className="product-rail" ref={newRailRef}>
            {newProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          <button
            className="rail-btn right"
            type="button"
            onClick={() => scrollRail(newRailRef, "right")}
            aria-label="Sağa kaydır"
          >
            ›
          </button>
        </div>
      </section>

    </div>
  );
}
