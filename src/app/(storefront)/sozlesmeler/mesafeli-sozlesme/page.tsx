import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, FileSignature, PackageCheck } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Mesafeli Sözleşme | Castapos",
  description: "Castapos mesafeli kiralama ve satış süreçlerine ilişkin sözleşme bilgilendirmesi.",
};

const sections = [
  {
    title: "Taraflar ve konu",
    body: "Bu metin, Castapos platformu üzerinden kullanıcı ile Castapos arasında elektronik ortamda kurulan ürün kiralama veya uygun ürünlerde satın alma süreçlerine ilişkin temel hükümleri açıklar.",
  },
  {
    title: "Ürün ve fiyat bilgisi",
    body: "Ürün adı, marka, teknik özellikler, kiralama süresi, aylık ödeme tutarı, varsa satın alma bedeli, teslimat ve kampanya bilgileri sipariş onayı öncesinde kullanıcıya gösterilir.",
  },
  {
    title: "Siparişin kurulması",
    body: "Kullanıcı sepet ve ödeme adımlarındaki bilgileri onayladığında kiralama planı veya satın alma siparişi oluşturulur. Siparişin tamamlanması ödeme ve operasyon uygunluğuna bağlıdır.",
  },
  {
    title: "Teslimat ve ifa",
    body: "Teslimat adresi, ürün grubu ve operasyon kapsamına göre teslimat planı oluşturulur. Kurulum veya randevu gerektiren ürünlerde kullanıcı ile iletişime geçilebilir.",
  },
  {
    title: "Cayma, iptal ve iade",
    body: "Cayma, iptal ve iade talepleri ürünün niteliği, teslimat durumu, kullanım süreci ve ilgili mevzuat çerçevesinde değerlendirilir. Detaylar ilgili iade ve bilgilendirme sayfalarında yer alır.",
  },
];

export default function MesafeliSozlesmePage() {
  return (
    <>
      <InfoPageBodyClass className="page-mesafeli-sozlesme" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Mesafeli Sözleşme
            </nav>
            <span className="section-kicker">Sözleşmeler</span>
            <h1>Mesafeli Sözleşme</h1>
            <p>Elektronik ortamda oluşturulan kiralama ve uygun ürünlerde satın alma süreçleri için ana hükümler.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <aside className="info-doc-aside">
            <FileSignature size={22} />
            <b>Sipariş öncesi kontrol</b>
            <p>Ürün, süre, fiyat, teslimat ve ödeme özetini onaylamadan önce kontrol et.</p>
            <Link className="btn btn-soft" href="/sozlesmeler/on-bilgilendirme-formu">
              Ön bilgilendirme
            </Link>
          </aside>

          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <span>Castapos Mesafeli Sözleşme</span>
              <h2>Kiralama planının elektronik ortamda kurulması</h2>
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
                <PackageCheck size={18} />
                Ürün sorumluluğu
              </h2>
              <p>
                Kiralanan ürün, teslim alındığı andan iade sürecine kadar kullanıcı tarafından özenli şekilde
                kullanılmalı; hasar, arıza veya eksik parça durumları gecikmeden bildirilmelidir.
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
