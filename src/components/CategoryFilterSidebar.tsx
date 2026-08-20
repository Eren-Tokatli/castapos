"use client";

import React from "react";

export interface RentalAdvantages {
  campaigned: boolean;
  fastDelivery: boolean;
}

interface CategoryFilterSidebarProps {
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  brands: string[];
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  selectedPeriods: number[];
  onPeriodChange: (period: number) => void;
  advantages: RentalAdvantages;
  onAdvantageToggle: (key: keyof RentalAdvantages) => void;
  onApply: () => void;
}

const rentalPeriods = [1, 3, 6, 9];

const advantageLabels: { key: keyof RentalAdvantages; label: string }[] = [
  { key: "campaigned", label: "Kampanyalı" },
  { key: "fastDelivery", label: "Hızlı teslimat" },
];

export function CategoryFilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  brands,
  selectedBrand,
  onBrandChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  selectedPeriods,
  onPeriodChange,
  advantages,
  onAdvantageToggle,
  onApply,
}: CategoryFilterSidebarProps) {
  return (
    <div className="filter-sidebar-wrap">
    <aside className="filter-sidebar">
      <div className="filter-title">Filtrele</div>

      {categories && categories.length > 0 && onCategoryChange && (
        <div className="filter-block">
          <h3>Kategori</h3>
          <div className="check-list">
            {categories.map((category) => (
              <label key={category} className="fake-check">
                <input
                  type="checkbox"
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="filter-block">
        <h3>Marka</h3>
        <div className="check-list">
          {brands.map((brand) => (
            <label key={brand} className="fake-check">
              <input
                type="checkbox"
                checked={selectedBrand === brand}
                onChange={() => onBrandChange(brand)}
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-block">
        <h3>Fiyat Aralığı</h3>
        <div className="price-range-row">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min ₺"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
          <span>—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max ₺"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-block">
        <h3>Kiralama Süresi</h3>
        {rentalPeriods.map((period) => (
          <label key={period} className="fake-check">
            <input
              type="checkbox"
              checked={selectedPeriods.includes(period)}
              onChange={() => onPeriodChange(period)}
            />
            <span>{period} Ay</span>
          </label>
        ))}
      </div>

      <div className="filter-block">
        <h3>Avantajlar</h3>
        {advantageLabels.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`switch-row w-full flex justify-between items-center text-left ${advantages[key] ? "text-[#f35f36]" : ""}`}
            onClick={() => onAdvantageToggle(key)}
          >
            <span>{label}</span>
            <span className={`switch-toggle-bg relative w-10 h-6 rounded-full transition-colors ${advantages[key] ? "bg-[#f35f36]" : "bg-neutral-200"}`}>
              <span className={`switch-circle absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${advantages[key] ? "translate-x-4" : ""}`} />
            </span>
          </button>
        ))}
      </div>

    </aside>

    {/* Filtreleme kutusunun (uzun marka/kategori listesiyle) İÇİNDE değil
       hemen altında, kendi sticky konumuyla — kutuyu kaydırmadan da her
       zaman görünür ve tıklanabilir olsun. */}
    <div className="filter-apply-sticky">
      <button type="button" className="filter-apply-btn" onClick={onApply}>
        Uygula
      </button>
    </div>
    </div>
  );
}
