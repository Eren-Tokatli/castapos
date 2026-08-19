import { getActiveProducts } from "@/lib/catalog-server";
import { hasDiscount } from "@/lib/catalog-shared";
import { HomeClient, type HomeTestimonial } from "./HomeClient";

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
  const products = await getActiveProducts();

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

  return (
    <HomeClient
      popularProducts={popularProducts}
      newProducts={newProducts}
      flashSaleProducts={flashSaleProducts}
      testimonials={testimonials}
    />
  );
}
