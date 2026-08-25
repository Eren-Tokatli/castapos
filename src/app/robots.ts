import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Arama motorlarına hangi sayfaları tarayabileceğini söyler. Daha önce hiç
// yoktu — Google'ın /admin, /hesap gibi özel/oturum gerektiren sayfaları
// taramaması gerektiğine dair hiçbir yönlendirme yoktu.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/hesap",
        "/hesap/",
        "/api/",
        "/sepet",
        "/pay/",
        "/takip/",
        "/siparis/basarili/",
        "/siparis/basarisiz",
        "/premium/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
