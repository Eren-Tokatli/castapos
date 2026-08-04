"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Check, ArrowLeftRight, BadgeCheck, ClipboardCheck, MessageSquareText, RotateCcw, Settings2, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  ProductStatic,
  PRODUCTS,
  defaultPeriod,
  monthlyPrice,
  ratingCount,
  formatPrice,
} from "@/lib/products-data";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";

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
    { q: "Satın alma opsiyonu nasıl çalışıyor?", a: "Satın alma opsiyonu olan ürünlerde kira süreci sonrası kalan bedel üzerinden satın alma değerlendirmesi yapılabilir." }
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
    "Satın alma opsiyonu aktif olduğunda nasıl ilerliyor?",
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

export function ProductDetailClient({ product: p }: { product: ProductStatic }) {
  const { addToCart, toggleFavorite, isFavorite, toggleCompare, compareList } = useStore();

  const [period, setPeriod] = useState(defaultPeriod(p));
  const [choiceMode, setChoiceMode] = useState<"rent" | "buy">("rent");
  const [activeTab, setActiveTab] = useState("description");
  const [starRating, setStarRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [reviewFilter, setReviewFilter] = useState<string>("Tümü");

  const currentMonthly = monthlyPrice(p, period);
  const rentTotal = currentMonthly * period;
  const buyActive = Boolean(p.buyPrice);
  const reviewCount = ratingCount(p);

  const selectedTotal = choiceMode === "buy" && buyActive ? (p.buyPrice || p.price) : rentTotal;
  const favorited = isFavorite(p.id);
  const inCompare = compareList.includes(p.id);

  useEffect(() => {
    document.body.classList.add("page-urun-detay", "page-product-detail");
    return () => document.body.classList.remove("page-urun-detay", "page-product-detail");
  }, []);

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

  const highlightSummary = (text: string) => {
    // Regex matching static code highlights
    return text
      .replace(/(\d+[\.,]?\d*\s?km\/s)/gi, "<strong>$1</strong>")
      .replace(/(\d+[\.,]?\d*\s?HP)/gi, "<strong>$1</strong>")
      .replace(/(Bluetooth|Wi[- ]?Fi|katlanabilir|satın alma opsiyonu|sessiz motor|taşıma kapasitesi)/gi, "<strong>$1</strong>");
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

  const similarProducts = PRODUCTS.filter((x) => x.id !== p.id && x.collection === p.collection).slice(0, 4);

  return (
    <>
      <section className="detail-section">
        <div className="container product-detail-grid refined compact-detail-grid">
          {/* Gallery Panel */}
          <div className="gallery-panel detail-clean">
            <div className="main-gallery-image clean product-hero-image">
              <img src={p.image} alt={p.name} />
            </div>
            <div className="thumb-row clean">
              <span><img src={p.image} alt="" /></span>
              <span><img src={p.image} alt="" /></span>
              <span><img src={p.image} alt="" /></span>
              <span><img src={p.image} alt="" /></span>
            </div>
            <div className="detail-premium-strip" aria-label="Kiralama avantajları">
              <span><ShieldCheck size={15} /> Kontrol edilmiş ürün</span>
              <span><Truck size={15} /> Randevulu teslimat</span>
              <span><BadgeCheck size={15} /> Güvenli kiralama</span>
            </div>
          </div>

          {/* Details Panel */}
          <div className="detail-panel refined clean compact-panel">
            <div className="detail-top-row">
              <nav className="breadcrumb">
                <Link href="/">Ana Sayfa</Link> /{" "}
                <Link href={`/kategori?cat=${encodeURIComponent(p.collection)}`}>
                  {p.collection}
                </Link> /{" "}
                <Link href={`/kategori?cat=${encodeURIComponent(p.collection)}&q=${encodeURIComponent(p.brand)}`}>
                  {p.brand}
                </Link>
              </nav>
              <div className="detail-top-actions">
                <button
                  type="button"
                  className={`detail-compare-btn ${inCompare ? "active" : ""}`}
                  onClick={() => toggleCompare(p.id)}
                >
                  <ArrowLeftRight size={14} /> {inCompare ? "Karşılaştırmadan Çıkar" : "Karşılaştır"}
                </button>
                
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

            <div className="detail-product-eyebrow">
              <span><Sparkles size={13} /> Premium kiralama</span>
              <span>{p.brand}</span>
              <span>{p.code}</span>
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

            {/* Price Choices Grid */}
            <div className="detail-price-grid selectable">
              <button
                type="button"
                className={`price-mini-card ${choiceMode === "rent" ? "active" : ""}`}
                onClick={() => setChoiceMode("rent")}
              >
                <small>Kirala</small>
                <b>{formatPrice(currentMonthly)}</b>
                <span>/ aylık ödeme</span>
              </button>
              
              <button
                type="button"
                className={`price-mini-card ${choiceMode === "buy" ? "active" : ""} ${
                  buyActive ? "buy-available" : "buy-disabled"
                }`}
                disabled={!buyActive}
                onClick={() => setChoiceMode("buy")}
              >
                <small>Satın Al</small>
                <b>{buyActive && p.buyPrice ? formatPrice(p.buyPrice) : "Aktif değil"}</b>
                <span>{buyActive ? "tek sefer ödeme" : "yalnızca kiralama"}</span>
              </button>
            </div>

            {/* Period selector */}
            <div className={`periods top-periods compact-pills ${choiceMode === "buy" ? "disabled-periods" : ""}`}>
              <label>Kiralama Süresi</label>
              <div>
                {p.periods.map((m) => (
                  <button
                    key={m}
                    className={`period-chip ${m === period ? "active" : ""}`}
                    onClick={() => choiceMode === "rent" && setPeriod(m)}
                    disabled={choiceMode === "buy"}
                  >
                    {m} Ay
                  </button>
                ))}
              </div>
            </div>

            <div className="key-benefits compact tighter">
              <Link href="/bilgi/sikca-sorulan-sorular"><Check size={14} /> Ücretsiz teslimat</Link>
              <Link href="/bilgi/iletisim"><Check size={14} /> Teknik servis desteği</Link>
              <Link href="/bilgi/nasil-calisir"><Check size={14} /> Satın alma opsiyonu</Link>
            </div>

            {/* Total / Monthly Installment Box */}
            <div className="installment-box refined compact cleaner light">
              <span>
                {choiceMode === "buy" && buyActive
                  ? "Satın alma toplamı"
                  : `Toplam · `}
                {choiceMode === "rent" && (
                  <strong className="period-accent">{period} Ay</strong>
                )}
              </span>
              <div className="big-total">{formatPrice(selectedTotal)}</div>
              {choiceMode === "buy" && buyActive ? (
                <em className="detail-buy-note">
                  <span className="metric-label">Tek seferlik satın alma tutarı.</span>
                </em>
              ) : (
                <em className="detail-monthly-cost">
                  <span className="metric-label">Aylık ödeme tutarı:</span>{" "}
                  <strong className="metric-value">{formatPrice(currentMonthly)}</strong>
                </em>
              )}
            </div>

            {/* Buy active banner */}
            {buyActive ? (
              <div className="compact-buy-meta active">
                <span>Satın alma opsiyonu</span>
                <b>Aktif</b>
              </div>
            ) : (
              <div className="compact-buy-meta inactive">
                <span>Satın alma opsiyonu</span>
                <b>Aktif değil</b>
              </div>
            )}

            <div className="detail-actions compact-actions single">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => addToCart(p.id, period, choiceMode)}
              >
                Sepete Ekle
              </button>
            </div>

            <div className="detail-security-row">
              <span><ShieldCheck size={15} /> 3D Secure ödeme</span>
              <span><Truck size={15} /> İstanbul içi planlı teslimat</span>
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL TABS SECTION */}
      <section className="section product-info-section">
        <div className="container">
          <div className="detail-tabs" id="reviews-anchor">
            <button
              className={activeTab === "description" ? "active" : ""}
              onClick={() => setActiveTab("description")}
            >
              Ürün Açıklaması
            </button>
            <button
              className={activeTab === "specs" ? "active" : ""}
              onClick={() => setActiveTab("specs")}
            >
              Teknik Özellikler
            </button>
            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              Değerlendirmeler
            </button>
            <button
              className={activeTab === "qa" ? "active" : ""}
              onClick={() => setActiveTab("qa")}
            >
              Soru & Cevap
            </button>
            <button
              className={activeTab === "return" ? "active" : ""}
              onClick={() => setActiveTab("return")}
            >
              İptal & İade Koşulları
            </button>
          </div>

          <div className="detail-tab-panels">
            {/* Description Panel */}
            {activeTab === "description" && (
              <section className="detail-tab-panel active">
                <div className="premium-tab-head">
                  <span><Sparkles size={15} /> Ürün deneyimi</span>
                  <h3>Ürün Hakkında</h3>
                  <p>Satın almadan önce ürünün günlük kullanımına uygunluğunu daha net gör.</p>
                </div>
                <div className="premium-description-grid">
                  <article className="premium-copy-card main">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: highlightSummary(p.summary),
                      }}
                    />
                    <p>
                      Bu ürün; <strong>{p.periods.join(", ")} ay</strong> kiralama seçenekleri,{" "}
                      <strong>
                        {p.specs[0].includes(":")
                          ? p.specs[0].split(":").slice(1).join(":").trim()
                          : p.specs[0]}
                      </strong>{" "}
                      ve{" "}
                      <strong>
                        {p.specs[1].includes(":")
                          ? p.specs[1].split(":").slice(1).join(":").trim()
                          : p.specs[1]}
                      </strong>{" "}
                      gibi temel verileriyle satın alma öncesi deneme ihtiyacına cevap verir.
                    </p>
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
                  <span><Settings2 size={15} /> Teknik profil</span>
                  <h3>Teknik Özellikler</h3>
                  <p>Kiralama kararını etkileyen temel özellikleri sade ve okunabilir şekilde incele.</p>
                </div>
                <div className="spec-table">
                  {p.specs.map((s, idx) => {
                    const parts = s.split(":");
                    const label = parts[0];
                    const val = parts.slice(1).join(":").trim() || s;
                    return (
                      <div key={idx}>
                        <span>{label}</span>
                        <b>{val}</b>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Reviews Panel */}
            {activeTab === "reviews" && (
              <section className="detail-tab-panel active">
                <div className="premium-tab-head">
                  <span><MessageSquareText size={15} /> Kullanıcı deneyimi</span>
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
                        <span>Deneyimini paylaş</span>
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
                            {Array.from({ length: n }, (_, idx) => (
                              <Star key={idx} size={12} fill="currentColor" strokeWidth={0} />
                            ))}
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
                  <span><ClipboardCheck size={15} /> Destek yanıtları</span>
                  <h3>Soru & Cevap</h3>
                  <p>Teslimat, kurulum, uzatma ve satın alma opsiyonu gibi konularda hızlı bilgi al.</p>
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
                  <span><RotateCcw size={15} /> Esnek süreç</span>
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
                    <b>Satın alma opsiyonu</b>
                    <p>Satın alma opsiyonu bulunan ürünlerde kira sonrası satın alma değerlendirmesi yapılabilir.</p>
                  </article>
                </div>
              </section>
            )}
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
    </>
  );
}
