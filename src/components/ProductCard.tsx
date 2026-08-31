"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CatalogProduct, defaultPeriod, monthlyPrice, dailyPrice, discountLabel, originalMonthlyPrice, ratingCount, formatPrice } from "@/lib/catalog-shared";
import { isR2Hosted } from "@/lib/r2-client";

export function ProductCard({ p }: { p: CatalogProduct }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod(p));

  const currentMonthly = monthlyPrice(p, selectedPeriod);
  const currentDaily = dailyPrice(p, selectedPeriod);
  const reviewsCount = ratingCount(p);
  const favorited = isFavorite(p.id);
  const discount = discountLabel(p, selectedPeriod);
  const oldMonthly = originalMonthlyPrice(p, selectedPeriod);

  // .jpg görsellerde arka planı "yok etmek" için mix-blend-mode kullanılıyor
  // (bkz. globals.css .jpg-blend) — next/image optimize ederken src'yi
  // /_next/image?... proxy'sine çevirdiği için artık URL uzantısına
  // bakılamıyor, JS'de kontrol edip class olarak veriyoruz.
  const isJpg = p.image.toLowerCase().endsWith(".jpg");

  const badge = discount ? (
    <span className="discount-badge accent-badge">{discount}</span>
  ) : null;

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
    <article className="compact-product-card modern-rental-card">
      <div className="product-img">
        <Link href={`/urun/${p.id}`} className="w-full h-full flex items-center justify-center">
          {/* Rozet (badge) görselden SONRA render ediliyor bilerek — .jpg-blend
             görsellerdeki mix-blend-mode:multiply, DOM'da kendisinden önce
             gelen her şeyle (badge dahil) karışıyordu; ürünün koyu pikselleri
             rozetin "içinden görünür" hale geliyordu. Sıra değişince blend
             sadece görselin altındaki (beyaz) zeminle karışıyor, rozete hiç
             dokunmuyor — position:absolute olduğu için görünürdeki yeri
             (sol üst) değişmiyor. */}
          <Image
            src={p.image}
            alt={p.name}
            width={220}
            height={155}
            loading="lazy"
            unoptimized={!isR2Hosted(p.image)}
            className={isJpg ? "jpg-blend" : undefined}
          />
          {badge}
        </Link>
        <button
          className={`fav-btn ${favorited ? "active" : ""}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(p.id, selectedPeriod);
          }}
          aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          {heartIcon(favorited)}
        </button>
      </div>

      <div className="product-info">
        <Link className="product-name" href={`/urun/${p.id}`}>
          {p.name}
        </Link>
        
        <div className="rating-row">
          <Star size={13} fill="currentColor" strokeWidth={0} />
          <span>4,7</span>
          <small>({reviewsCount})</small>
        </div>

        <div className="card-periods">
          {p.periods.map((m) => (
            <button
              key={m}
              type="button"
              className={`card-period-btn ${m === selectedPeriod ? "active" : ""}`}
              onClick={() => setSelectedPeriod(m)}
            >
              {/* 4 seçenekli (1/3/6/9 Ay) kartlarda dar telefonlarda yazı
                 kırpılıyordu — sadece BU kartlarda boşluksuz ("1Ay"),
                 diğer kartlarda ("3 Ay" gibi tek/az seçenekli) normal
                 boşluklu haliyle kalıyor. */}
              {m}{p.periods.length === 4 ? "" : " "}Ay
            </button>
          ))}
        </div>

        <div className={`price-block rental-card-block compact-price-only ${!oldMonthly ? "price-no-discount" : ""}`}>
          <div className="daily-secondary">
            <strong>{formatPrice(currentDaily).replace(" TL", " ₺")}</strong>
            <span>/ Gün</span>
          </div>
          <div className="monthly-primary">
            <strong>{formatPrice(currentMonthly).replace(" TL", " ₺")}</strong>
            <span>/ Aylık</span>
          </div>
          {oldMonthly && (
            <s className="old-monthly-price">{formatPrice(oldMonthly).replace(" TL", " ₺")}</s>
          )}
        </div>

        <button
          className="card-wide-btn standalone"
          type="button"
          onClick={() => addToCart(p.id, selectedPeriod)}
        >
          Hemen kirala
        </button>
      </div>
    </article>
  );
}
