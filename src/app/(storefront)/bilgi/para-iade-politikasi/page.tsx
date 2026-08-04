import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, CreditCard, RotateCcw } from "lucide-react";
import { InfoPageBodyClass } from "../_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Para İade Politikası | Castapos",
  description: "Castapos kiralama sürecinde iptal, iade değerlendirmesi ve ödeme iadesi hakkında bilgilendirme.",
};

const sections = [
  {
    title: "İade değerlendirmesi",
    body: "İade talepleri; ürünün teslimat durumu, kullanım süreci, kiralama planı ve talep gerekçesi dikkate alınarak değerlendirilir. Her ürün grubu için operasyon ve lojistik koşulları farklılık gösterebilir.",
  },
  {
    title: "Teslimat öncesi iptal",
    body: "Ürün teslimata çıkmadan önce yapılan iptal talepleri daha hızlı değerlendirilebilir. Teslimat hazırlığı başlamış siparişlerde lojistik maliyetleri ve işlem durumu ayrıca göz önünde bulundurulur.",
  },
  {
    title: "Teslimat sonrası talepler",
    body: "Ürün teslim edildikten sonra oluşan iade taleplerinde ürünün durumu, kullanım şekli ve varsa teknik inceleme sonucu dikkate alınır. Kullanıcı ürünü teslim aldığı şekilde korumakla yükümlüdür.",
  },
  {
    title: "Ödeme iadesinin yapılması",
    body: "Onaylanan iade tutarları, ödeme altyapısı ve banka süreçlerine bağlı olarak kullanıcının ödeme yaptığı karta veya ilgili ödeme yöntemine yansıtılır. Banka işlem süreleri Castapos dışında değişiklik gösterebilir.",
  },
  {
    title: "Kupon ve kampanya etkisi",
    body: "Siparişte kupon veya kampanya kullanıldıysa iade hesaplaması indirimli tutar üzerinden yapılır. Kampanya koşulları iade değerlendirmesinde ayrıca dikkate alınabilir.",
  },
];

export default function ParaIadePolitikasiPage() {
  return (
    <>
      <InfoPageBodyClass className="page-para-iade-politikasi" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Para İade Politikası
            </nav>
            <span className="section-kicker">İade süreci</span>
            <h1>Para İade Politikası</h1>
            <p>İptal ve iade taleplerinin hangi çerçevede değerlendirildiğini sade şekilde açıklar.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <aside className="info-doc-aside">
            <RotateCcw size={22} />
            <b>İade talebi</b>
            <p>İade sürecinde sipariş numaranı ve ürün durumunu destek ekibiyle paylaşman gerekir.</p>
            <Link className="btn btn-soft" href="/hesap/destek">
              Talep oluştur
            </Link>
          </aside>

          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <span>Castapos Para İade Politikası</span>
              <h2>İptal, değerlendirme ve ödeme iadesi</h2>
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
                Ödeme altyapısı notu
              </h2>
              <p>
                İade işlemleri ödeme sağlayıcısı ve bankaların işlem takvimine göre hesaba yansır. İade onaylandıktan
                sonra bankanın süreci tamamlaması için ek süre gerekebilir.
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
