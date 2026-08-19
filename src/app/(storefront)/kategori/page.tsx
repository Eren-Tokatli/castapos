import { getActiveProducts } from "@/lib/catalog-server";
import { KategoriClient } from "./KategoriClient";

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
