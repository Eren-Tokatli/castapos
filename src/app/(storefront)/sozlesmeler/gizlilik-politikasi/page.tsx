import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, ShieldCheck } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Gizlilik ve Güvenlik Politikası | Castapos",
  description: "Castapos gizlilik, veri güvenliği, çerezler, ödeme ve hesap güvenliği politikası.",
};

const sections = [
  {
    title: "Gizlilik yaklaşımımız",
    body: "Castapos, kullanıcıların platform üzerindeki ürün inceleme, kiralama, ödeme, teslimat ve destek süreçlerinde paylaştığı bilgilerin gizliliğini korumayı önemser. Kişisel veriler yalnızca hizmetin sunulması, geliştirilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenir.",
  },
  {
    title: "Toplanan bilgiler",
    body: "Hesap oluşturma, sipariş, ödeme, teslimat ve destek adımlarında ad soyad, iletişim bilgileri, adres bilgileri, sipariş tercihleri, ödeme işlem bilgileri ve platform kullanım kayıtları işlenebilir.",
  },
  {
    title: "Veri güvenliği",
    body: "Hesap, ödeme ve sipariş süreçlerinde yetkisiz erişimi önlemek için teknik ve idari güvenlik önlemleri uygulanır. Ödeme adımları güvenli ödeme altyapıları üzerinden yürütülür.",
  },
  {
    title: "Çerezler ve kullanım verileri",
    body: "Platform deneyimini iyileştirmek, arama ve kategori tercihlerini anlamak, performansı ölçmek ve güvenliği sağlamak amacıyla çerezler ve benzeri teknolojiler kullanılabilir.",
  },
  {
    title: "Üçüncü taraf hizmetler",
    body: "Ödeme, kargo/teslimat, destek, analiz ve bildirim süreçlerinde hizmet sağlayıcılarla sınırlı veri paylaşımı yapılabilir. Paylaşım, hizmetin gerektirdiği kapsamla sınırlı tutulur.",
  },
];

export default function GizlilikPolitikasiPage() {
  return (
    <>
      <InfoPageBodyClass className="page-gizlilik-politikasi" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Gizlilik ve Güvenlik Politikası
            </nav>
            <h1>Gizlilik ve Güvenlik Politikası</h1>
            <p>Kişisel verilerin gizliliği, platform güvenliği ve kullanıcı deneyimi için temel bilgilendirme.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>Veri gizliliği ve platform güvenliği</h2>
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
                Kullanıcı hakları
              </h2>
              <p>
                Kişisel verilerin işlenmesine ilişkin taleplerini Castapos iletişim kanalları üzerinden iletebilirsin.
                Başvurular, yürürlükteki mevzuat kapsamında değerlendirilir.
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
