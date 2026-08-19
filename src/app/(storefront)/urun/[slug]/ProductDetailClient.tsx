"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Check, BadgeCheck, ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck, Truck, Wallet, X, ZoomIn } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  CatalogProduct,
  defaultPeriod,
  monthlyPrice,
  dailyPrice,
  ratingCount,
  formatPrice,
} from "@/lib/catalog-shared";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";

const PRODUCT_DETAIL_TABS = [
  { key: "description", label: "Ürün Açıklaması" },
  { key: "specs", label: "Teknik Özellikler" },
  { key: "reviews", label: "Değerlendirmeler" },
  { key: "qa", label: "Soru & Cevap" },
  { key: "return", label: "İptal & İade Koşulları" },
] as const;

interface Review {
  name: string;
  rating: number;
  text: string;
}

interface QAItem {
  q: string;
  a: string;
}

const REVIEW_DATA_DEFAULT = {
  average: 4.7,
  qa: [
    { q: "Teslimat ne kadar sürede yapılıyor?", a: "Ürün uygunluğuna göre teslimat planı destek ekibi tarafından 1-3 iş günü içinde organize edilir." },
    { q: "Kiralama süresi sonunda uzatma yapabiliyor muyum?", a: "Uygun stok bulunması halinde kiralama süresi uzatma talebi oluşturabilirsin." },
    { q: "Kiralama sürem bitmeden ürünü iade edebilir miyim?", a: "Erken iade talebi destek ekibi üzerinden değerlendirilir; kalan süreye göre bilgilendirme yapılır." }
  ],
  reviews: [
    { name: "Merve A.", rating: 5, text: "Ürün beklediğimden sessiz çıktı. Kurulum ve teslimat süreci de sorunsuz ilerledi." },
    { name: "Emir T.", rating: 4, text: "Ev kullanımı için yeterli. Kısa süreli ihtiyaçta satın almadan denemek çok mantıklı." },
    { name: "Seda K.", rating: 5, text: "Kiralama deneyimi pratikti. Ürün temiz ve düzenli teslim edildi." },
    { name: "Koray B.", rating: 3, text: "Genel olarak memnunum, ancak ürün detay açıklamaları biraz daha fazla olabilir." }
  ]
};

function expandedReviews(seed: Review[]): Review[] {
  const names = [
    "Merve A.", "Emir T.", "Seda K.", "Koray B.", "İrem Y.", "Fatih D.", "Buse N.", "Oğuz K.",
    "Pelin S.", "Can E.", "Nisa U.", "Volkan A.", "Aslı G.", "Mehmet P.", "Zeynep Ç.", "Tolga M.",
    "Derya H.", "Cem K.", "Ece Y.", "Murat L.", "Sinem A.", "Onur T.", "Begüm E."
  ];
  const notes = [
    " Teslimat ekibi zamanında ulaştı.",
    " Fiyat/performans açısından tatmin edici buldum.",
    " İlk kez kiralama denedim ve süreç kolaydı.",
    " Açıklamalar biraz daha detaylı olabilir ama genel deneyim iyiydi."
  ];
  return Array.from({ length: 23 }, (_, i) => ({
    name: names[i % names.length],
    rating: [5, 4, 5, 3, 4][i % 5],
    text: (seed[i % seed.length]?.text || "") + notes[i % notes.length]
  }));
}

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
    text: "Kiralama süresi boyunca üründe oluşabilecek normal kullanım kaynaklı arızalar Castapos güvencesi kapsamındadır — destek ekibimizle iletişime geçmen yeterli, teknik ekip ürünü yerinde inceler ve gerekirse ücretsiz onarım ya da değişim sağlanır. Kasıtlı hasar veya ürünün amacı dışında kullanımı durumunda hasar bedeli sözleşme koşullarına göre ayrıca değerlendirilir."
  },
  installment: {
    icon: Wallet,
    title: "Taksit ödemelerimi nasıl yapacağım?",
    text: "Aylık ödemen, sipariş sırasında kayıtlı kartından her ay otomatik olarak tahsil edilir; ödeme tarihinden birkaç gün önce hatırlatma bildirimi alırsın. Güncel taksit durumunu ve ödeme geçmişini T.C. kimlik numaranla giriş yaptığın /takip sayfasından ya da Hesabım > Siparişlerim ekranından her an takip edebilirsin."
  },
  warranty: {
    icon: BadgeCheck,
    title: "Ürünün garantisi var mı?",
    text: "Tüm kiralık ürünler teslimattan önce Castapos teknik ekibi tarafından kontrolden geçirilir ve kiralama süren boyunca garanti kapsamındadır. Üretim kaynaklı bir arıza yaşarsan ücretsiz teknik servis desteği alır, gerekirse ürün aynı gün içinde değiştirilir."
  }
} as const;

