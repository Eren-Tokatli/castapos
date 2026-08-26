import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Aydınlatma Metni | Castapos",
  description: "6698 sayılı KVKK kapsamında Castapos'un kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

// Bu metin castapos.com'daki resmi KVKK Aydınlatma Metni'nden alınmıştır.
const sections: { title: string; body: string[] }[] = [
  {
    title: "Veri sorumlusu",
    body: [
      "CASTAPOS YAZILIM ÇÖZÜMLERİ VE ELEKTRONİK TİCARET A.Ş. olarak (“Şirket”) ilgili kişilerin kişisel verilerini, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili sair mevzuat kapsamında, veri sorumlusu sıfatı ile işlediğimizi tarafınıza bildiriyoruz.",
    ],
  },
  {
    title: "Kişisel verilerin hangi amaçla işleneceği",
    body: [
      "Kişisel veriler; Şirketimiz tarafından sunulan ürün ve hizmetlerden sizleri faydalandırmak için gerekli çalışmaların iş birimlerimiz tarafından yapılması, ürün ve hizmetlerin sizlere önerilmesi, satış ve pazarlaması için pazar araştırması faaliyetlerinin planlanması ve/veya icrası, teklif alma uygunluğunu artırmak ve teklif hazırlama sürecinin yürütülmesi için sizinle iletişime geçilmesi, satış sonrası destek hizmetlerinin planlanması ve yürütülmesi, ilgili kişilerin hukuki, teknik ve ticari işlem güvenliğinin temin edilmesi, ürün ve hizmetlerimize dair kalite takibinin sağlanması ve tedarik edilen ürünlerin takibi, finans ve/veya muhasebe işlerinin yürütülmesi, ödeme gücünün tespiti ve finansal özgeçmiş sorgulamasının yapılması amaçlarıyla işlenecektir.",
    ],
  },
  {
    title: "İşlenen kişisel verilerin yurt içinde kimlere ve hangi amaçla aktarılabileceği",
    body: [
      "Kişisel veriler, KVKK'nın 8(2)(a) maddesi uyarınca ilgili kişinin açık rızası aranmaksızın; Şirketimizin aracılık yaptığı platform hizmeti açısından hizmeti esas ifa edecek olan ürünün teslimatını gerçekleştirecek tedarikçilerimize, ürünün gönderiminin yapılması için lojistik firmalarına, garanti işlemleri için üreticilere, finansal riskin kontrolü için meşru menfaat kapsamında kredi risk sorgulaması yapacak olan kuruma, ilgili mevzuat uyarınca yasal yükümlülüklerin yerine getirilebilmesi amacıyla gerekmesi veya talep gelmesi halinde ilgili kamu kurum ve kuruluşlarıyla, ücretlerin tahsilatı kapsamında finans ve/veya muhasebe işlerinin yürütülmesi amacıyla gerekmesi halinde noter, icra daireleri ve/veya mahkemelerle, hukuki süreçlerin takip edilebilmesi amacıyla sır saklama yükümlülüğü çerçevesinde gerektiği kadar avukatlarımızla paylaşılabilir.",
    ],
  },
  {
    title: "Yurt dışına aktarım",
    body: [
      "Açık rıza haricindeki diğer işleme şartlarından birine dayanarak işlenen kişisel verileriniz, Şirket'in ürün ve hizmetlerine dair satış ve satış sonrası sözleşmenin ifası için, Kişisel Verileri Koruma Kurulu (“Kurul”) tarafından yeterli korumaya sahip olduğu ilan edilen yabancı ülkelere veya Türkiye'deki ve ilgili yabancı ülkedeki veri sorumlularının yeterli bir korumayı yazılı olarak taahhüt ettiği ve ilgili aktarım açısından Kurul'un izninin bulunması kaydıyla aktarılacaktır.",
      "Yukarıda açıklanan amaçlar kapsamında işlenen kişisel verilerinizin yurt dışına aktarımı, KVKK ve ilgili sair mevzuat başta olmak üzere, Kurul tarafından alınan kararlar ve ilgili düzenlemelere uygun olarak, Şirketimiz tarafından gerekli özen gösterilerek ve gerekli tüm güvenlik önlemleri alınarak gerçekleştirilecektir.",
    ],
  },
  {
    title: "Kişisel veri toplamanın yöntemi ve hukuki sebebi",
    body: [
      "Kişisel verileriniz, KVKK'nın 5(2) maddesinde yer alan; kanunlarda açıkça öngörülmesi (5651 Sayılı Kanun, e-ticaret mevzuatı), bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması, veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (E-Ticaret Kanunu ve Yönetmeliği, vergi mevzuatı) ve veri sorumlusunun meşru menfaati uyarınca veri işlemenin zorunlu olması (Findeks) hukuki sebeplerine dayanarak; Platform üzerinden üye olunması, iletişim formunun doldurulması, e-posta gönderilmesi, internet sitesinin ziyaret edilmesi ve sosyal medya platformları üzerinden irtibata geçilmesi, müşteri ziyaretleri, seminer veya etkinlikler sırasında kartvizit paylaşımı yapılması, ticari faaliyet amacıyla sizlerle iletişime geçmemizi öneren müşteri ve/veya potansiyel müşteri veya üçüncü kişilerce kişisel verilerinizin tarafımıza iletilmesi suretiyle otomatik veya otomatik olmayan yöntemlerle sözlü, yazılı veya elektronik ortamda elde edilmektedir.",
    ],
  },
  {
    title: "KVKK'nın 11. maddesi kapsamındaki haklarınız",
    body: [
      "KVKK'nın 11. maddesi kapsamında ilgili kişi olarak haklarınız bulunmakta olup, bu haklarınızı; Şirketimize bizzat gelerek, noter aracılığı ile veya iadeli taahhütlü mektup ile, ya da tarafınızca daha önce Şirketimize bildirilen ve sistemlerimizde kayıtlı bulunan elektronik posta adresini veya kayıtlı elektronik posta (KEP) adresinizi kullanmak suretiyle info@castapos.com adresine elektronik posta göndererek iletebilirsiniz.",
    ],
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
            <h1>Aydınlatma Metni</h1>
            <p>Kişisel verilerin hangi amaçlarla işlendiği, kimlerle paylaşılabileceği ve kullanıcı hakları.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Hazırlanmış Aydınlatma Metni</h2>
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
