import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  CatalogProduct,
  decodeHtmlEntities,
} from "@/lib/catalog-shared";

// Admin panelde yönetilen gerçek Prisma kataloğunu storefront'un ihtiyaç
// duyduğu şekle (CatalogProduct) çeviren tek yer burası. Ürün/kategori
// çekme fonksiyonları burada, `cache()` ile sarılı — aynı istek (request)
// içinde birden fazla sunucu bileşeni aynı veriyi isterse (ör. kök layout +
// sayfanın kendisi) Mongo'ya tekrar tekrar gidilmez.

type ProductWithRelations = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

// Liste görünümlerinde (kart, sepet, header arama/sepet çekmecesi) hiçbir
// zaman kullanılmayan ama tek bir ürün ortalama ~5KB olan description
// alanı — 70+ ürünlük listede bu tek başına ~380KB gereksiz veri demek
// (hem Mongo'dan çekilir hem her sayfa yüklemesinde tarayıcıya gönderilir).
// Liste sorguları bu alanları hiç seçmez; sadece ürün detay sayfası
// (getProductBySlug, tek kayıt) tam veriyi çeker.
const LIST_SELECT = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  images: true,
  brand: true,
  badge: true,
  collection: true,
  saleMode: true,
  rentalTiers: true,
  categoryIds: true,
  quantity: true,
  stockStatus: true,
  status: true,
  createdAt: true,
} as const;

type ProductListRow = Awaited<ReturnType<typeof prisma.product.findMany<{ select: typeof LIST_SELECT }>>>[number];

function resolveCategoryName(
  categoryIds: string[],
  categoryMap: Map<string, string>
): string {
  for (const id of categoryIds) {
    const name = categoryMap.get(id);
    if (name) return name;
  }
  return "Diğer";
}

function toCatalogProduct(
  product: ProductWithRelations | ProductListRow,
  categoryMap: Map<string, string>
): CatalogProduct {
  const images = product.images.map((img) => img.url).filter(Boolean);
  const rentalTiers = product.rentalTiers
    .slice()
    .sort((a, b) => a.durationMonths - b.durationMonths)
    .map((t) => ({
      label: t.label,
      durationMonths: t.durationMonths,
      price: t.price,
      originalPrice: t.originalPrice ?? null,
    }));
  const periods = [...new Set(rentalTiers.map((t) => t.durationMonths))].sort((a, b) => a - b);
  const category = resolveCategoryName(product.categoryIds, categoryMap);

  return {
    id: product.slug,
    dbId: product.id,
    name: product.name,
    code: product.sku,
    brand: product.brand?.trim() || "Castapos",
    category,
    collection: product.collection?.trim() || category,
    badge: product.badge?.trim() || null,
    premium: product.badge === "Premium",
    image: images[0] || "/assets/products/voit-super-fit.svg",
    images: images.length > 0 ? images : ["/assets/products/voit-super-fit.svg"],
    // Liste sorgularında (LIST_SELECT) bu alanlar hiç çekilmiyor — sadece
    // getProductBySlug'ın tam kaydında var.
    description: "description" in product && product.description ? decodeHtmlEntities(product.description) : "",
    metaTitle: "metaTitle" in product ? product.metaTitle?.trim() || null : null,
    metaDescription: "metaDescription" in product ? product.metaDescription?.trim() || null : null,
    specs: "specs" in product ? product.specs.map((s) => ({ label: s.label, value: s.value })) : [],
    rentalTiers,
    periods,
  };
}

async function buildCategoryMap(): Promise<Map<string, string>> {
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  return new Map(categories.map((c) => [c.id, c.name]));
}

// Aktif ve en az bir kira paketi olan ürünler — kira paketi olmayan ürünler
// fiyatsız/kiralanamaz durumda olduğundan vitrinde gösterilmez (admin'de
// fiyat girildiğinde otomatik görünür hale gelir).
export const getActiveProducts = cache(async (): Promise<CatalogProduct[]> => {
  const [products, categoryMap] = await Promise.all([
    prisma.product.findMany({
      where: { status: true, rentalTiers: { isEmpty: false } },
      orderBy: { createdAt: "desc" },
      select: LIST_SELECT,
    }),
    buildCategoryMap(),
  ]);
  return products.map((p) => toCatalogProduct(p, categoryMap));
});

export const getProductBySlug = cache(async (slug: string): Promise<CatalogProduct | null> => {
  const [product, categoryMap] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    buildCategoryMap(),
  ]);
  if (!product || !product.status || product.rentalTiers.length === 0) return null;
  return toCatalogProduct(product, categoryMap);
});

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Ürün detay sayfasındaki değerlendirmeler — sadece admin onayından geçmiş
// (APPROVED) yorumlar storefront'ta görünür, bkz. admin/degerlendirmeler.
export const getProductReviews = cache(async (productId: string): Promise<ProductReview[]> => {
  const reviews = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  return reviews.map((r) => ({
    id: r.id,
    name: r.user
      ? `${r.user.firstName}${r.user.lastName ? ` ${r.user.lastName.charAt(0)}.` : ""}`.trim()
      : "Castapos Müşterisi",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  }));
});
