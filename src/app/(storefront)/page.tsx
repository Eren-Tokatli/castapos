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
    text: "Süreni uzat, ürünü iade et veya satın alma seçeneği varsa deneyim sonrası karar ver.",
    image: "/assets/products/bissell-proheat.svg",
    label: "Esnek kapanış",
    note: "Satın almadan önce gerçek kullanım deneyimi.",
  }
];

export default function HomePage() {
  const [activeEasyStep, setActiveEasyStep] = useState(0);

  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { href: "/kategori?cat=Fitness", img: "/assets/banners/banner-cardio-wide.png", alt: "Eliptik bisiklet kiralama fırsatları" },
    { href: "/kategori?cat=Yürüyüş%20Bantları", img: "/assets/banners/banner-walkingpad-premium.png", alt: "Yer kaplamayan spor aleti kiralama fırsatları" },
    { href: "/kategori?cat=Yaz%20Sezonu", img: "/assets/banners/banner-summer-premium-wide.png", alt: "Yaz sezonu elektrikli bisiklet ve scooter kiralama" },
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

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -620 : 620;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const popularProducts = PRODUCTS.slice(0, 8);
  const newProducts = [...PRODUCTS].reverse().slice(0, 8);
  const flashSaleProducts = PRODUCTS.filter((p) => p.discount).slice(0, 5);

  return (
    <div className="home-shell">
      {/* HERO SLIDER SECTION */}
      <section className="home-hero">
        <div className="container">
          <div className="promo-slider">
            <div className="promo-track">
              {slides.map((slide, idx) => (
                <Link
                  key={idx}
                  className={`promo-slide ${idx === activeSlide ? "active" : ""}`}
                  href={slide.href}
                >
                  <img src={slide.img} alt={slide.alt} />
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
        </div>
      </section>

      {/* FLASH SALE SECTION */}
      {flashSaleProducts.length > 0 && (
        <section className="section compact-section flash-sale-section" id="flash-sale">
          <div className="container flash-sale-head">
            <div className="flash-sale-title">
              <span className="section-kicker">Bugüne Özel</span>
              <h2>Flaş İndirim</h2>
              <p>Popüler ürünlerde sınırlı süreli kiralama avantajları.</p>
            </div>
            <div className="flash-sale-countdown">
              <span>Kampanya bitimine</span>
              <CountdownTimer />
            </div>
          </div>
          <div className="container flash-sale-showcase">
            <aside className="flash-sale-feature">
              <span>Sınırlı dönem</span>
              <h3>Az seçenek, daha net karar</h3>
              <p>Satın almadan denemek istediğin popüler modelleri avantajlı dönemlerle bir araya getirdik.</p>
              <Link href="/kategori" className="flash-sale-feature-link">
                Kampanyaları Gör →
              </Link>
            </aside>
            <div className="flash-sale-rail-shell">
              <div className="product-rail flash-sale-rail">
                {flashSaleProducts.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EASY RENT STEPS SECTION */}
      <section className="section easy-rent-section">
        <div className="container section-title-row easy-title-row">
          <div>
            <span className="section-kicker">Nasıl işler?</span>
            <h2>Tek tıkla kiralamanın en basit yolu</h2>
            <p className="section-subtitle">Her adımda ne olacağını gör, kiralama kararını daha güvenle ver.</p>
          </div>
          <Link className="text-link" href="/bilgi/nasil-calisir">
            Nasıl Çalışır? →
          </Link>
        </div>
        <div className="container easy-experience-grid">
          <div className="easy-step-list">
            {EASY_STEPS.map((item, idx) => (
              <button
                key={item.title}
                type="button"
                className={`easy-step-card ${activeEasyStep === idx ? "active" : ""}`}
                onMouseEnter={() => setActiveEasyStep(idx)}
                onFocus={() => setActiveEasyStep(idx)}
                onClick={() => setActiveEasyStep(idx)}
              >
                <span className="easy-step-number">{idx + 1}</span>
                <span className="easy-step-copy">
                  <span className="easy-step-title">{item.title}</span>
                  <p>{item.text}</p>
                </span>
                <span className="easy-step-icon"><item.icon size={20} /></span>
              </button>
            ))}
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
            <span className="section-kicker">Popüler Ürünler</span>
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
            <span className="section-kicker">Gerçek deneyimler</span>
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
            <span className="section-kicker">Yeni Eklenenler</span>
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
