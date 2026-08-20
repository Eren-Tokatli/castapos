import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Hizmet Şartları | Castapos",
  description: "Castapos platformunun kullanım, kiralama, hesap, ödeme ve destek süreçlerine ilişkin hizmet şartları.",
};

const sections = [
  {
    title: "Platformun kapsamı",
    body: "Castapos; kullanıcıların ürünleri inceleyebildiği, kiralama dönemlerini karşılaştırabildiği ve uygun ürünlerde kiralama planı oluşturabildiği dijital bir platformdur. Sunulan ürün, fiyat, stok ve teslimat bilgileri ürün tipine ve operasyon kapsamına göre değişebilir.",
  },
  {
    title: "Hesap ve kullanıcı bilgileri",
    body: "Kiralama, sipariş takibi ve destek süreçlerinde doğru iletişim ve teslimat bilgileri gerekir. Kullanıcı, hesap oluştururken veya sipariş verirken paylaştığı bilgilerin güncel ve doğru olmasından sorumludur.",
  },
  {
    title: "Kiralama planı ve ödeme",
    body: "Ürün detayında gösterilen kiralama süresi ve aylık ödeme tutarı kullanıcıya karar aşamasında sunulur. Sepette yer alan ödeme özeti, sipariş onayı öncesinde kontrol edilmelidir.",
  },
  {
    title: "Teslimat ve ürün kullanımı",
    body: "Teslimat süreci ürün tipi, teslimat adresi ve operasyon uygunluğuna göre planlanır. Kullanıcı, kiralanan ürünü kullanım talimatlarına uygun, özenli ve teslim aldığı koşulları gözeterek kullanmalıdır.",
  },
  {
    title: "Destek ve süreç takibi",
    body: "Kullanıcılar hesap paneli üzerinden siparişlerini ve destek taleplerini takip edebilir. Teknik destek, teslimat veya ürünle ilgili talepler için Castapos iletişim kanalları kullanılabilir.",
  },
];

export default function HizmetSartlariPage() {
  return (
    <>
      <InfoPageBodyClass className="page-hizmet-sartlari" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Hizmet Şartları
            </nav>
            <h1>Hizmet Şartları</h1>
            <p>Castapos deneyimini güvenli, şeffaf ve takip edilebilir tutmak için temel kullanım koşulları.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>Kiralama sürecinde bilmen gerekenler</h2>
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
                <AlertCircle size={18} />
                Güncelleme notu
              </h2>
              <p>
                Castapos hizmet şartları, operasyonel ihtiyaçlar ve platform geliştirmeleri doğrultusunda güncellenebilir.
                Güncel metinler her zaman ilgili sayfalar üzerinden erişilebilir.
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
