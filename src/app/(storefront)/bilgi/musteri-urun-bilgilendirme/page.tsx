import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, PackageCheck, ShieldCheck } from "lucide-react";
import { InfoPageBodyClass } from "../_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Müşteri Ürün Bilgilendirme | Castapos",
  description: "Castapos ürün seçimi, teslimat, kullanım ve iade öncesi müşteri ürün bilgilendirme metni.",
};

const sections = [
  {
    title: "Ürün bilgilerini kontrol et",
    body: "Kiralama kararı vermeden önce ürün adı, marka, görsel, açıklama, teknik özellik, kiralama süresi ve fiyat bilgilerini dikkatlice incelemen önerilir.",
  },
  {
    title: "Kullanım amacına uygun seçim",
    body: "Her ürün farklı kullanım senaryoları için uygundur. Spor aleti, ev aleti veya elektronik ürünlerde kullanım alanı, kapasite ve teknik beklentiler ürün detayında değerlendirilmelidir.",
  },
  {
    title: "Teslimat ve kurulum bilgisi",
    body: "Teslimat koşulları ürün grubuna, adrese ve operasyon uygunluğuna göre değişebilir. Kurulum gerektiren ürünlerde teslimat öncesi adres ve iletişim bilgilerinin doğru olması önemlidir.",
  },
  {
    title: "Ürünü özenli kullanma",
    body: "Kiralanan ürün, kullanım talimatlarına uygun ve özenli şekilde kullanılmalıdır. Hasar, arıza veya beklenmeyen durumlarda destek ekibine gecikmeden bilgi verilmelidir.",
  },
  {
    title: "İade öncesi hazırlık",
    body: "Kiralama süresi sonunda ürünün aksesuarları, kabloları ve teslim edilen parçalarıyla birlikte hazırlanması beklenir. Eksik veya hasarlı parçalar süreç değerlendirmesine dahil edilebilir.",
  },
];

export default function MusteriUrunBilgilendirmePage() {
  return (
    <>
      <InfoPageBodyClass className="page-musteri-urun-bilgilendirme" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Müşteri Ürün Bilgilendirme
            </nav>
            <span className="section-kicker">Ürün bilgilendirme</span>
            <h1>Müşteri Ürün Bilgilendirme</h1>
            <p>Ürün seçimi, teslimat, kullanım ve iade öncesinde dikkat edilmesi gereken temel noktalar.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <aside className="info-doc-aside">
            <PackageCheck size={22} />
            <b>Ürün kontrolü</b>
            <p>Planını onaylamadan önce ürün bilgilerini ve kiralama süresini sepetten tekrar kontrol et.</p>
            <Link className="btn btn-soft" href="/kategori">
              Ürünleri incele
            </Link>
          </aside>

          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <span>Castapos Müşteri Ürün Bilgilendirme</span>
              <h2>Kiralama öncesi ve sonrası ürün sorumlulukları</h2>
            </div>
            {sections.map((section) => (
              <section key={section.title}>
                <h2>
                  <BadgeCheck size={18} />
                  {section.title}
                </h2>
                <p>{section.body}</p>
              </section>
            ))}
            <section>
              <h2>
                <ShieldCheck size={18} />
                Destek bildirimi
              </h2>
              <p>
                Ürünle ilgili hasar, arıza, teslimat sorunu veya kullanım desteği ihtiyacında iletişim sayfasından ya da
                hesap panelinden destek talebi oluşturabilirsin.
              </p>
            </section>
            <div className="info-doc-note">
              <CalendarClock size={18} />
              <span>Son güncelleme: 30 Temmuz 2026</span>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
