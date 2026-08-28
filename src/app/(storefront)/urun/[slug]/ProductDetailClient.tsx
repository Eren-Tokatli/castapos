"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isR2Hosted } from "@/lib/r2-client";
import { Star, Check, BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck, Truck, Wallet, X, ZoomIn } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  CatalogProduct,
  defaultPeriod,
  monthlyPrice,
  dailyPrice,
  formatPrice,
} from "@/lib/catalog-shared";
import type { ProductReview } from "@/lib/catalog-server";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";

const PRODUCT_DETAIL_TABS = [
  { key: "description", label: "Ürün Açıklaması" },
  { key: "specs", label: "Teknik Özellikler" },
  { key: "reviews", label: "Değerlendirmeler" },
  { key: "qa", label: "Soru & Cevap" },
  { key: "return", label: "İptal & İade Koşulları" },
] as const;

interface QAItem {
  q: string;
  a: string;
}

const QA_DATA_DEFAULT = {
  qa: [
    { q: "Teslimat ne kadar sürede yapılıyor?", a: "Ürün uygunluğuna göre teslimat planı destek ekibi tarafından 1-3 iş günü içinde organize edilir." },
    { q: "Kiralama süresi sonunda uzatma yapabiliyor muyum?", a: "Uygun stok bulunması halinde kiralama süresi uzatma talebi oluşturabilirsin." },
    { q: "Kiralama sürem bitmeden ürünü iade edebilir miyim?", a: "Erken iade talebi destek ekibi üzerinden değerlendirilir; kalan süreye göre bilgilendirme yapılır." }
  ]
};

// Soru & Cevap listesi uzun (23 soru) — varsayılan olarak sadece ilk birkaçı
// açık, gerisi "Daha Fazla Gör" ile genişletiliyor (bkz. showAllQa state'i).
const QA_INITIAL_VISIBLE = 5;

function expandedQa(seed: QAItem[]): QAItem[] {
  const qs = [
    "Teslimat kurulumu da kapsıyor mu?",
    "Ürün teslimatı hafta sonu yapılabiliyor mu?",
    "Kiralama süresi sonunda uzatma talebi nasıl açılır?",
    "Kiralama süresini uzatmak için ekstra ücret var mı?",
    "Üründe arıza olursa teknik servis süreci nasıl işliyor?",
    "Aynı üründen iki adet kiralayabilir miyim?",
    "Kurulum için ekstra ücret çıkıyor mu?",
    "Temizlik ve bakım ürün tesliminden önce yapılıyor mu?",
    "İade günü geldiğinde kargo mu geliyor yoksa ekip mi alıyor?",
    "Kurumsal kiralama için ayrı süreç var mı?",
    "Stok biterse benzer model öneriliyor mu?",
    "Aylık ödeme günü sabit mi?",
    "Hasar durumunda nasıl işlem uygulanıyor?",
    "Adres değişikliği teslimattan sonra yapılabilir mi?",
    "Ürünü şehir dışına taşıyabilir miyim?",
    "Kutu içeriğinde aksesuarlar dahil mi?",
    "Faturayı dijital olarak alabiliyor muyum?",
    "Erken iade yaparsam ne oluyor?",
    "Ürün görseldekiyle birebir aynı mı geliyor?",
    "Yedek parça veya aksesuar desteği var mı?",
    "Teslimat saat aralığını ben seçebiliyor muyum?",
    "Temassız teslimat seçeneği var mı?",
    "Kiralama bitince tekrar aynı ürünü alabilir miyim?"
  ];
  return Array.from({ length: 23 }, (_, i) => ({
    q: qs[i],
    a: seed[i % seed.length]?.a || "Detaylı bilgi için destek hattımızla iletişime geçebilirsiniz."
  }));
}

const INFO_PANELS = {
  damage: {
    icon: ShieldAlert,
    title: "Ürüne zarar gelirse ne olur?",
    text: "Normal kullanımdan kaynaklanan arızalar Castapos güvencesindedir — destek ekibine bildir, ücretsiz onarım ya da değişim sağlanır. Kasıtlı hasarda bedel sözleşmeye göre değerlendirilir."
  },
  installment: {
    icon: Wallet,
    title: "Taksit ödemelerimi nasıl yapacağım?",
    text: "Aylık ödemen kayıtlı kartından otomatik tahsil edilir, ödeme öncesi hatırlatma alırsın. Güncel durumu /takip sayfasından ya da Hesabım > Siparişlerim'den takip edebilirsin."
  },
  warranty: {
    icon: BadgeCheck,
    title: "Ürünün garantisi var mı?",
    text: "Tüm ürünler teslimat öncesi kontrolden geçer, kiralama boyunca garanti kapsamındadır. Üretim kaynaklı arızada ücretsiz teknik servis, gerekirse aynı gün değişim sağlanır."
  }
} as const;

