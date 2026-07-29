import { getProduct } from "@/lib/products-data";
import { ProductDetailClient } from "./ProductDetailClient";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Ürün Bulunamadı | Castapos" };
  return {
    title: `${p.name} | Castapos`,
    description: p.summary,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) {
    notFound();
  }
  return <ProductDetailClient product={p} />;
}
