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
// deploy yapılana kadar sitede görünmez. Kök layout'u dynamic işaretlemek,
// altındaki tüm rotaların her istekte taze veriyle render edilmesini
// garantiler (zaten çoğu rota oturum/cookie nedeniyle dinamikti).
export const dynamic = "force-dynamic";

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
