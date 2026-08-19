import { getProductBySlug, getActiveProducts } from "@/lib/catalog-server";
import { ProductDetailClient } from "./ProductDetailClient";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Ürün Bulunamadı | Castapos" };
  return {
    title: `${p.name} | Castapos`,
    description: p.description.replace(/<[^>]+>/g, " ").trim().slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) {
    notFound();
  }

  const allProducts = await getActiveProducts();
  const similarProducts = allProducts
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 4);

  return <ProductDetailClient product={p} similarProducts={similarProducts} />;
}
