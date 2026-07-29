"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, uniqueBrands, categoryTypeConfig, ratingCount, ProductStatic } from "@/lib/products-data";
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

  const activeCategory = urlCat;
  const searchQuery = urlQuery;
  const [selectedBrand, setSelectedBrand] = useState("");
  const [activeType, setActiveType] = useState("Tüm ürünler");
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [advantages, setAdvantages] = useState<RentalAdvantages>({
    campaigned: false,
    buyoutOption: false,
    fastDelivery: false,
  });
  const [sortBy, setSortBy] = useState("featured");

  // Handle Brand checkbox change (only one selected at a time, like static js)
  const handleBrandChange = (brand: string) => {
    setSelectedBrand((prev) => (prev === brand ? "" : brand));
  };

  // Handle Period checkbox change
  const handlePeriodChange = (period: number) => {
    setSelectedPeriods((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    );
  };

  const handleAdvantageToggle = (key: keyof RentalAdvantages) => {
    setAdvantages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper matching main.js matchesType
  const matchesType = (product: ProductStatic, type: string) => {
    if (!type || type === "Tüm ürünler") return true;
    return product.collection === type || product.category === type;
  };

  // Get type config for category filters
  const typeConfig = categoryTypeConfig();

  // Filtering products
  let filteredProducts = PRODUCTS.slice();

  // 1. Filter by category
  if (activeCategory === "Spor Aletleri") {
    filteredProducts = filteredProducts.filter((p) =>
      ["Koşu Bantları", "Yürüyüş Bantları", "Bisiklet", "Fitness"].includes(p.collection)
    );
  } else if (activeCategory && !["Yaz Sezonu", "Premium"].includes(activeCategory)) {
    filteredProducts = filteredProducts.filter(
      (p) => p.collection === activeCategory || p.category === activeCategory
    );
  }
  if (activeCategory === "Premium") {
    filteredProducts = filteredProducts.filter((p) => p.premium);
  }
  if (activeCategory === "Yaz Sezonu") {
    filteredProducts = filteredProducts.filter((p) =>
      ["Bisiklet", "Fitness", "Yürüyüş Bantları"].includes(p.collection)
    );
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
  if (selectedBrand) {
    filteredProducts = filteredProducts.filter((p) => p.brand === selectedBrand);
  }

  // 4. Filter by type option
  filteredProducts = filteredProducts.filter((p) => matchesType(p, activeType));

  // 5. Filter by kiralama süresi (Periods)
  if (selectedPeriods.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.periods.some((per) => selectedPeriods.includes(per))
    );
  }

  // 6. Filter by advantages
  if (advantages.campaigned) {
    filteredProducts = filteredProducts.filter((p) => p.discount !== null);
  }
  if (advantages.buyoutOption) {
    filteredProducts = filteredProducts.filter((p) => p.buyPrice !== null);
  }
  if (advantages.fastDelivery) {
    // Simulated advantage: premium items are marked as fast delivery
    filteredProducts = filteredProducts.filter((p) => p.premium);
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

  const categoryLabel = activeCategory || "Tüm Ürünler";
  const brands = uniqueBrands();

  return (
    <div className={`kategori-shell ${activeCategory === "Spor Aletleri" ? "sports-category-page" : ""}`}>
      <section className="listing-head slim-listing-head">
        <div className="container listing-head-inner slim">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <span>{categoryLabel}</span>
          </nav>
          <div className={`listing-line ${activeCategory === "Spor Aletleri" ? "count-only" : ""}`}>
            {activeCategory !== "Spor Aletleri" && (
              <strong>{activeCategory ? activeCategory + " Kiralama Ürünleri" : "Tüm Kiralama Ürünleri"}</strong>
            )}
            <span>{filteredProducts.length} ürün</span>
          </div>
        </div>
      </section>

      <section className="listing-section">
        <div className="container listing-layout">
          <CategoryFilterSidebar
            brands={brands}
            selectedBrand={selectedBrand}
            onBrandChange={handleBrandChange}
            typeTitle={typeConfig.title}
            typeOptions={typeConfig.options}
            activeType={activeType}
            onTypeChange={setActiveType}
            selectedPeriods={selectedPeriods}
            onPeriodChange={handlePeriodChange}
            advantages={advantages}
            onAdvantageToggle={handleAdvantageToggle}
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
