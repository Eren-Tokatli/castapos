import { getProductBySlug, getActiveProducts } from "@/lib/catalog-server";
import { startingPrice, type CatalogProduct } from "@/lib/catalog-shared";
import { ProductDetailClient } from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site-url";

// Google'ın arama sonuçlarında fiyat/marka bilgisiyle zengin snippet
// gösterebilmesi için — daha önce hiç yapılandırılmış veri yoktu. Gerçek bir
// değerlendirme/puan verisi olmadığından (bkz. reviews mock verisi) kasıtlı
// olarak aggregateRating EKLENMİYOR — sahte puan structured data'sı Google'ın
// spam politikalarına girer.
function productJsonLd(p: CatalogProduct) {
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

  const allProducts = await getActiveProducts();
  const similarProducts = allProducts
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p)) }}
      />
      <ProductDetailClient product={p} similarProducts={similarProducts} />
    </>
  );
}
