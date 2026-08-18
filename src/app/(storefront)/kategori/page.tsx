"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { notFound, useSearchParams } from "next/navigation";
import { PRODUCTS, uniqueBrands, uniqueCollections, ratingCount } from "@/lib/products-data";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilterSidebar, RentalAdvantages } from "@/components/CategoryFilterSidebar";
import { PremiumSortDropdown, SortOption } from "@/components/PremiumSortDropdown";

const sortOptions: SortOption[] = [
  { value: "featured", label: "Öne çıkanlar" },
  { value: "new", label: "Yeni eklenenler" },
  { value: "popular", label: "Çok satanlar" },
  { value: "low", label: "Fiyat: düşükten yükseğe" },
  { value: "high", label: "Fiyat: yüksekten düşüğe" },
  { value: "name", label: "İsme göre" },
];

// Inner component to wrap in Suspense for search params
function KategoriPageContent() {
  const searchParams = useSearchParams();
  const urlCat = searchParams.get("cat") || "";
  const urlQuery = searchParams.get("q") || "";
  const urlSort = searchParams.get("sort") || "featured";

  const activeCategory = urlCat;
  const searchQuery = urlQuery;

  // Sidebar'daki seçimler ("taslak") — "Uygula" butonuna basılana kadar
  // ürün listesini etkilemez. Uygulanan (applied) state'ler asıl filtrelemeyi
  // yapar; aktif filtre etiketleri de bunlardan türetilir.
  const [draftCategory, setDraftCategory] = useState("");
  const [draftBrand, setDraftBrand] = useState("");
  const [draftMinPrice, setDraftMinPrice] = useState("");
  const [draftMaxPrice, setDraftMaxPrice] = useState("");
  const [draftPeriods, setDraftPeriods] = useState<number[]>([]);
  const [draftAdvantages, setDraftAdvantages] = useState<RentalAdvantages>({
    campaigned: false,
    fastDelivery: false,
  });

  const [appliedCategory, setAppliedCategory] = useState("");
  const [appliedBrand, setAppliedBrand] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
  const [appliedPeriods, setAppliedPeriods] = useState<number[]>([]);
  const [appliedAdvantages, setAppliedAdvantages] = useState<RentalAdvantages>({
    campaigned: false,
    fastDelivery: false,
  });

  const [sortBy, setSortBy] = useState(
    sortOptions.some((option) => option.value === urlSort) ? urlSort : "featured"
  );

  // "Premium" artık geçerli bir kategori değil (ürünler taşındı); eski
  // linkler/bookmarklar boş bir liste yerine 404 görmeli.
  if (activeCategory === "Premium") {
    notFound();
  }

  // Handle Category checkbox change (only one selected at a time)
  const handleCategoryChange = (category: string) => {
    setDraftCategory((prev) => (prev === category ? "" : category));
  };

  // Handle Brand checkbox change (only one selected at a time, like static js)
  const handleBrandChange = (brand: string) => {
    setDraftBrand((prev) => (prev === brand ? "" : brand));
  };

  // Handle Period checkbox change
  const handlePeriodChange = (period: number) => {
    setDraftPeriods((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    );
  };

  const handleAdvantageToggle = (key: keyof RentalAdvantages) => {
    setDraftAdvantages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyFilters = () => {
    setAppliedCategory(draftCategory);
    setAppliedBrand(draftBrand);
    setAppliedMinPrice(draftMinPrice);
    setAppliedMaxPrice(draftMaxPrice);
    setAppliedPeriods(draftPeriods);
    setAppliedAdvantages(draftAdvantages);
  };

  // Aktif filtre etiketindeki "x" butonuna basınca hem taslağı hem
  // uygulanmış filtreyi temizler — bu her zaman anında etkilidir.
  const clearCategoryFilter = () => {
    setDraftCategory("");
    setAppliedCategory("");
  };
  const clearBrandFilter = () => {
    setDraftBrand("");
    setAppliedBrand("");
  };
  const clearPriceFilter = () => {
    setDraftMinPrice("");
    setDraftMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
  };
  const clearPeriodFilter = (period: number) => {
    setDraftPeriods((prev) => prev.filter((p) => p !== period));
    setAppliedPeriods((prev) => prev.filter((p) => p !== period));
  };
  const clearAdvantageFilter = (key: keyof RentalAdvantages) => {
    setDraftAdvantages((prev) => ({ ...prev, [key]: false }));
    setAppliedAdvantages((prev) => ({ ...prev, [key]: false }));
  };

  // Filtering products
  let filteredProducts = PRODUCTS.slice();

  // 1. Filter by category
  if (activeCategory === "Spor Aletleri") {
    filteredProducts = filteredProducts.filter((p) =>
      ["Koşu Bantları", "Yürüyüş Bantları", "Bisiklet", "Fitness"].includes(p.collection)
    );
  } else if (activeCategory && activeCategory !== "Yaz Sezonu") {
    filteredProducts = filteredProducts.filter(
      (p) => p.collection === activeCategory || p.category === activeCategory
    );
  }
  if (activeCategory === "Yaz Sezonu") {
    filteredProducts = filteredProducts.filter((p) =>
      ["Bisiklet", "Fitness", "Yürüyüş Bantları"].includes(p.collection)
    );
  }

  // 1b. "Tüm Ürünler" görünümünde (URL'de kategori yokken) sidebar'daki
  // Kategori filtresi uygulanır.
  if (!activeCategory && appliedCategory) {
    filteredProducts = filteredProducts.filter((p) => p.collection === appliedCategory);
  }

  // 2. Filter by search query
  const kw = searchQuery.trim().toLocaleLowerCase("tr-TR");
  if (kw) {
    filteredProducts = filteredProducts.filter((p) =>
      (p.name + " " + p.brand + " " + p.category + " " + p.code + " " + p.summary)
        .toLocaleLowerCase("tr-TR")
        .includes(kw)
    );
  }

  // 3. Filter by brand
  if (appliedBrand) {
    filteredProducts = filteredProducts.filter((p) => p.brand === appliedBrand);
  }

  // 4. Filter by price range
  const min = Number(appliedMinPrice);
  if (appliedMinPrice && !Number.isNaN(min)) {
    filteredProducts = filteredProducts.filter((p) => p.price >= min);
  }
  const max = Number(appliedMaxPrice);
  if (appliedMaxPrice && !Number.isNaN(max)) {
    filteredProducts = filteredProducts.filter((p) => p.price <= max);
  }

  // 5. Filter by kiralama süresi (Periods)
  if (appliedPeriods.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.periods.some((per) => appliedPeriods.includes(per))
    );
  }

  // 6. Filter by advantages
  if (appliedAdvantages.campaigned) {
    filteredProducts = filteredProducts.filter((p) => p.discount !== null);
  }
  if (appliedAdvantages.fastDelivery) {
    // Simulated advantage: premium items are marked as fast delivery
    filteredProducts = filteredProducts.filter((p) => p.premium);
  }

  // Aktif filtre etiketleri (toolbar'da gösterilir, her birinde "x" ile
  // kaldırma var)
  const activeFilterChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (!activeCategory && appliedCategory) {
    activeFilterChips.push({ key: "category", label: appliedCategory, onRemove: clearCategoryFilter });
  }
  if (appliedBrand) {
    activeFilterChips.push({ key: "brand", label: appliedBrand, onRemove: clearBrandFilter });
  }
  if (appliedMinPrice || appliedMaxPrice) {
    const priceLabel =
      appliedMinPrice && appliedMaxPrice
        ? `${appliedMinPrice}₺ - ${appliedMaxPrice}₺`
        : appliedMinPrice
          ? `${appliedMinPrice}₺ ve üzeri`
          : `${appliedMaxPrice}₺ ve altı`;
    activeFilterChips.push({ key: "price", label: priceLabel, onRemove: clearPriceFilter });
  }
  appliedPeriods.forEach((period) => {
    activeFilterChips.push({
      key: `period-${period}`,
      label: `${period} Ay`,
      onRemove: () => clearPeriodFilter(period),
    });
  });
  if (appliedAdvantages.campaigned) {
    activeFilterChips.push({ key: "campaigned", label: "Kampanyalı", onRemove: () => clearAdvantageFilter("campaigned") });
  }
  if (appliedAdvantages.fastDelivery) {
    activeFilterChips.push({ key: "fastDelivery", label: "Hızlı teslimat", onRemove: () => clearAdvantageFilter("fastDelivery") });
  }

  // Sorting products
  if (sortBy === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  } else if (sortBy === "new") {
    // Reverse order represents new arrivals
    filteredProducts = [...filteredProducts].reverse();
  } else if (sortBy === "popular") {
    filteredProducts.sort((a, b) => ratingCount(b) - ratingCount(a));
  }

  const isNewListing = sortBy === "new" && !activeCategory && !searchQuery;
  const categoryLabel = isNewListing ? "Yeni Gelenler" : activeCategory || "Tüm Ürünler";
  const brands = uniqueBrands();
  const collections = uniqueCollections();

  return (
    <div
      className={`kategori-shell premium-category-page sports-category-page ${
        isNewListing ? "new-category-page" : ""
      }`}
    >
      <section className="listing-head slim-listing-head">
        <div className="container listing-head-inner slim">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <span>{categoryLabel}</span>
          </nav>
        </div>
      </section>

      <section className="listing-section">
        <div className="container listing-layout">
          <CategoryFilterSidebar
            categories={!activeCategory ? collections : undefined}
            selectedCategory={draftCategory}
            onCategoryChange={handleCategoryChange}
            brands={brands}
            selectedBrand={draftBrand}
            onBrandChange={handleBrandChange}
            minPrice={draftMinPrice}
            maxPrice={draftMaxPrice}
            onMinPriceChange={setDraftMinPrice}
            onMaxPriceChange={setDraftMaxPrice}
            selectedPeriods={draftPeriods}
            onPeriodChange={handlePeriodChange}
            advantages={draftAdvantages}
            onAdvantageToggle={handleAdvantageToggle}
            onApply={handleApplyFilters}
          />

          {/* LISTING CONTENT */}
          <div className="listing-content" id="kategori-urunleri">
            <div className="content-toolbar category-listing-toolbar">
              <div className="toolbar-title-stack">
                <strong>{categoryLabel}</strong>
                <small>{filteredProducts.length} ürün listeleniyor</small>
              </div>
              <div className="toolbar-actions">
                <PremiumSortDropdown options={sortOptions} value={sortBy} onChange={setSortBy} />
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="active-filter-chips">
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className="active-filter-chip"
                    onClick={chip.onRemove}
                  >
                    {chip.label}
                    <X size={13} />
                  </button>
                ))}
              </div>
            )}

            <div className="catalog-grid">
              {filteredProducts.length === 0 ? (
                <div className="empty-state">Bu filtrelere uygun ürün bulunamadı.</div>
              ) : (
                filteredProducts.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function KategoriPage() {
  return (
    <Suspense fallback={<div className="container py-8">Yükleniyor...</div>}>
      <KategoriPageContent />
    </Suspense>
  );
}
