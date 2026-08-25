import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Footer, İletişim/Canlı Destek sayfaları gibi yerlerde tekrar tekrar koda
// gömülü duran iletişim bilgilerinin tek kaynağı — admin/ayarlar üzerinden
// düzenlenir. Sabit bir id kullanıyoruz ki aynı anda gelen birden fazla
// istek (ör. footer + iletişim sayfası aynı sayfa yüklemesinde) yanlışlıkla
// iki ayrı kayıt oluşturmasın; upsert bunu atomik olarak tek satıra indirger.
export const SITE_SETTINGS_ID = "000000000000000000000001";

export const getSiteSettings = cache(async () => {
  return prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {},
    create: { id: SITE_SETTINGS_ID },
  });
});

// Admin panelde numara "+905448010433" gibi tek parça girilir (wa.me/tel:
// linkleri için gereken format); ekranda okunması kolay olsun diye
// "+90 544 801 04 33" şeklinde gruplayarak gösteriyoruz. Türkiye cep telefonu
// kalıbına (+90 + 10 hane) uymuyorsa olduğu gibi geri döner.
export function formatSupportPhone(raw: string): string {
  const match = raw.match(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (!match) return raw;
  const [, a, b, c, d] = match;
  return `+90 ${a} ${b} ${c} ${d}`;
}
