import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "next-auth/react";
import { getActiveProducts } from "@/lib/catalog-server";

// Header'daki sepet/favori/arama widget'ları ve anasayfa/kategori sayfaları
// admin panelden yönetilen canlı ürün kataloğunu okuyor — bu sayfalar build
// anında statik olarak dondurulursa admin'de yapılan değişiklikler yeni bir
// deploy yapılana kadar sitede görünmez.
//
// Önce bunu force-dynamic yaptık (her istekte DB'ye git) ama bu, tüm site
// genelinde (sözleşmeler/iletişim gibi ürünle ilgisi olmayan sayfalar dahil)
// her sayfa yüklemesinde ~100-500KB'lık katalog verisini yeniden çekip
// yeniden gönderiyordu — gözle görülür performans düşüşüne yol açtı.
// 60 saniyelik ISR önbelleği aynı tazeliği (admin değişikliği ~1 dk içinde
// yansır) çok daha düşük maliyetle sağlıyor. Oturum/cookie gerektiren
// rotalar (admin, hesap sayfaları) zaten kendi içlerinde otomatik dynamic
// olur, bu ayardan etkilenmez.
export const revalidate = 60;

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("castaposTheme");
    document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Castapos",
  description: "Tek tıkla kirala.",
  verification: {
    google: "PuLzYlrAA28DEYmp6inmyVjNQmD_7zuUY6b3ketthZA",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = await getActiveProducts();
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ThemeProvider>
            <StoreProvider initialProducts={products}>
              {children}
            </StoreProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
