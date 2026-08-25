// SEO dosyalarında (robots.txt, sitemap.xml, JSON-LD, canonical/OG URL'ler)
// kullanılan tek mutlak domain kaynağı. Canlı domain değişirse ya da
// staging'de farklıysa NEXT_PUBLIC_SITE_URL env değişkenini güncellemek yeterli.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.castapos.com").replace(/\/$/, "");
