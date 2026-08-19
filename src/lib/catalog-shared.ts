// Storefront'un ihtiyaç duyduğu ürün şekli ve saf (Prisma'sız) fiyat
// hesaplama yardımcıları — hem sunucu bileşenlerinde hem "use client"
// bileşenlerinde import edilebilir. Prisma'ya dokunan gerçek veri çekme
// fonksiyonları için bkz. catalog-server.ts (sadece sunucuda import edilir).

export interface CatalogRentalTier {
  label: string;
  durationMonths: number;
  price: number;
  originalPrice: number | null;
}

export interface CatalogSpec {
  label: string;
  value: string;
}

export interface CatalogProduct {
  id: string; // = DB slug (URL'de ve sepet/favori kayıtlarında kullanılan kimlik)
  dbId: string; // gerçek Prisma ObjectId — sipariş oluştururken kullanılır
  name: string;
  code: string; // sku
  brand: string;
  category: string; // çözümlenmiş birincil kategori adı
  collection: string;
  badge: string | null;
  premium: boolean;
  image: string;
  images: string[];
  description: string; // ham (decode edilmiş) HTML açıklama
  metaTitle: string | null;
  metaDescription: string | null;
  specs: CatalogSpec[];
  rentalTiers: CatalogRentalTier[];
  periods: number[]; // rentalTiers'tan türetilen, sıralı, tekil ay listesi
}

export function defaultPeriod(p: CatalogProduct): number {
  if (p.periods.length === 0) return 0;
  return p.periods.includes(3) ? 3 : p.periods[0];
}

function findTier(p: CatalogProduct, period: number): CatalogRentalTier | undefined {
  return (
    p.rentalTiers.find((t) => t.durationMonths === period) ??
    p.rentalTiers.find((t) => t.durationMonths === defaultPeriod(p)) ??
    p.rentalTiers[0]
  );
}

// Gerçek kira paketi fiyatı — eski statik dosyadaki gibi tek bir taban
// fiyata sabit çarpanlar uygulamak yerine, admin'in o süre için girdiği
// gerçek tutarı döner.
export function monthlyPrice(p: CatalogProduct, period: number): number {
  return findTier(p, period)?.price ?? 0;
}

// Seçili süredeki gerçek indirim varsa "eski" (indirim öncesi) aylık fiyatı
// döner; yoksa null. Kartta üstü çizili fiyat göstermek için kullanılır.
export function originalMonthlyPrice(p: CatalogProduct, period: number): number | null {
  const tier = findTier(p, period);
  if (!tier || !tier.originalPrice || tier.originalPrice <= tier.price) return null;
  return tier.originalPrice;
}

export function dailyPrice(p: CatalogProduct, period: number): number {
  const m = Number(period || defaultPeriod(p)) || 1;
  const total = monthlyPrice(p, m) * m;
  return Math.max(1, Math.round(total / (m * 30)));
}

// Seçili (veya varsayılan) süredeki gerçek indirim varsa "-%20" gibi bir
// etiket döner; yoksa null. Kartlardaki rozet için kullanılır.
export function discountLabel(p: CatalogProduct, period?: number): string | null {
  const tier = findTier(p, period ?? defaultPeriod(p));
  if (!tier || !tier.originalPrice || tier.originalPrice <= tier.price) return null;
  const pct = Math.round((1 - tier.price / tier.originalPrice) * 100);
  return pct > 0 ? `-%${pct}` : null;
}

export function hasDiscount(p: CatalogProduct): boolean {
  return p.rentalTiers.some((t) => t.originalPrice && t.originalPrice > t.price);
}

// En düşük aylık fiyat — "X TL'den başlayan fiyatlarla" gibi vitrin
// metinlerinde ve fiyat aralığı filtrelerinde kullanılır.
export function startingPrice(p: CatalogProduct): number {
  if (p.rentalTiers.length === 0) return 0;
  return Math.min(...p.rentalTiers.map((t) => t.price));
}

// Gerçek bir değerlendirme sayısı yok; eski statik dosyadaki gibi fiyattan
// türetilen kozmetik bir sayı üretir (gerçek Review verisine bağlanana kadar).
export function ratingCount(p: CatalogProduct): number {
  return Math.floor((startingPrice(p) % 900) + 42);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value) + " TL";
}

// Eski (legacy) ürünlerin description alanı, PHP sitesinden aktarılırken
// çift kaçışlı kalmış — gerçek "<p>" yerine literal "&lt;p&gt;" karakterleri
// duruyor. Sadece bu ürünlerde görülen temel HTML entity'lerini çözer.
export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}
