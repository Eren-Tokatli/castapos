// Client component'lerde kullanılan küçük yardımcı — next/image sadece
// next.config.ts'de tanımlı host'ları optimize edebiliyor. Ürün/banner/
// kampanya görselleri R2'den (yeni upload sistemi) ya da eski/rastgele
// dış linklerden gelebiliyor; ikincisi için `unoptimized` geçilmeli,
// yoksa Next tanımadığı host'ta hata verir.
export function isR2Hosted(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return Boolean(base && url.startsWith(base));
}
