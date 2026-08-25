import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/catalog-server";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/site-url";

// Google'a hangi sayfaların var olduğunu ve ne sıklıkla değiştiğini söyler.
// Daha önce hiç yoktu — ürün sayfaları (en önemli, en çok sayıda sayfa)
// arama motorlarının kendi keşfine kalmıştı. Ürünler ve blog yazıları
// veritabanından, geri kalanı statik sayfa listesinden geliyor; yeni bir
// ürün/blog yazısı eklendiğinde elle güncellemeye gerek yok.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/urun/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const staticPages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/kategori", priority: 0.9, changeFrequency: "daily" },
    { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
    { path: "/canli-destek", priority: 0.4, changeFrequency: "monthly" },
    { path: "/ai-sohbet", priority: 0.4, changeFrequency: "monthly" },
    { path: "/bilgi/hakkimizda", priority: 0.5, changeFrequency: "monthly" },
    { path: "/bilgi/sikca-sorulan-sorular", priority: 0.5, changeFrequency: "monthly" },
    { path: "/bilgi/iletisim", priority: 0.5, changeFrequency: "monthly" },
    { path: "/bilgi/hizmet-sartlari", priority: 0.3, changeFrequency: "yearly" },
    { path: "/bilgi/para-iade-politikasi", priority: 0.3, changeFrequency: "yearly" },
    { path: "/bilgi/musteri-urun-bilgilendirme", priority: 0.3, changeFrequency: "yearly" },
    { path: "/sozlesmeler/cerez-politikasi", priority: 0.2, changeFrequency: "yearly" },
    { path: "/sozlesmeler/mesafeli-sozlesme", priority: 0.2, changeFrequency: "yearly" },
    { path: "/sozlesmeler/aydinlatma-metni", priority: 0.2, changeFrequency: "yearly" },
    { path: "/sozlesmeler/gizlilik-politikasi", priority: 0.2, changeFrequency: "yearly" },
    { path: "/sozlesmeler/on-bilgilendirme-formu", priority: 0.2, changeFrequency: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}