export function ProductDetailClient({
  product: p,
  similarProducts,
  reviews,
}: {
  product: CatalogProduct;
  similarProducts: CatalogProduct[];
  reviews: ProductReview[];
}) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  const [period, setPeriod] = useState(defaultPeriod(p));
  const [activeTab, setActiveTab] = useState("description");
  const [zoomOpen, setZoomOpen] = useState(false);
  const images = p.images && p.images.length > 0 ? p.images : [p.image, p.image, p.image, p.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [infoPanel, setInfoPanel] = useState<keyof typeof INFO_PANELS | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [reviewFilter, setReviewFilter] = useState<string>("Tümü");
  const [showAllQa, setShowAllQa] = useState(false);
  const tabSectionRefs = React.useRef<Record<string, HTMLElement | null>>({});

  // Ürün Açıklaması/Teknik Özellikler/... artık accordion değil — hepsi
  // sayfada alt alta her zaman açık duruyor. Üstteki (sticky) sekme
  // butonları sadece o bölüme kaydırıyor.
  const scrollToTabSection = (key: string) => {
    setActiveTab(key);
    tabSectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentMonthly = monthlyPrice(p, period);
  const rentTotal = currentMonthly * period;
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

  const selectedTotal = rentTotal;
  const favorited = isFavorite(p.id);

  useEffect(() => {
    document.body.classList.add("page-urun-detay", "page-product-detail");
    return () => document.body.classList.remove("page-urun-detay", "page-product-detail");
  }, []);

  const goPrevImage = () => {
    setSlideDir("left");
    setActiveImageIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNextImage = () => {
    setSlideDir("right");
    setActiveImageIndex((i) => (i + 1) % images.length);
  };

  useEffect(() => {
    if (!zoomOpen || images.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrevImage();
      if (e.key === "ArrowRight") goNextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, images.length]);

  // Q&A data (henüz gerçek bir soru-cevap sistemi yok, bkz. reviews için Review modeli)
  const qaItems = expandedQa(QA_DATA_DEFAULT.qa);

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === "Tümü") return true;
    return r.rating === Number(reviewFilter);
  });

  const showToast = (message: string) => {
    let t = document.querySelector(".site-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "site-toast";
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add("show");
    setTimeout(() => t?.classList.remove("show"), 2100);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Sorun destek ekibine iletildi.");
    setQuestionText("");
  };

  const heartIcon = (active: boolean) => (
    <svg className="heart-svg" viewBox="0 0 24 24" aria-hidden="true" style={{ width: "16px", height: "16px" }}>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <section className="detail-section">
        <div className="container product-detail-grid refined compact-detail-grid">
          {/* Gallery Panel */}
          <div className="gallery-panel detail-clean">
            <button
              type="button"
              className="main-gallery-image clean product-hero-image"
              onClick={() => setZoomOpen(true)}
              aria-label="Görseli büyüt"
            >
              <Image
                key={activeImageIndex}
                className="gallery-fade-img"
                src={images[activeImageIndex]}
                alt={p.name}
                width={520}
                height={390}
                priority
                unoptimized={!isR2Hosted(images[activeImageIndex])}
              />
              <span className="gallery-zoom-hint">
                <ZoomIn size={15} /> Büyüt
              </span>
            </button>
            <div className="thumb-row clean">
              {images.map((img, idx) => (
                <span
                  key={idx}
                  className={idx === activeImageIndex ? "active" : undefined}
                  role="button"
                  tabIndex={0}
                  aria-label={`${idx + 1}. görseli göster`}
                  aria-pressed={idx === activeImageIndex}
                  onClick={() => setActiveImageIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveImageIndex(idx);
                    }
                  }}
                >
                  <Image src={img} alt="" width={68} height={68} loading="lazy" unoptimized={!isR2Hosted(img)} />
                </span>
              ))}
            </div>
            <div className="detail-premium-strip" aria-label="Kiralama avantajları">
              <span><ShieldCheck size={15} /> Kontrol edilmiş ürün</span>
              <span><Truck size={15} /> Randevulu teslimat</span>
              <span><BadgeCheck size={15} /> Güvenli kiralama</span>
            </div>
          </div>

          {/* Details Panel + info teaser stack — aynı sağ kolon */}
          <div className="detail-panel-column">
          <div className="detail-panel refined clean compact-panel">
            <div className="detail-top-row">
              <nav className="breadcrumb">
                <Link href="/">Ana Sayfa</Link> /{" "}
                <Link href={`/kategori?cat=${encodeURIComponent(p.category)}`}>
                  {p.category}
                </Link> /{" "}
                <Link href={`/kategori?cat=${encodeURIComponent(p.category)}&q=${encodeURIComponent(p.brand)}`}>
                  {p.brand}
                </Link>
              </nav>
              <div className="detail-top-actions">
                <button
                  type="button"
                  className={`detail-fav-btn ${favorited ? "active" : ""}`}
                  onClick={() => toggleFavorite(p.id, period)}
                  aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
                >
                  {heartIcon(favorited)}
                </button>
              </div>
            </div>

            <h1>
              {p.brand && p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? (
                <>
                  <Link href={`/kategori?brand=${encodeURIComponent(p.brand)}`} className="detail-title-brand-link">
                    {p.name.slice(0, p.brand.length)}
                  </Link>
                  {p.name.slice(p.brand.length)}
                </>
              ) : (
                p.name
              )}
            </h1>
            
            <div className="detail-rating">
              {reviewCount > 0 && (
                <>
                  <Star size={15} fill="currentColor" strokeWidth={0} />{" "}
                  {averageRating.toFixed(1).replace(".", ",")}{" "}
                </>
              )}
              <button
                type="button"
                className="review-link"
                onClick={() => {
                  setActiveTab("reviews");
                  document.getElementById("reviews-anchor")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {reviewCount > 0 ? `(${reviewCount} değerlendirme)` : "Henüz değerlendirme yok"}
              </button>
            </div>

            {/* Period selector */}
            <div className="periods top-periods compact-pills">
              <label>Kiralama Süresi</label>
              <div>
                {p.periods.map((m) => (
                  <button
                    key={m}
                    className={`period-chip ${m === period ? "active" : ""}`}
                    onClick={() => setPeriod(m)}
                  >
                    {m} Ay
                  </button>
                ))}
              </div>
            </div>

            <div className="key-benefits compact tighter">
              <Link href="/bilgi/sikca-sorulan-sorular"><Check size={14} /> Ücretsiz teslimat</Link>
              <Link href="/bilgi/iletisim"><Check size={14} /> Teknik servis desteği</Link>
              <Link href="/bilgi/sikca-sorulan-sorular"><Check size={14} /> Esnek kiralama süresi</Link>
            </div>

            {/* Total / Monthly Installment Box */}
            <div className="installment-box refined compact cleaner light">
              <span>Aylık ödeme tutarı</span>
              <div className="big-total">{formatPrice(currentMonthly)}</div>
              <div className="installment-bottom-row">
                <span className="daily-amount">Günlük {formatPrice(dailyPrice(p, period))}</span>
                <span className="total-amount">Toplam: {formatPrice(selectedTotal)}</span>
              </div>
            </div>

            <div className="detail-actions compact-actions single">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => addToCart(p.id, period)}
              >
                Sepete Ekle
              </button>
            </div>

            <div className="detail-security-row">
              <span><ShieldCheck size={15} /> 3D Secure ödeme</span>
              <span><Truck size={15} /> İstanbul içi planlı teslimat</span>
            </div>
          </div>

            {/* Info teaser accordion — fiyat kartının dışında, hemen altında.
                Aynı anda sadece bir tanesi açık kalır: birine basınca açık
                olan varsa kapanır, tıklanan açılır. */}
            <div className="detail-info-teaser-stack">
              {(Object.keys(INFO_PANELS) as (keyof typeof INFO_PANELS)[]).map((key) => {
                const panel = INFO_PANELS[key];
                const Icon = panel.icon;
                const isOpen = infoPanel === key;
                return (
                  <div key={key} className={`info-teaser-item ${isOpen ? "open" : ""}`}>
                    <button
                      type="button"
                      className="info-teaser-card"
                      aria-expanded={isOpen}
                      onClick={() => setInfoPanel(isOpen ? null : key)}
                    >
                      <span className="info-teaser-icon"><Icon size={22} /></span>
                      <span className="info-teaser-text">{panel.title}</span>
                      <ChevronDown size={17} className="info-teaser-chevron" />
                    </button>
                    <div className="info-teaser-body">
                      <p>{panel.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL TABS SECTION — accordion değil; tüm bölümler sayfada alt alta
          her zaman açık, üstteki sticky butonlar sadece o bölüme kaydırır. */}
      <section className="section product-info-section">
        <div className="container" id="reviews-anchor">
          <div className="detail-tabs">
            {PRODUCT_DETAIL_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={activeTab === tab.key ? "active" : ""}
                onClick={() => scrollToTabSection(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="detail-tab-panels detail-tab-panels-stacked">
            {/* Description Panel */}
            <section
              ref={(el) => { tabSectionRefs.current.description = el; }}
              className="detail-tab-panel active"
            >
              <div className="premium-tab-head">
                <h3>Ürün Hakkında</h3>
                <p>Satın almadan önce ürünün günlük kullanımına uygunluğunu daha net gör.</p>
              </div>
              <div className="premium-description-grid">
                <article className="premium-copy-card main">
                  {p.description ? (
                    <div dangerouslySetInnerHTML={{ __html: p.description }} />
                  ) : (
                    <p>Bu ürün için henüz bir açıklama girilmemiş.</p>
                  )}
                  {p.periods.length > 0 && (
                    <p>
                      Bu ürün <strong>{p.periods.join(", ")} ay</strong> kiralama seçenekleriyle
                      satın alma öncesi deneme ihtiyacına cevap verir.
                    </p>
                  )}
                </article>
              </div>
            </section>

            {/* Specs Panel */}
            <section
              ref={(el) => { tabSectionRefs.current.specs = el; }}
              className="detail-tab-panel active"
            >
              <div className="premium-tab-head">
                <h3>Teknik Özellikler</h3>
                <p>Kiralama kararını etkileyen temel özellikleri sade ve okunabilir şekilde incele.</p>
              </div>
              {p.specs.length > 0 ? (
                <div className="spec-table">
                  {p.specs.map((s, idx) => (
                    <div key={idx}>
                      <span>{s.label}</span>
                      <b>{s.value}</b>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Bu ürünün teknik özellikleri &quot;Ürün Açıklaması&quot; bölümündeki detaylarda yer almaktadır.</p>
              )}
            </section>

            {/* Reviews Panel */}
            <section
              ref={(el) => { tabSectionRefs.current.reviews = el; }}
              className="detail-tab-panel active"
            >
              <div className="premium-tab-head">
                <h3>Değerlendirmeler</h3>
                <p>Ürünü deneyen kullanıcıların puanlarını ve kısa yorumlarını burada takip et.</p>
              </div>
              <div className="reviews-shell">
                <div className="reviews-top-grid">
                  <div className="review-summary-box">
                    <div>
                      <small>Ortalama puan</small>
                      <strong>{reviewCount > 0 ? averageRating.toFixed(1).replace(".", ",") : "-"}</strong>
                      <span>{reviewCount} kullanıcı değerlendirmesi</span>
                    </div>
                    <div className="gold-stars">
                      <StarRating rating={Math.round(averageRating)} />
                    </div>
                  </div>

                  <div className="review-form-box">
                    <div className="review-form-head">
                      <h4>Bu Ürünü Değerlendir</h4>
                    </div>
                    <p>
                      Değerlendirme yapabilmek için bu ürünü daha önce kiralamış olman gerekiyor.
                      Tamamlanan siparişlerinden ürünü değerlendirebilirsin.
                    </p>
                    <Link href="/hesap/siparislerim" className="btn btn-primary mt-2">
                      Siparişlerime Git
                    </Link>
                  </div>
                </div>

                <div className="review-list-head">
                  <div>
                    <strong>Yorumlar</strong>
                    <span>Filtreleyerek hızlıca incele</span>
                  </div>
                  <div className="review-filter-bar">
                    {["Tümü", "5", "4", "3", "2", "1"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={reviewFilter === f ? "active" : ""}
                        onClick={() => setReviewFilter(f)}
                      >
                        {f === "Tümü" ? "Tümü" : f + " Yıldız"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="qa-list review-list">
                  {filteredReviews.length === 0 ? (
                    <p className="p-4 text-center text-neutral-500">
                      {reviews.length === 0
                        ? "Bu ürün için henüz bir değerlendirme yapılmamış."
                        : "Bu filtreye uygun yorum bulunamadı."}
                    </p>
                  ) : (
                    filteredReviews.map((r) => (
                      <article key={r.id}>
                        <div className="review-head">
                          <b>{r.name}</b>
                          <span className="gold-stars small">
                            <StarRating rating={r.rating} size={13} />
                          </span>
                        </div>
                        <p>{r.comment}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Q&A Panel */}
            <section
              ref={(el) => { tabSectionRefs.current.qa = el; }}
              className="detail-tab-panel active"
            >
              <div className="premium-tab-head">
                <h3>Soru & Cevap</h3>
                <p>Teslimat, kurulum ve uzatma gibi konularda hızlı bilgi al.</p>
              </div>
              <form className="question-box" onSubmit={handleQuestionSubmit}>
                <h4>Sorunu Sor</h4>
                <p>Ürünle ilgili merak ettiğin konuyu yaz; destek ekibi en kısa sürede dönüş sağlar.</p>
                <textarea
                  placeholder="Örn: Teslimat, kurulum veya kiralama uzatma süreci hakkında soru sorabilirsin."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
                <div className="question-actions single-action mt-2">
                  <button type="submit" className="btn btn-primary">
                    Soru Gönder
                  </button>
                </div>
              </form>
              <div className="qa-list">
                {(showAllQa ? qaItems : qaItems.slice(0, QA_INITIAL_VISIBLE)).map((item, idx) => (
                  <article key={idx}>
                    <b>Alper A.</b>
                    <p>{item.q}</p>
                    <div className="qa-answer">
                      <strong>Castapos yanıtı</strong>
                      <p>{item.a}</p>
                    </div>
                  </article>
                ))}
              </div>
              {!showAllQa && qaItems.length > QA_INITIAL_VISIBLE && (
                <button type="button" className="qa-show-more" onClick={() => setShowAllQa(true)}>
                  Daha Fazla Gör ({qaItems.length - QA_INITIAL_VISIBLE} soru daha)
                  <ChevronDown size={16} />
                </button>
              )}
            </section>

            {/* Return Policy Panel */}
            <section
              ref={(el) => { tabSectionRefs.current.return = el; }}
              className="detail-tab-panel active"
            >
              <div className="premium-tab-head">
                <h3>İptal & İade Koşulları</h3>
                <p>Kiralama sürecinde teslimat öncesi iptal, dönem sonu iade ve kontrol adımları şeffaf ilerler.</p>
              </div>
              <div className="return-policy-grid">
                <article>
                  <span>01</span>
                  <b>Teslimat öncesi iptal</b>
                  <p>Teslimat öncesi iptal talebi destek ekibi üzerinden alınır.</p>
                </article>
                <article>
                  <span>02</span>
                  <b>Dönem sonu iade</b>
                  <p>Kiralama sonunda ürün kontrolü sonrası iade süreci tamamlanır.</p>
                </article>
                <article>
                  <span>03</span>
                  <b>Kiralama uzatma</b>
                  <p>Uygun stok bulunması halinde kiralama süresi uzatma talebi oluşturabilirsin.</p>
                </article>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* SIMILAR PRODUCTS */}
      {similarProducts.length > 0 && (
        <section className="section compact-section similar-products-section">
          <div className="container section-title-row">
            <h2>Benzer ürünler</h2>
          </div>
          <div className="container catalog-grid">
            {similarProducts.map((simProduct) => (
              <ProductCard key={simProduct.id} p={simProduct} />
            ))}
          </div>
        </section>
      )}

      {/* IMAGE ZOOM LIGHTBOX */}
      {zoomOpen && (
        <div className="image-zoom-backdrop open" onClick={() => setZoomOpen(false)}>
          <div className="image-zoom-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="image-zoom-close"
              onClick={() => setZoomOpen(false)}
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
            {images.length > 1 && (
              <button
                type="button"
                className="image-zoom-nav image-zoom-prev"
                onClick={goPrevImage}
                aria-label="Önceki görsel"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <div className="image-zoom-stage">
              <Image
                key={activeImageIndex}
                className={`image-zoom-slide ${slideDir === "left" ? "from-left" : "from-right"}`}
                src={images[activeImageIndex]}
                alt={p.name}
                width={900}
                height={675}
                unoptimized={!isR2Hosted(images[activeImageIndex])}
              />
            </div>
            {images.length > 1 && (
              <button
                type="button"
                className="image-zoom-nav image-zoom-next"
                onClick={goNextImage}
                aria-label="Sonraki görsel"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        </div>
      )}

    </>
  );
}
