"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { monthlyPrice, dailyPrice, defaultPeriod, formatPrice } from "@/lib/catalog-shared";
import { createStorefrontOrder } from "./actions";
import { IyzicoCheckoutFrame } from "@/components/IyzicoCheckoutFrame";
import { isValidTcKimlikNo } from "@/lib/tc-kimlik";

const VAT_RATE = 0.20;

const cityList = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const districtsList = [
  "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa",
  "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt",
  "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe",
  "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla",
  "Ümraniye", "Üsküdar", "Zeytinburnu"
];

export default function SepetPage() {
  const {
    cart,
    removeFromCart,
    updateCartItemQty,
    monthlyTotal,
    getProductById,
    coupon,
    applyCoupon,
    removeCoupon
  } = useStore();

  const [couponInput, setCouponInput] = useState(coupon ? coupon.code : "");
  const [checkoutStep, setCheckoutStep] = useState<number | null>(null); // null means modal closed, 1/2 means open
  
  // Real Checkout Integration States
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState("");
  const [tcError, setTcError] = useState("");
  const [distanceSaleAccepted, setDistanceSaleAccepted] = useState(false);
  const [rentalTermsAccepted, setRentalTermsAccepted] = useState(false);
  const agreementsAccepted = distanceSaleAccepted && rentalTermsAccepted;

  // Modal dışına tıklayınca kapatma — ama Adres/Sipariş notu gibi metin
  // alanlarında seçim yaparken mouse modalin dışına taşarsa (mousedown içeride,
  // mouseup dışarıda) kapanmasın. Sadece hem mousedown hem click backdrop'un
  // kendisinde başlarsa kapat.
  const backdropMouseDownOnSelf = useRef(false);

  // Checkout Form State
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    taxOrNationalId: "",
    city: "İstanbul",
    district: "",
    address: "",
    orderNote: ""
  });

  useEffect(() => {
    document.body.classList.add("page-sepet");
    return () => document.body.classList.remove("page-sepet");
  }, []);

  const hasSportsItems = cart.some((item) => {
    const p = getProductById(item.id);
    return !!p && ["Koşu Bantları", "Yürüyüş Bantları", "Bisiklet", "Fitness", "Fitness & Kondisyon"].includes(p.category);
  });

  // Calculate discounts — kupon artık gerçek (admin panelden yönetilen)
  // veri, sabit %10 değil; yüzde ya da sabit tutar olabilir.
  const discountAmount = !coupon
    ? 0
    : coupon.discountType === "PERCENTAGE"
    ? Math.round(monthlyTotal * (coupon.amount / 100))
    : Math.min(coupon.amount, monthlyTotal);
  const discountedMonthly = monthlyTotal - discountAmount;
  const vatIncludedAmount = Math.round(discountedMonthly * VAT_RATE / (1 + VAT_RATE));

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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    await applyCoupon(couponInput, monthlyTotal);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
  };

  const handlePhoneInput = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 10);
    let formatted = "";
    if (nums.length) formatted = "(" + nums.slice(0, 3);
    if (nums.length >= 3) formatted += ")";
    if (nums.length > 3) formatted += " " + nums.slice(3, 6);
    if (nums.length > 6) formatted += " " + nums.slice(6, 8);
    if (nums.length > 8) formatted += " " + nums.slice(8, 10);
    
    setShippingForm(prev => ({ ...prev, phone: formatted }));
  };

  // Step 1: Address submission & order creation in DB
  const handleProceedToPayment = async () => {
    if (
      !shippingForm.firstName ||
      !shippingForm.lastName ||
      !shippingForm.email ||
      !shippingForm.phone ||
      !shippingForm.taxOrNationalId ||
      !shippingForm.address
    ) {
      showToast("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    if (!isValidTcKimlikNo(shippingForm.taxOrNationalId)) {
      setTcError("Girdiğiniz T.C. kimlik numarası geçerli değil.");
      showToast("T.C. kimlik numarası geçerli değil.");
      return;
    }

    setOrderError("");

    const orderRes = await createStorefrontOrder(
      shippingForm,
      cart,
      coupon?.code
    );

    if (!orderRes.success || !orderRes.orderId) {
      setOrderError(orderRes.error || "Sipariş oluşturulamadı.");
      return;
    }

    setOrderId(orderRes.orderId);
    setCheckoutStep(2);
  };

  const renderCheckoutSummary = () => {
    const totalCount = cart.reduce((n, x) => n + x.qty, 0);
    return (
      <div className="checkout-summary-list">
        <div>
          <span>Ürün sayısı</span>
          <strong>{totalCount}</strong>
        </div>
        <div>
          <span>Aylık ödeme toplamı</span>
          <strong>{formatPrice(monthlyTotal)}</strong>
        </div>
        {coupon && (
          <div>
            <span>Kupon indirimi</span>
            <strong>- {formatPrice(discountAmount)}</strong>
          </div>
        )}
        <div>
          <span>Teslimat</span>
          <strong>Ücretsiz</strong>
        </div>
        <div className="summary-tax-line">
          <span>KDV dahil (%20)</span>
          <strong>{formatPrice(vatIncludedAmount)}</strong>
        </div>
        <div>
          <span>Aylık ödenecek tutar</span>
          <strong>{formatPrice(discountedMonthly)}</strong>
        </div>
      </div>
    );
  };

  if (cart.length === 0) {
    return (
      <>
        <section className="listing-head cart-page-head">
          <div className="container listing-head-inner">
            <div>
              <nav className="breadcrumb">
                <Link href="/">Ana Sayfa</Link> › Sepetim
              </nav>
              <h1>Sepetim</h1>
            </div>
          </div>
        </section>
        
        <section className="cart-section">
          <div className="container">
            <div className="empty-cart-page premium-empty-cart-page">
              <div className="empty-cart-copy">
                <span className="empty-cart-kicker">Sepet durumu</span>
                <h1>Kiralama planını oluşturmaya başlayalım</h1>
                <p>Satın almadan önce deneyebileceğin ürünleri seç, aylık fiyatı gör ve teslimat planını birkaç adımda tamamla.</p>
                <div className="empty-cart-actions">
                  <Link className="btn btn-primary" href="/kategori">
                    Ürünleri Keşfet
                  </Link>
                  <Link className="btn btn-soft" href="/#flash-sale">
                    Fırsatlara Bak
                  </Link>
                </div>
              </div>
              <div className="empty-cart-panel">
                <div className="empty-cart-panel-head">
                  <Sparkles size={18} />
                  <span>Castapos avantajları</span>
                </div>
                <div className="empty-cart-benefit-grid">
                  <article>
                    <ShieldCheck size={18} />
                    <b>Güvenli ödeme</b>
                    <small>3D Secure ile korumalı işlem.</small>
                  </article>
                  <article>
                    <Truck size={18} />
                    <b>Planlı teslimat</b>
                    <small>Adresine uygun randevu.</small>
                  </article>
                  <article>
                    <CalendarDays size={18} />
                    <b>Esnek süre</b>
                    <small>1, 3, 6 ve 9 ay seçenekleri.</small>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="listing-head cart-page-head">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Sepetim
            </nav>
            <h1>Sepetim</h1>
          </div>
        </div>
      </section>

      <section className="cart-section">
        <div className="container">
          <div className="rental-cart-layout">
            <main className="rental-cart-main">
              <div className="cart-item-count">
                <span>{cart.length} ürün sepetinde</span>
              </div>
              
              <div className="rental-plan-list">
                {cart.map((item, idx) => {
                  const p = getProductById(item.id);
                  if (!p) return null;
                  const period = Number(item.period || defaultPeriod(p));
                  const summaryTitle = `${period} aylık toplam ödeme`;

                  const base = monthlyPrice(p, period);
                  const total = base * item.qty;
                  const daily = dailyPrice(p, period) * item.qty;
                  const detailHref = `/urun/${p.id}?period=${period}`;

                  return (
                    <article key={idx} className="rental-plan-item">
                      <Link className="cart-product-image" href={detailHref}>
                        <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
                      </Link>
                      
                      <div className="plan-product-copy">
                        <Link
                          className="cart-product-brand"
                          href={`/kategori?cat=${encodeURIComponent(p.category)}&q=${encodeURIComponent(p.brand)}`}
                        >
                          {p.brand}
                        </Link>
                        <h2>
                          <Link href={detailHref}>{p.name}</Link>
                        </h2>
                        
                        <div className="plan-meta-row">
                          <div className="selected-plan-tag">
                            <span>Seçili plan</span>
                            <b>{period} Ay</b>
                          </div>
                          <div className="delivery-estimate">
                            <span>Tahmini teslimat</span>
                            <b>1–3 İş Günü</b>
                          </div>
                        </div>
                        
                        <div className="plan-qty-row">
                          <div className="qty-control">
                            <button type="button" onClick={() => updateCartItemQty(idx, -1)}>
                              −
                            </button>
                            <input type="text" value={item.qty} readOnly />
                            <button type="button" onClick={() => updateCartItemQty(idx, 1)}>
                              +
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            className="remove-line"
                            onClick={() => removeFromCart(idx)}
                          >
                            Ürünü kaldır
                          </button>
                        </div>
                      </div>

                      <div className="plan-price-summary">
                        <span>{summaryTitle}</span>
                        <b>{formatPrice(total)}</b>
                        <small>
                          Günlük karşılığı <strong className="daily-cart-value">{formatPrice(daily)}</strong>
                        </small>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Coupon Form */}
              <form className="coupon-box rental-coupon" onSubmit={handleApplyCoupon}>
                <span>Kupon kodu</span>
                <div>
                  <input
                    placeholder="Kupon kodu gir"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={!!coupon}
                  />
                  {coupon ? (
                    <button type="button" onClick={handleRemoveCoupon}>
                      Kaldır
                    </button>
                  ) : (
                    <button type="submit">Uygula</button>
                  )}
                </div>
                {coupon && (
                  <div className="applied-coupon">
                    <span>
                      <b>{coupon.code}</b> · Her ay{" "}
                      {coupon.discountType === "PERCENTAGE" ? `%${coupon.amount}` : `₺${coupon.amount}`} indirim
                    </span>
                  </div>
                )}
              </form>
              
              <Link className="text-link" href="/kategori">
                ← Alışverişe devam et
              </Link>
            </main>

            {/* Price Summary Panel */}
            <aside className="rental-plan-summary">
              <span className="summary-kicker">Ödeme özeti</span>
              <h2>Aylık kiralama</h2>
              <div>
                <span>Aylık ödeme toplamı</span>
                <b>{formatPrice(monthlyTotal)}</b>
              </div>
              
              {coupon && (
                <div className="summary-saving">
                  <span>Her ay kupon indirimi</span>
                  <b>- {formatPrice(discountAmount)}</b>
                </div>
              )}
              
              <div>
                <span>Teslimat</span>
                <b>Ücretsiz</b>
              </div>

              <div className="summary-tax-line">
                <span>KDV dahil (%20)</span>
                <b>{formatPrice(vatIncludedAmount)}</b>
              </div>
              
              <div className="first-payment">
                <span>Aylık ödenecek tutar</span>
                <b>{formatPrice(discountedMonthly)}</b>
              </div>
              
              {coupon && (
                <p className="coupon-summary-note">
                  Kupon indirimi seçili kiralama süresi boyunca her aylık ödemeye uygulanır.
                </p>
              )}
              
              <button
                className="btn btn-primary full"
                type="button"
                onClick={() => setCheckoutStep(1)}
              >
                Kiralama planını onayla
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* CHECKOUT MODAL FLOW */}
      {checkoutStep !== null && (
        <div
          className="checkout-flow-backdrop open"
          onMouseDown={(e) => {
            backdropMouseDownOnSelf.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (backdropMouseDownOnSelf.current && e.target === e.currentTarget) {
              setCheckoutStep(null);
            }
          }}
        >
          <div className="checkout-flow-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-flow-head">
              <div>
                <h2>Sipariş ve ödeme bilgileri</h2>
                <p>Kiralama planını onayladıktan sonra adres ve ödeme bilgilerini tamamlayabilirsin.</p>
              </div>
              <button type="button" className="checkout-close-btn" onClick={() => setCheckoutStep(null)}>
                ×
              </button>
            </div>
            
            <div className="checkout-flow-body">
              <div className="checkout-steps">
                <span className={`checkout-step-pill ${checkoutStep === 1 ? "active" : ""}`}>
                  1. Adres & iletişim
                </span>
                <span className={`checkout-step-pill ${checkoutStep === 2 ? "active" : ""}`}>
                  2. Güvenli Ödeme
                </span>
              </div>
              
              {checkoutStep === 1 ? (
                <div className="checkout-grid">
                  <section className="checkout-card">
                    <h3>Teslimat bilgileri</h3>
                    <form
                      id="checkout-address-form"
                      className="form-grid"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleProceedToPayment();
                      }}
                    >
                      <label>
                        <span>Ad <span className="required-star">*</span></span>
                        <input
                          type="text"
                          required
                          placeholder="Adınız"
                          value={shippingForm.firstName}
                          onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Soyad <span className="required-star">*</span></span>
                        <input
                          type="text"
                          required
                          placeholder="Soyadınız"
                          value={shippingForm.lastName}
                          onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                        />
                      </label>
                      <label>
                        E-posta
                        <input
                          type="email"
                          placeholder="ornek@eposta.com"
                          value={shippingForm.email}
                          onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Telefon <span className="required-star">*</span></span>
                        <div className="phone-field">
                          <select className="country-code-select" data-country-code>
                            <option value="+90">TR +90</option>
                            <option value="+1">US +1</option>
                            <option value="+49">DE +49</option>
                            <option value="+44">GB +44</option>
                          </select>
                          <input
                            type="tel"
                            required
                            placeholder="Telefon numaranız"
                            value={shippingForm.phone}
                            onChange={(e) => handlePhoneInput(e.target.value)}
                          />
                        </div>
                      </label>
                      <label>
                        <span>T.C. Kimlik No <span className="required-star">*</span></span>
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          placeholder="11 haneli T.C. kimlik numaranız"
                          maxLength={11}
                          className={tcError ? "field-invalid" : undefined}
                          value={shippingForm.taxOrNationalId}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/[^0-9]/g, "");
                            setShippingForm({ ...shippingForm, taxOrNationalId: digits });
                            if (digits.length < 11) {
                              setTcError("");
                            } else {
                              setTcError(isValidTcKimlikNo(digits) ? "" : "Girdiğiniz T.C. kimlik numarası geçerli değil.");
                            }
                          }}
                        />
                        {tcError && <small className="field-error-text">{tcError}</small>}
                      </label>
                      <label>
                        İl
                        <select
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value, district: "" })}
                        >
                          {hasSportsItems ? (
                            <option value="İstanbul">İstanbul</option>
                          ) : (
                            cityList.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))
                          )}
                        </select>
                      </label>
                      <label>
                        İlçe
                        {shippingForm.city === "İstanbul" ? (
                          <select
                            value={shippingForm.district}
                            onChange={(e) => setShippingForm({ ...shippingForm, district: e.target.value })}
                          >
                            <option value="">İlçe seçin</option>
                            {districtsList.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="İlçe"
                            value={shippingForm.district}
                            onChange={(e) => setShippingForm({ ...shippingForm, district: e.target.value })}
                          />
                        )}
                      </label>
                      <label style={{ gridColumn: "1/-1" }}>
                        <span>Adres <span className="required-star">*</span></span>
                        <textarea
                          required
                          placeholder="Mahalle, sokak, bina ve daire bilgilerini yazın."
                          value={shippingForm.address}
                          onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                        />
                      </label>
                      <label style={{ gridColumn: "1/-1" }}>
                        Sipariş notu
                        <textarea
                          placeholder="Teslimatla ilgili ek notunuz varsa buraya yazabilirsiniz."
                          value={shippingForm.orderNote}
                          onChange={(e) => setShippingForm({ ...shippingForm, orderNote: e.target.value })}
                        />
                      </label>
                    </form>
                    <p className="checkout-note" style={{ color: "#db4724", marginTop: "12px", fontSize: "13px" }}>
                      {hasSportsItems &&
                        "Spor aletleri siparişlerinde şu an yalnızca İstanbul içi kiralama desteklenmektedir."}
                      {orderError && <span style={{ display: "block", marginTop: hasSportsItems ? "8px" : 0 }}>{orderError}</span>}
                    </p>
                  </section>
                  
                  <aside className="checkout-card">
                    <h3>Sipariş özeti</h3>
                    {renderCheckoutSummary()}
                  </aside>
                </div>
              ) : (
                <div className="checkout-grid">
                  <section className="checkout-card">
                    <h3>Güvenli Ödeme (Iyzico 3D Secure)</h3>

                    <div className="agreement-check-list">
                      <label className="agreement-check-row">
                        <input
                          type="checkbox"
                          required
                          checked={distanceSaleAccepted}
                          onChange={(e) => setDistanceSaleAccepted(e.target.checked)}
                        />
                        <span>
                          <a href="/sozlesmeler/mesafeli-sozlesme" target="_blank">
                            Mesafeli Satış Sözleşmesi
                          </a>
                          &apos;ni okudum ve kabul ediyorum. <span className="required-star">*</span>
                        </span>
                      </label>
                      <label className="agreement-check-row">
                        <input
                          type="checkbox"
                          required
                          checked={rentalTermsAccepted}
                          onChange={(e) => setRentalTermsAccepted(e.target.checked)}
                        />
                        <span>
                          <a href="/sozlesmeler/kiralama-kosullari" target="_blank">
                            Kiralama Koşulları Sözleşmesi
                          </a>
                          &apos;ni okudum ve kabul ediyorum. <span className="required-star">*</span>
                        </span>
                      </label>
                    </div>

                    {orderId && agreementsAccepted ? (
                      <IyzicoCheckoutFrame kind="ORDER" referenceId={orderId} />
                    ) : (
                      <p className="checkout-note" style={{ marginTop: "16px" }}>
                        Ödeme formunu görüntülemek için yukarıdaki sözleşmeleri onaylaman gerekiyor.
                      </p>
                    )}
                  </section>
                  
                  <aside className="checkout-card">
                    <h3>Ödeme özeti</h3>
                    {renderCheckoutSummary()}
                  </aside>
                </div>
              )}

              <div className="checkout-actions">
                {checkoutStep === 1 ? (
                  <>
                    <button type="button" className="btn btn-soft" onClick={() => setCheckoutStep(null)}>
                      Kapat
                    </button>
                    <button
                      type="submit"
                      form="checkout-address-form"
                      className="btn btn-primary"
                    >
                      Ödemeye geç
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-soft"
                      onClick={() => setCheckoutStep(1)}
                    >
                      Geri
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
