import { getProductBySlug, getActiveProducts, getProductReviews } from "@/lib/catalog-server";
import { startingPrice, type CatalogProduct } from "@/lib/catalog-shared";
import { ProductDetailClient } from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site-url";

// Google'ın arama sonuçlarında fiyat/marka bilgisiyle zengin snippet
// gösterebilmesi için. aggregateRating sadece gerçekten onaylanmış
// (APPROVED) değerlendirme varsa eklenir — sahte puan structured data'sı
// Google'ın spam politikalarına girer, bkz. getProductReviews.
function productJsonLd(p: CatalogProduct, reviewCount: number, averageRating: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images,
    description: p.description.replace(/<[^>]+>/g, " ").trim().slice(0, 500),
    sku: p.code,
    brand: { "@type": "Brand", name: p.brand },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/urun/${p.id}`,
      priceCurrency: "TRY",
      price: startingPrice(p),
      availability: "https://schema.org/InStock",
      // Satılık değil kiralık ürün olduğunu belirten standart (GoodRelations) alan.
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Ürün Bulunamadı | Castapos" };
  return {
    title: p.metaTitle || `${p.name} | Castapos`,
    description: p.metaDescription || p.description.replace(/<[^>]+>/g, " ").trim().slice(0, 160),
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

  const [allProducts, reviews] = await Promise.all([
    getActiveProducts(),
    getProductReviews(p.dbId),
  ]);
  const similarProducts = allProducts
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 4);

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p, reviewCount, averageRating)) }}
      />
      <ProductDetailClient product={p} similarProducts={similarProducts} reviews={reviews} />
    </>
  );
}
