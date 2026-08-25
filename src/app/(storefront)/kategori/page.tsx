import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/catalog-server";
import { KategoriClient } from "./KategoriClient";

type SearchParams = Promise<{ cat?: string; q?: string }>;

// Sitenin ikinci en yüksek trafikli sayfası, daha önce hiç metadata
// üretmiyordu. ?cat=... seçiliyse başlık o kategoriye özel olur (ör.
// "Koşu Bantları Kirala | Castapos") — genel "Castapos" başlığı yerine
// Google'da arama niyetine daha uygun bir sonuç çıkar.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { cat } = await searchParams;
  if (cat) {
    return {
      title: `${cat} Kirala | Castapos`,
      description: `${cat} kategorisindeki ürünleri satın almadan aylık planlarla kirala. Fiyatları karşılaştır, hemen kiralama planını oluştur.`,
    };
  }
  return {
    title: "Tüm Ürünler | Castapos",
    description: "Spor, ev ve teknoloji ürünlerinin tamamını kategori, marka ve fiyata göre filtreleyerek incele, aylık planlarla kirala.",
  };
}

export default async function KategoriPage() {
  const products = await getActiveProducts();

  const categories = [...new Set(products.map((p) => p.category))].sort((a, b) =>
    a.localeCompare(b, "tr")
  );
  const brands = [...new Set(products.map((p) => p.brand))].sort((a, b) =>
    a.localeCompare(b, "tr")
  );

  return <KategoriClient products={products} categories={categories} brands={brands} />;
}
