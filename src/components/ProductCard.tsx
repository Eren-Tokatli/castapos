"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ProductStatic, defaultPeriod, monthlyPrice, dailyPrice, ratingCount, formatPrice } from "@/lib/products-data";

export function ProductCard({ p }: { p: ProductStatic }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod(p));

  const currentMonthly = monthlyPrice(p, selectedPeriod);
  const currentDaily = dailyPrice(p, selectedPeriod);
  const reviewsCount = ratingCount(p);
  const favorited = isFavorite(p.id);

  const badge = p.premium ? (
    <span className="discount-badge premium-badge">
      <Star size={12} fill="currentColor" strokeWidth={0} /> Premium
    </span>
  ) : p.discount ? (
    <span className="discount-badge accent-badge">{p.discount}</span>
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
          {badge}
          <img src={p.image} alt={p.name} />
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
              {m} Ay
            </button>
          ))}
        </div>

        <div className="price-block rental-card-block compact-price-only">
          <div className="monthly-primary">
            <strong>{formatPrice(currentMonthly).replace(" TL", " ₺")}</strong>
            <span>/ Aylık</span>
          </div>
          <div className="daily-secondary">
            <strong>{formatPrice(currentDaily).replace(" TL", " ₺")}</strong>
            <span>/ Gün</span>
          </div>
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
