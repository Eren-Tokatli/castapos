import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Gizlilik ve Güvenlik Politikası | Castapos",
  description: "Castapos gizlilik ve güvenlik politikası — kişisel verilerin korunması, çerez kullanımı ve veri paylaşımı esasları.",
};

// Bu metin castapos.com'daki resmi Gizlilik ve Güvenlik Politikası'ndan
// alınmıştır. Sitenin kullandığı analitik/pazarlama araçlarının güncel ve
// eksiksiz listesi için bkz. ayrı Çerez Politikası sayfası.
const sections: { title: string; body: string[] }[] = [
  {
    title: "Amaç ve kapsam",
    body: [
      "İşbu Gizlilik Politikası'nın amacı, www.castapos.com adresinde yer alan siteyi (“Platform”) ziyaret eden, Platform ile etkileşime giren, üye olarak kaydolan kişiler (“MÜŞTERİ”) tarafından Castapos Yazılım Çözümleri ve Elektronik Ticaret A.Ş. (“CASTAPOS”) ile paylaşılan bilgi ve verilerin kullanımına ilişkin koşul ve şartları tespit etmektir. Gizlilik Politikası, MÜŞTERİ ile akdedilen Hizmet ve Kullanım Sözleşmesi'nin eki ve ayrılmaz bir parçası niteliğindedir.",
      "İşbu politika ile KVKK Aydınlatma Metni arasında çelişki olması halinde Aydınlatma Metni'nde yer alan hükümler geçerli olacaktır.",
    ],
  },
  {
    title: "Bilgilerin gizliliği ve kullanımı",
    body: [
      "MÜŞTERİ, Platforma kiralama hizmeti almak için CASTAPOS Platformuna üye olmuştur. CASTAPOS, Platform üzerinden kendisine elektronik ortamdan iletilen içerikleri, Sözleşme ile belirlenen amaçlar ve kapsam dışında üçüncü kişilere açıklamayacaktır. Bu kapsamda CASTAPOS, bilgileri gizli tutmayı, gizliliğin sağlanması ve sürdürülmesi, yetkisiz kullanımını veya üçüncü bir kişiye ifşasını önlemek için gerekli tüm tedbirleri almayı ve gerekli özeni göstermeyi taahhüt etmektedir.",
      "Kişisel veriler, KVKK kapsamında Aydınlatma Bildirimi'nin yapılmasıyla işlenecektir. Gerçek kişilerle yürütülecek pazarlama faaliyetleri için açık rıza alınacaktır.",
      "CASTAPOS, MÜŞTERİ'nin Platform üzerinde gerçekleştirdiği kullanım ve işlem bilgilerini anonim hale getirerek; istatistiki değerlendirmelerde, performans değerlendirmelerinde, yıllık rapor ve benzeri raporlarda kullanmak üzere bu amaçların gerçekleştirilmesi için gereken sürede saklayabilir, işleyebilir ve iş ortaklarına iletebilir. Bu işlemler CASTAPOS'un Gizlilik Politikası hükümlerine aykırılık teşkil etmez.",
      "Platform üzerinden başka site ve uygulamalara link verilmesi mümkün olup, CASTAPOS bu site ve uygulamaların gizlilik uygulamaları ve içeriklerine yönelik herhangi bir sorumluluk taşımamaktadır.",
      "Gizlilik politikamız ile ilgili her türlü soru, öneri veya üyelik iptal işlemi için info@castapos.com mail adresine ileti gönderiniz.",
    ],
  },
  {
    title: "Tarayıcı çerezleri",
    body: [
      "CASTAPOS olarak sahip olduğumuz internet sitemizin (“Platform”) ziyaretçilerinin gizlilik ve kişisel verilerinin korunması haklarını gözeterek ziyaretçilerimize güvenli bir hizmet sunabilmek için kişisel verilerini işlemekte ve çerez hizmetini kullanmaktayız.",
      "Çerez, internet tarayıcınız aracılığı ile erişim sağladığınız cihazlarınıza kaydedilen ve hareketlerinizin hatırlanmasını sağlayan küçük veri depolama dosyalarıdır. Çerezlerin kullanılmasının temel amaçları; kullanımlarınız sonucunda tercih ve alışkanlıklarınızın belirlenmesi ve kişiselleştirilmesi, internet sitesinin daha etkili kullanılabilmesi için teknik hizmetin sağlanması ve 5651 sayılı Kanun başta olmak üzere kanuni ve sözleşmesel yükümlülüklerin yerine getirilebilmesidir.",
      "Platform'un çalışmasını sağlamak için zorunlu tanımlama bilgileri, performans tanımlama bilgileri, işlevsel tanımlama bilgileri ve hedefleme amaçlı tanımlama bilgileri kullanılmaktadır. Saklandığı süre bakımından oturum çerezleri (tarayıcı kapatıldığında sona erer) ve kalıcı çerezler (belirli bir tarihe veya silininceye kadar cihazda kalır) kullanılmaktadır.",
      "Çerezleri dilediğiniz gibi kontrol edebilir veya silebilirsiniz. Çerezleri devre dışı bırakmanız halinde internet sitemiz beklenen şekilde faaliyet göstermeyebilir ve belirli işlevler düzgün çalışmayabilir. Kullanılan analitik/pazarlama araçlarının güncel listesi için Çerez Politikası sayfamızı inceleyebilirsiniz.",
    ],
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
            <p>Kişisel verilerin korunması, çerez kullanımı ve veri paylaşımı esasları.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>CASTAPOS Gizlilik ve Güvenlik Politikası</h2>
            </div>
            {sections.map((section) => (
              <section key={section.title}>
                <h2>
                  <BadgeCheck size={18} />
                  {section.title}
                </h2>
                {section.body.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </section>
            ))}
            <div className="info-doc-note">
              <CalendarClock size={18} />
              <span>Son güncelleme: 26 Ağustos 2026</span>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
