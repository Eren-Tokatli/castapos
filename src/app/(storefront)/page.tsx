import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/catalog-server";
import { hasDiscount } from "@/lib/catalog-shared";
import { getSiteSettings } from "@/lib/site-settings";
import { HomeClient, type HomeTestimonial } from "./HomeClient";

// Sitenin en çok ziyaret edilen sayfası — daha önce hiç kendi metadata'sı
// yoktu, kök layout'un genel "Castapos / Tek tıkla kirala" başlığını miras
// alıyordu. Google arama sonucunda gösterilecek başlık/açıklama artık
// sayfaya özel ve anahtar kelime içeriyor.
export const metadata: Metadata = {
  title: "Castapos | Spor, Ev ve Teknoloji Ürünlerini Aylık Kirala",
  description:
    "Koşu bandı, kondisyon bisikleti, elektrikli süpürge ve daha fazlasını satın almadan aylık planlarla kirala. Ücretsiz teslimat, esnek süre, 3D Secure güvenli ödeme.",
};

// Yorum metinleri elle yazılmış, belirli bir ürüne değil genel kiralama
// deneyimine değiniyor — bu yüzden hangi ürüne bağlandıkları önemli değil;
// vitrindeki gerçek ürünlerle sırayla eşleştiriliyor.
const TESTIMONIAL_TEXTS = [
  {
    rating: 5,
    name: "Enes S.",
    date: "07 Mart 2026",
    text: "Evde uzun süre kullanmadan satın almak istemiyordum. 3 aylık kiralama benim için çok daha güvenli bir karar oldu.",
  },
  {
    rating: 5,
    name: "Selin K.",
    date: "04 Mart 2026",
    text: "Satın alma düşüncem vardı ama önce kiralamak çok mantıklı geldi. Ürünü deneyip karar vermek gerçekten rahatlatıcı.",
  },
  {
    rating: 4,
    name: "Halil M.",
    date: "27 Şubat 2026",
    text: "Kurulum ve teslimat düzenliydi. Ürünü deneyimledikten sonra hangi modele geçeceğime daha net karar verdim.",
  },
  {
    rating: 5,
    name: "Cemre A.",
    date: "22 Şubat 2026",
    text: "Dönemsel ihtiyaç için satın almadan kullanmak büyük avantaj. Temizlik dönemlerinde gerçekten hayat kurtarıyor.",
  },
];

export default async function HomePage() {
  const [products, settings] = await Promise.all([getActiveProducts(), getSiteSettings()]);

  // getActiveProducts() sonucu zaten createdAt desc (en yeni önce) sırada —
  // "Yeni Gelenler" doğrudan bu sırayı kullanır. "Öne Çıkanlar" farklı
  // ürünler göstersin diye ters sıradan (en eski önce) alınıyor.
  const newProducts = products.slice(0, 8);
  const popularProducts = [...products].reverse().slice(0, 8);
  const flashSaleProducts = products.filter(hasDiscount).slice(0, 12);

  const testimonials: HomeTestimonial[] = TESTIMONIAL_TEXTS.map((t, i) => ({
    ...t,
    product: products[i % Math.max(products.length, 1)],
  })).filter((t) => t.product);

  const banners = [...settings.banners]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => ({ url: b.url, alt: b.alt, href: b.href || undefined }));

  // Sabit 3 slot — admin panelden doldurulmamış bir pozisyon null olarak
  // geçer, HomeClient kendi varsayılan (gradient) görseline döner.
  const campaignTiles = Array.from({ length: 3 }, (_, i) => {
    const t = settings.campaignTiles[i];
    return t?.url ? { url: t.url, alt: t.alt, href: t.href || undefined } : null;
  });

  return (
    <HomeClient
      popularProducts={popularProducts}
      newProducts={newProducts}
      flashSaleProducts={flashSaleProducts}
      testimonials={testimonials}
      banners={banners}
      bannerIntervalSeconds={settings.bannerIntervalSeconds}
      campaignTiles={campaignTiles}
    />
  );
}