export function ProductDetailClient({
  product: p,
  similarProducts,
}: {
  product: CatalogProduct;
  similarProducts: CatalogProduct[];
}) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  const [period, setPeriod] = useState(defaultPeriod(p));
  const [activeTab, setActiveTab] = useState("description");
  const [zoomOpen, setZoomOpen] = useState(false);
  const images = p.images && p.images.length > 0 ? p.images : [p.image, p.image, p.image, p.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [infoPanel, setInfoPanel] = useState<keyof typeof INFO_PANELS | null>(null);
  const [starRating, setStarRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [reviewFilter, setReviewFilter] = useState<string>("Tümü");
  // Ürün Açıklaması/Teknik Özellikler/... sekmeleri mobilde anasayfadaki
  // "Ürünü seç" adımları gibi tek bir accordion listesine dönüşüyor;
  // masaüstünde mevcut sticky sekme çubuğu + altında tek panel aynen duruyor.
  const [isMobileTabs, setIsMobileTabs] = useState(false);
  const tabItemRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Uzun bir panel (ör. Soru & Cevap) kapanıp yeni sekme açılınca sayfa
  // yüksekliği aniden değişiyor ve kullanıcı ekranda "kaybolmuş" oluyordu.
  // setTimeout yerine gerçek CSS geçişinin (max-height) bitişini bekleyip
  // ondan sonra yeni açılan sekmeyi ekranın üstüne kaydırıyoruz — animasyon
  // süresi cihaza göre değişse de (arka plan sekmesi vs.) doğru anı yakalar.
  const scrollTabIntoView = (key: string) => {
    const itemEl = tabItemRefs.current[key];
    if (!itemEl) return;
    const accordionEl = itemEl.querySelector<HTMLElement>(".detail-tab-accordion");
    const doScroll = () => itemEl.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!accordionEl) {
      doScroll();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      accordionEl.removeEventListener("transitionend", onEnd);
      doScroll();
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "max-height") finish();
    };
    accordionEl.addEventListener("transitionend", onEnd);
    // transitionend hiç ateşlenmezse (ör. reduced-motion) diye güvenlik ağı.
    window.setTimeout(finish, 500);
  };
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobileTabs(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const currentMonthly = monthlyPrice(p, period);
  const rentTotal = currentMonthly * period;
  const reviewCount = ratingCount(p);

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

  // Review & Q&A data
  const qaItems = expandedQa(REVIEW_DATA_DEFAULT.qa);
  const reviews = expandedReviews(REVIEW_DATA_DEFAULT.reviews);

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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Değerlendirmen alındı.");
    setReviewText("");
    setStarRating(null);
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
              <img key={activeImageIndex} className="gallery-fade-img" src={images[activeImageIndex]} alt={p.name} />
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
                  <img src={img} alt="" />
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

            <h1>{p.name}</h1>
            
            <div className="detail-rating">
              <Star size={15} fill="currentColor" strokeWidth={0} /> 4,7{" "}
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
                ({reviewCount} değerlendirme)
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
              <Link href="/bilgi/nasil-calisir"><Check size={14} /> Esnek kiralama süresi</Link>
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

            {/* Info teaser stack — fiyat kartının dışında, hemen altında */}
            <div className="detail-info-teaser-stack">
              {(Object.keys(INFO_PANELS) as (keyof typeof INFO_PANELS)[]).map((key) => {
                const panel = INFO_PANELS[key];
                const Icon = panel.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    className="info-teaser-card"
                    onClick={() => setInfoPanel(key)}
                  >
                    <span className="info-teaser-icon"><Icon size={22} /></span>
                    <span className="info-teaser-text">{panel.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL TABS SECTION */}
      <section className="section product-info-section">
        <div className="container" id="reviews-anchor">
          {(() => {
            const activePanelContent = (
              <>
            {/* Description Panel */}
            {activeTab === "description" && (
              <section className="detail-tab-panel active">
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
                  <aside className="premium-copy-card side">
                    <span><ShieldCheck size={16} /> Castapos kontrolü</span>
                    <b>Temiz, bakımlı ve kiralamaya hazır</b>
                    <p>Ürün teslimat öncesi temel kontrol sürecinden geçirilir.</p>
                  </aside>
                </div>
              </section>
            )}

            {/* Specs Panel */}
            {activeTab === "specs" && (
              <section className="detail-tab-panel active">
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
                  <p>Bu ürünün teknik özellikleri "Ürün Açıklaması" sekmesindeki detaylarda yer almaktadır.</p>
                )}
              </section>
            )}

            {/* Reviews Panel */}
            {activeTab === "reviews" && (
              <section className="detail-tab-panel active">
                <div className="premium-tab-head">
                  <h3>Değerlendirmeler</h3>
                  <p>Ürünü deneyen kullanıcıların puanlarını ve kısa yorumlarını burada takip et.</p>
                </div>
                <div className="reviews-shell">
                  <div className="reviews-top-grid">
                    <div className="review-summary-box">
                      <div>
                        <small>Ortalama puan</small>
                        <strong>{String(REVIEW_DATA_DEFAULT.average).replace(".", ",")}</strong>
                        <span>{reviewCount} kullanıcı değerlendirmesi</span>
                      </div>
                      <div className="gold-stars">
                        <StarRating rating={Math.round(REVIEW_DATA_DEFAULT.average)} />
                      </div>
                    </div>

                    <form className="review-form-box" onSubmit={handleReviewSubmit}>
                      <div className="review-form-head">
                        <h4>Değerlendirme Yap</h4>
                      </div>
                      <div className="review-rating-pick">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                          className={starRating === n ? "active" : ""}
                          onClick={() => setStarRating(n)}
                        >
                          <span className="rating-pick-number">{n}</span>
                          <span className="rating-pick-stars" aria-hidden="true">
                            <Star size={12} fill="currentColor" strokeWidth={0} />
                          </span>
                        </button>
                      ))}
                    </div>
                      <textarea
                        placeholder="Ürünü kullandıysan deneyimini kısaca paylaşabilirsin."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary mt-2">
                        Yorumu Gönder
                      </button>
                    </form>
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
                      <p className="p-4 text-center text-neutral-500">Bu filtreye uygun yorum bulunamadı.</p>
                    ) : (
                      filteredReviews.map((r, idx) => (
                        <article key={idx}>
                          <div className="review-head">
                            <b>{r.name}</b>
                            <span className="gold-stars small">
                              <StarRating rating={r.rating} size={13} />
                            </span>
                          </div>
                          <p>{r.text}</p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Q&A Panel */}
            {activeTab === "qa" && (
              <section className="detail-tab-panel active">
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
                  {qaItems.map((item, idx) => (
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
              </section>
            )}

            {/* Return Policy Panel */}
            {activeTab === "return" && (
              <section className="detail-tab-panel active">
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
            )}
              </>
            );

            if (isMobileTabs) {
              return (
                <div className="detail-tabs-accordion">
                  {PRODUCT_DETAIL_TABS.map((tab) => (
                    <div
                      key={tab.key}
                      ref={(el) => { tabItemRefs.current[tab.key] = el; }}
                      className={`detail-tab-item ${activeTab === tab.key ? "active" : ""}`}
                    >
                      <button
                        type="button"
                        className={activeTab === tab.key ? "active" : ""}
                        onClick={() => {
                          setActiveTab(tab.key);
                          scrollTabIntoView(tab.key);
                        }}
                      >
                        {tab.label}
                      </button>
                      <div className="detail-tab-accordion">
                        {activeTab === tab.key && activePanelContent}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <>
                <div className="detail-tabs">
                  {PRODUCT_DETAIL_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      className={activeTab === tab.key ? "active" : ""}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="detail-tab-panels">{activePanelContent}</div>
              </>
            );
          })()}
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
              <img
                key={activeImageIndex}
                className={`image-zoom-slide ${slideDir === "left" ? "from-left" : "from-right"}`}
                src={images[activeImageIndex]}
                alt={p.name}
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

      {/* INFO PANEL (zarar/taksit/garanti) */}
      {infoPanel && (
        <div className="image-zoom-backdrop open" onClick={() => setInfoPanel(null)}>
          <div className="info-panel-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="image-zoom-close"
              onClick={() => setInfoPanel(null)}
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
            <div className="info-panel-visual">
              {(() => {
                const Icon = INFO_PANELS[infoPanel].icon;
                return <Icon size={40} />;
              })()}
            </div>
            <h3>{INFO_PANELS[infoPanel].title}</h3>
            <p>{INFO_PANELS[infoPanel].text}</p>
          </div>
        </div>
      )}
    </>
  );
}
