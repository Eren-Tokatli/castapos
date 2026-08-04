import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, Database, ShieldCheck } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Aydınlatma Metni | Castapos",
  description: "Castapos KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

const sections = [
  {
    title: "Veri sorumlusu",
    body: "Castapos, platform üzerinden yürütülen hesap, sipariş, teslimat, ödeme ve destek süreçlerinde işlenen kişisel veriler bakımından ilgili mevzuat kapsamında veri sorumlusu veya ilgili işleme rolüyle hareket edebilir.",
  },
  {
    title: "Kişisel verilerin işlenme amaçları",
    body: "Kişisel veriler; üyelik işlemleri, sipariş oluşturma, kiralama planının yürütülmesi, teslimat organizasyonu, ödeme işlemleri, destek taleplerinin yönetimi, güvenlik ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenebilir.",
  },
  {
    title: "Aktarım yapılabilecek taraflar",
    body: "Veriler; ödeme altyapısı sağlayıcıları, teslimat ve operasyon hizmet sağlayıcıları, destek ve bildirim araçları, yetkili kamu kurumları ve hukuki yükümlülüklerin gerektirdiği taraflarla sınırlı şekilde paylaşılabilir.",
  },
  {
    title: "Toplama yöntemi ve hukuki sebep",
    body: "Veriler; web sitesi, hesap formları, sipariş akışı, ödeme sayfası, destek talepleri ve iletişim kanalları üzerinden elektronik yöntemlerle toplanır. İşleme faaliyetleri sözleşmenin kurulması/ifası, hukuki yükümlülük, meşru menfaat ve açık rıza hukuki sebeplerine dayanabilir.",
  },
  {
    title: "İlgili kişi hakları",
    body: "Kullanıcılar kişisel verileriyle ilgili bilgi talep etme, düzeltme, silme veya yok etme isteme, aktarıldığı üçüncü kişileri öğrenme ve mevzuatta yer alan diğer haklarını kullanma taleplerini Castapos iletişim kanalları üzerinden iletebilir.",
  },
];

export default function AydinlatmaMetniPage() {
  return (
    <>
      <InfoPageBodyClass className="page-aydinlatma-metni" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Aydınlatma Metni
            </nav>
            <span className="section-kicker">KVKK</span>
            <h1>Aydınlatma Metni</h1>
            <p>Kişisel verilerin hangi amaçlarla işlendiği, kimlerle paylaşılabileceği ve kullanıcı hakları.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <aside className="info-doc-aside">
            <Database size={22} />
            <b>KVKK bilgilendirmesi</b>
            <p>Aydınlatma metni, kişisel verilerin işlenmesine ilişkin temel bilgileri açıklar.</p>
            <Link className="btn btn-soft" href="/bilgi/iletisim">
              Başvuru ilet
            </Link>
          </aside>

          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <span>Castapos Aydınlatma Metni</span>
              <h2>Kişisel verilerin işlenmesine ilişkin bilgilendirme</h2>
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
                Güvenlik önlemleri
              </h2>
              <p>
                Kişisel verilerin güvenliği için erişim kontrolü, yetkilendirme, kayıt takibi ve uygun teknik/idari
                önlemler uygulanır. Süreçler platformun operasyon ihtiyaçlarına göre güncellenebilir.
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
