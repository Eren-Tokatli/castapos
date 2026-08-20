import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, CreditCard } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu | Castapos",
  description: "Castapos sipariş öncesi ürün, fiyat, teslimat, ödeme, cayma ve destek bilgilendirme formu.",
};

const sections = [
  {
    title: "Ürün ve hizmet bilgisi",
    body: "Kullanıcı, sipariş öncesinde ürün adı, marka, ürün görseli, açıklama, teknik özellikler, kiralama süresi ve fiyat bilgilerini ürün detay ve sepet ekranlarından inceleyebilir.",
  },
  {
    title: "Toplam bedel ve ödeme",
    body: "Aylık ödeme toplamı, varsa indirim, KDV dahil bilgilendirmesi ve teslimat bedeli sepet ödeme özetinde gösterilir. Ödeme güvenli ödeme altyapısı üzerinden tamamlanır.",
  },
  {
    title: "Teslimat bilgileri",
    body: "Teslimat, kullanıcının girdiği adres ve operasyon uygunluğuna göre planlanır. Kurulum, randevu veya özel teslimat gerektiren ürünlerde ek iletişim kurulabilir.",
  },
  {
    title: "Cayma ve iade bilgisi",
    body: "Cayma ve iade hakları ürünün niteliği, teslimat durumu ve ilgili mevzuat çerçevesinde değerlendirilir. Kullanıcı, iade politikasını sipariş öncesinde inceleyebilir.",
  },
  {
    title: "Şikayet ve destek kanalları",
    body: "Kullanıcı, ürün veya siparişle ilgili taleplerini hesap panelinden ya da iletişim sayfasındaki kanallar üzerinden Castapos ekibine iletebilir.",
  },
];

export default function OnBilgilendirmeFormuPage() {
  return (
    <>
      <InfoPageBodyClass className="page-on-bilgilendirme-formu" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Ön Bilgilendirme Formu
            </nav>
            <h1>Ön Bilgilendirme Formu</h1>
            <p>Siparişini onaylamadan önce ürün, fiyat, teslimat, ödeme ve iade süreci hakkında temel bilgiler.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>Sipariş öncesi açık ve anlaşılır bilgilendirme</h2>
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
                <CreditCard size={18} />
                Ödeme güvenliği
              </h2>
              <p>
                Ödeme adımları güvenli ödeme altyapısıyla ilerler. Kart bilgilerinin işlenmesi ödeme sağlayıcısının
                güvenli altyapısı üzerinden yürütülür.
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
