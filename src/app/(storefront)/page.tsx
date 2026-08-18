"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CalendarDays, MousePointerClick, Package, Repeat, Sparkles } from "lucide-react";
import { PRODUCTS, getProduct } from "@/lib/products-data";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { CountdownTimer } from "@/components/CountdownTimer";

const HOME_TESTIMONIALS = [
  {
    productId: "walkingpad-r2-pro",
    rating: 5,
    name: "Enes S.",
    date: "07 Mart 2026",
    text: "Evde uzun süre kullanmadan satın almak istemiyordum. 3 aylık kiralama benim için çok daha güvenli bir karar oldu.",
  },
  {
    productId: "wero-ai-bike",
    rating: 5,
    name: "Selin K.",
    date: "04 Mart 2026",
    text: "Satın alma düşüncem vardı ama önce kiralamak çok mantıklı geldi. Ürünü deneyip karar vermek gerçekten rahatlatıcı.",
  },
  {
    productId: "voit-at1000",
    rating: 4,
    name: "Halil M.",
    date: "27 Şubat 2026",
    text: "Kurulum ve teslimat düzenliydi. Ürünü deneyimledikten sonra hangi modele geçeceğime daha net karar verdim.",
  },
  {
    productId: "bissell-proheat",
    rating: 5,
    name: "Cemre A.",
    date: "22 Şubat 2026",
    text: "Dönemsel ihtiyaç için satın almadan kullanmak büyük avantaj. Temizlik dönemlerinde gerçekten hayat kurtarıyor.",
  },
];

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

export default function HomePage() {
  const [activeEasyStep, setActiveEasyStep] = useState(0);

  // Hover ile önizleme geçişi sadece masaüstü genişliğinde çalışsın; dar ekranda
  // (accordion modunda) mouse üzerinden geçiş açılıp kapanmayı tetiklemesin, sadece tıklama açsın.
  const activateOnHover = (idx: number) => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 761px)").matches) {
      setActiveEasyStep(idx);
    }
  };

  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { href: "/kategori?cat=Fitness", img: "/assets/banners/banner-cardio-wide.png", alt: "Eliptik bisiklet kiralama fırsatları" },
    { href: "/kategori?cat=Yürüyüş%20Bantları", img: "/assets/banners/banner-walkingpad-premium.png", alt: "Yer kaplamayan spor aleti kiralama fırsatları" },
    {
      href: "/kategori?cat=Yaz%20Sezonu",
      img: "/assets/banners/banner-summer-season-offer.jpg",
      alt: "Yaz sezonu elektrikli bisiklet ve scooter kiralama",
      overlay: {
        badge: "Sezon Fırsatı",
        title: "Yaz Sezonuna Özel Çözümler",
        description: "Katlanabilir şehir bisikletleri, kompakt eliptik aletleri ve yaz aylarında formda kalmanızı sağlayacak tüm ekipmanlar.",
        cta: "Fırsatları İncele",
      },
    },
    { href: "/kategori?cat=Ev%20Aletleri", img: "/assets/banners/banner-cleaning-premium-wide.png", alt: "Halı ve koltuk temizliği için kiralama çözümleri" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const popularRailRef = useRef<HTMLDivElement>(null);
  const newRailRef = useRef<HTMLDivElement>(null);
  const flashSaleRailRef = useRef<HTMLDivElement>(null);

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -620 : 620;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const popularProducts = PRODUCTS.slice(0, 8);
  const newProducts = [...PRODUCTS].reverse().slice(0, 8);
  const flashSaleProducts = PRODUCTS.filter((p) => p.discount);

  return (
    <div className="home-shell">
      {/* HERO SLIDER SECTION */}
      <section className="home-hero">
        <div className="promo-slider">
          <div className="promo-track">
            {slides.map((slide, idx) => (
              <Link
                key={idx}
                className={`promo-slide ${slide.overlay ? "promo-slide-overlay" : ""} ${idx === activeSlide ? "active" : ""}`}
                href={slide.href}
              >
                <img src={slide.img} alt={slide.alt} />
                {slide.overlay && (
                  <div className="promo-slide-panel">
                    <span className="promo-slide-badge">{slide.overlay.badge}</span>
                    <h2>{slide.overlay.title}</h2>
                    <p>{slide.overlay.description}</p>
                    <span className="promo-slide-btn">
                      {slide.overlay.cta} →
                    </span>
                  </div>
                )}
              </Link>
            ))}
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
                      <img src={item.image} alt="" />
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
                <img src={EASY_STEPS[activeEasyStep].image} alt="" />
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

      {/* CAMPAIGN BANNER STRIP */}
      <section className="campaign-strip-section" aria-label="Kampanya alanları">
        <div className="container campaign-strip-grid">
          <Link
            className="campaign-tile tile-orange campaign-visual-tile"
            href="/kategori?cat=Yaz%20Sezonu"
            aria-label="Yaz sezonu kampanya alanı"
          >
            <img src="/assets/campaign-orange.svg" alt="Yaz sezonu kampanya görseli" />
          </Link>
          <Link
            className="campaign-tile tile-purple campaign-visual-tile"
            href="/kategori?cat=Koşu%20Bantları"
            aria-label="Koşu bantları kampanya alanı"
          >
            <img src="/assets/campaign-purple.svg" alt="Koşu bantları kampanya görseli" />
          </Link>
          <Link
            className="campaign-tile tile-blue campaign-visual-tile"
            href="/kategori?cat=Ev%20Aletleri"
            aria-label="Ev aletleri kampanya alanı"
          >
            <img src="/assets/campaign-blue.svg" alt="Ev aletleri kampanya görseli" />
          </Link>
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
          {HOME_TESTIMONIALS.map((item, idx) => {
            const p = getProduct(item.productId);
            return (
              <Link
                key={idx}
                className="testimonial-card"
                href={`/urun/${item.productId}`}
              >
                <div className="testimonial-top">
                  <img src={p.image} alt={p.name} />
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
