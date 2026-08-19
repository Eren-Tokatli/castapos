"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { monthlyPrice, dailyPrice, formatPrice } from "@/lib/catalog-shared";

export default function FavorilerimPage() {
  const { favorites, toggleFavorite, getProductById } = useStore();

  const handleRemove = (id: string, period: number) => {
    toggleFavorite(id, period);
  };

  return (
    <main className="account-page">
      <section className="account-hero compact-account-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <span>Favorilerim</span>
          </nav>
          <h1>Favorilerim</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {favorites.length === 0 ? (
            <div className="empty-account-state favorites-empty">
              <span><Heart size={30} /></span>
              <h2>Favori listen boş</h2>
              <p>Ürün kartlarındaki kalp simgesini kullanarak favori listeni oluşturabilirsin.</p>
              <Link className="premium-btn" href="/kategori">
                Ürünleri İncele
              </Link>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((entry) => {
                const p = getProductById(entry.id);
                if (!p) return null;
                const period = entry.period;
                const monthly = monthlyPrice(p, period);
                const daily = dailyPrice(p, period);
                const detailHref = `/urun/${p.id}?period=${period}`;

                return (
                  <article key={entry.id} className="favorite-product-card">
                    <Link className="favorite-image" href={detailHref}>
                      <img src={p.image} alt={p.name} />
                    </Link>
                    
                    <button
                      type="button"
                      className="favorite-remove-btn"
                      onClick={() => handleRemove(p.id, period)}
                      aria-label="Favoriden çıkar"
                    >
                      ×
                    </button>
                    
                    <div className="favorite-copy">
                      <Link
                        className="favorite-brand-link"
                        href={`/kategori?cat=${encodeURIComponent(p.category)}&q=${encodeURIComponent(p.brand)}`}
                      >
                        {p.brand}
                      </Link>
                      <h2>
                        <Link href={detailHref}>{p.name}</Link>
                      </h2>
                      <div className="favorite-period">{period} Aylık Plan</div>
                      <div className="favorite-price">
                        <b>{formatPrice(monthly)}</b>
                        <span>/ Aylık</span>
                        <strong>{formatPrice(daily)}</strong>
                        <small>/ Günlük</small>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
