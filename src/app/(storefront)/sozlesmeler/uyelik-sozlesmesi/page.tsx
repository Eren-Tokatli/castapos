import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Üyelik Sözleşmesi | Castapos",
  description: "Castapos üyelik sözleşmesi — üyelik sistemi, bedel, cayma hakkı, sorumluluğun kısıtlanması ve fesih hükümleri.",
};

// Bu metin castapos.com'daki resmi Üyelik Sözleşmesi'nden alınmıştır.
const sections: { title: string; body: string[] }[] = [
  {
    title: "Madde 1 — Taraflar",
    body: [
      "İşbu Üyelik Sözleşmesi (“Sözleşme”), CASTAPOS YAZILIM ÇÖZÜMLERİ VE ELEKTRONİK TİCARET A.Ş. (“CASTAPOS”) ile Platform'a kaydolan “MÜŞTERİ” arasında akdedilmektedir. İşbu üyelik sözleşmesi ve Platformda yer alan diğer kurallar CASTAPOS tarafından sunulan hizmetlere ilişkin şart ve koşulları ve Platformun kullanılmasına ilişkin kuralları düzenlemektedir. Sözleşme, Müşteri tarafından elektronik ortamda kabulü ile birlikte yürürlüğe girecek olup; taraflarca Sözleşme'de belirtilen usuller doğrultusunda sona erdirilmediği sürece yürürlükte kalmaya devam edecektir.",
    ],
  },
  {
    title: "Madde 2 — Tanımlar",
    body: [
      "Hizmet: Abonelik iş modeli ile kiralama ve sonrasında talebe göre satışa dönüşebilecek eşyaların tedarikine yönelik hizmettir.",
      "Tüketici: CASTAPOS hizmetlerinden faydalanmak amacıyla castapos.com adresi üzerinden üyelik sözleşmesini onaylayan gerçek kişi müşteridir.",
      "Platform: İşbu sözleşmeye konu hizmetlerin yönetildiği CASTAPOS'a ait websitesi ve uygulamalardan oluşan sistemdir.",
      "Müşteri Paneli: CASTAPOS ile Tüketici arasındaki bilgi alışverişini sağlamak üzere kullanılacak olan platforma ait arayüzdür.",
      "Müşteri Yöneticisi: Müşterilerin aldıkları hizmetler kapsamında Müşterileri arayarak bilgi veren, gelen soruları yanıtlayan, kiralama risk sistemi çerçevesinde tarafların birbirini daha iyi tanımasını sağlayan CASTAPOS çalışanlarıdır.",
    ],
  },
  {
    title: "Madde 3 — Üyelik sistemi",
    body: [
      "Üyelik ücretsizdir. MÜŞTERİ, CASTAPOS tarafından talep edilen bilgileri tam, doğru ve güncel bir şekilde sağlamasının gerektiğini bildiğini beyan eder. Bu bilgilerde herhangi bir değişiklik olması halinde, söz konusu bilgiler derhal güncellenecektir.",
      "MÜŞTERİ, Platform Müşteri Yöneticilerinin kendisinden istediği bilgileri Müşteri Yönetim Panelinden ve kendisinden istenildiği şekilde paylaşması gerektiğini bildiğini beyan eder. Bu bilgilerin eksik olması, gerçeğe aykırı olarak verilmesi, güncel olmaması veya bilgilerin paylaşılmaması nedeniyle Platform hizmetlerinden faydalanılamamasından CASTAPOS sorumlu tutulamaz.",
      "MÜŞTERİ tarafından Platform'a erişim e-posta adresi ve parolası kullanılarak gerçekleştirilecektir. Kullanıcı parolalarının gizliliğinin ve güvenliğinin korunmasından Müşteri sorumlu olacak olup site üzerinden söz konusu bilgilerin kullanımı ile gerçekleştirilen her türlü faaliyetin müşteri tarafından gerçekleştirildiği kabul edilecek, bu faaliyetlerden doğan her türlü yasal ve cezai sorumluluk müşteriye ait olacaktır.",
    ],
  },
  {
    title: "Madde 4 — Hizmet alımı",
    body: [
      "MÜŞTERİ, üyelik sonrasında satın alma yapabilir. Listelenen ürün ve hizmetlerden dilediğini sepete ekleyip satın alabilir. Her yeni ürün veya hizmet için de işbu Sözleşmenin hükümleri uygulanmaya devam edecektir.",
      "CASTAPOS ürünler için bir üretici gibi garanti vermemektedir. Ürünler ile ilgili bütün sorumluluk ürünün üreticisine aittir.",
      "MÜŞTERİ, hizmetin risklerini en aza indirmek için kendisinden istenen bütün bilgileri doğru ve tam olarak paylaşmayı kabul ve taahhüt eder. Hatalı bilgi paylaşımı sonucu kiralanan ürünün teslim edilememesi, sigortasının geçersiz kalması, kiralamanın riskli olduğuna kanaat getirilmesi gibi sonuçlardan CASTAPOS sorumlu değildir.",
    ],
  },
  {
    title: "Madde 5 — Bedel",
    body: [
      "MÜŞTERİ, ürün listeleme sayfalarındaki süre, bedel ve varsa kampanya koşullarına göre abone olacaktır. Ödemeleri kredi kartı yoluyla yapılabilecektir.",
      "İşlem güvenliği gereği CASTAPOS müşterinin FİNDEKS raporu sorgulamasını yapacaktır. FİNDEKS rapor sonucuna göre CASTAPOS hizmet verip vermemek konusunda serbesttir. Önceden bir ödeme alınmışsa ücret iadesi yapılacaktır.",
      "Sipariş ile birlikte aboneliğin birinci ayının ücreti tahsil edilir. Abonelik süresinin hesaplanmasında ürünün teslim alındığı gün abonelik süresinin başlangıcı olarak kabul edilir. Abonelik süresince her ay tahsilat yapılır.",
      "Abonelik süresinin bitiminin son gününe kadar, abonelik kapsamında kullanılan ürün ile tüm aksesuarları iade edilmek üzere kargoya verilmelidir. Aksi durumda takip eden ay için de abonelik bedeli tahsil edilecektir.",
      "Müşteri, tarafların işlem güvenliği için ürünü iade etmeden hemen önce ürünün fotoğraflarını çekecektir. Müşteri, cihazları iade etmeden önce cihazı fabrika ayarlarına döndürerek ve şifreleri sıfırlayarak göndermeyi taahhüt eder.",
      "Elektronik, spor, anne ve çocuk kategorilerindeki ürünlerin sigortalı olarak abone olunabilmektedir. Mobilya kategorisindeki ürünler ise opsiyonel olarak sigortalanabilir.",
      "CASTAPOS, Müşteri tarafından iletilen iletişim adresine abonelik bedeli kadar faturayı iletecektir. E-fatura kullanıcısı olmayan Müşterilerin e-arşiv faturaları elektronik ortamda oluşturulacak ve muhafaza edilecektir.",
    ],
  },
  {
    title: "Madde 6 — Hizmete uygulanacak kurallar ve tüketiciler için cayma hakkı",
    body: [
      "Hizmetlerin ürüne ait sayfada ilan edildiği şekilde verilecektir. Tüzel kişi ve tacir MÜŞTERİ, tüketiciler ile ilgili mevzuata tabii değildir. Platformda herhangi bir ürün/hizmet için ödeme yapıldıktan sonra ayıp ile ilgili kurallar hariç cayma hakkı kullanılamaz.",
      "Müşteri, abonelik kapsamındaki hizmetin ifa edilmemiş olması şartıyla, ödemeyi müteakip 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Bununla birlikte talep edilen ürün teslim edilerek kullanıma başlanmışsa, abonelik toplam bedelinin %50'si ödenerek abonelik süresinin dolması beklenmeden sözleşme sona erdirilebilir.",
      "CASTAPOS, Müşteri tarafından seçilen ürünün stoklarında olmaması halinde bu ifa imkansızlığını Müşteri'ye bildirerek ücret iadesini yapacaktır.",
    ],
  },
  {
    title: "Madde 7 — Fikri mülkiyet hakları",
    body: [
      "Site ve Uygulama üzerindeki her türlü hak, mülkiyet ve menfaat CASTAPOS'a aittir. İşbu Sözleşme kapsamında Müşteriye site ve uygulamayı kullanmak üzere kişiye özel, dünya çapında, telifsiz, devredilemez ve münhasır olmayan lisans verilmektedir.",
      "MÜŞTERİ, hiçbir şekilde ve nedenle siteyi veya uygulamayı kopyalama, çoğaltma, ters mühendisliğe tabi tutma, değiştirme, geri derleme ve sair şekillerde site üzerindeki yazılımın kaynak koduna ulaşma hakkına sahip değildir.",
    ],
  },
  {
    title: "Madde 8 — Sorumluluğun kısıtlanması",
    body: [
      "Platform kapsamındaki uygulama, yazılım ve sair içerikler olduğu gibi sunulmakta olup, CASTAPOS'un hizmet, uygulama, yazılım ve içeriğin doğruluğu, tamlığı ve güvenilirliği ile ilgili herhangi bir sorumluluk ya da taahhüdü bulunmamaktadır. CASTAPOS, Platformun 7/24 erişilebilir ve kullanılabilir olmasını hedeflemekle birlikte bu konuda bir garanti vermemektedir.",
      "CASTAPOS siber güvenlik konusunda makul tedbirleri almaktadır. Ancak kendisine ait bilgisayar ağına ve bu ağdaki mevcut veri tabanı bilgilerine yapılabilecek saldırılar sonucu Müşteri bilgilerinin kötü amaçlı kişilerin eline geçmesi ve bunların kötü niyetli kullanılması halinde doğabilecek sonuçlardan dolayı sorumluluk kabul etmez.",
      "CASTAPOS, hizmet veren İş Ortaklarını ve tedarikçilerini iyi şekilde seçmeye özen göstermektedir; ancak İş Ortaklarının verdikleri hizmetler konusunda herhangi bir garanti vermemekte ve sorumluluk kabul etmemektedir. Müşteri talep ve şikayetleri için Müşteri Yöneticileri atanmaktadır.",
    ],
  },
  {
    title: "Madde 9 — Sözleşmenin yürürlüğü ve feshi",
    body: [
      "İşbu Sözleşme MÜŞTERİ tarafından elektronik ortamda kabulü ile birlikte yürürlüğe girecek ve taraflardan herhangi biri tarafından aşağıda belirtilen şekilde feshedilmediği sürece yürürlükte kalacaktır.",
      "Taraflardan herhangi biri, diğer tarafça bildirilen elektronik posta adresine 1 (bir) hafta önceden yapacağı yazılı bir bildirimle işbu sözleşmeyi dilediği zaman herhangi bir gerekçe göstermeksizin ve tazminat ödemeksizin feshedebilecektir.",
      "Taraflardan birinin işbu sözleşmeden kaynaklanan yükümlülüklerini tam ve gereği gibi yerine getirmemesi ve diğer tarafça yapılacak bildirime karşın söz konusu aykırılığın verilen süre içerisinde giderilmemesi halinde bu sözleşme bildirimi yapan tarafça feshedilebilecektir. Müşterinin yürürlükteki mevzuatı ihlal etmesi halinde CASTAPOS, Sözleşme'yi derhal geçerli olacak şekilde haklı nedenle feshedebilecektir.",
    ],
  },
  {
    title: "Madde 10 — Temerrüt faizi oranı ve ödemesi",
    body: [
      "Tüketiciler, platform aracılığıyla akdedilen sözleşme tahtında Müşteriler'den herhangi birine (i) vadesi gelmiş bir ödemeyi vadesinde veya (ii) vadesinden önce muacceliyet kesbetmiş bir ödemeyi, muacceliyet kesbettiği tarihte yapmazsa (“Ödenmemiş Tutar”), Müşteriler ilgili vade tarihinden fiili ödeme gününe kadar Ödenmemiş Tutar üzerinden Temerrüt Faizi almaya hak kazanır.",
      "Temerrüt Faizi oranı, Temerrüt Hali'nin ortaya çıktığı tarihte kanuni temerrüt faizi oranına uygulanabilecek en yüksek oran esas alınarak %18 (yüzde on sekiz) olarak belirlenmiştir.",
    ],
  },
  {
    title: "Madde 11 — Genel hükümler",
    body: [
      "Müşteri, 18 yaşını doldurmuş olduğunu ve işbu Sözleşme'yi akdetmek için gereken yasal ehliyete sahip bulunduğunu beyan eder.",
      "Müşteri, hesabını ve işbu sözleşme ile uygulama kullanımından doğan hak ve yükümlülüklerini herhangi bir şekilde üçüncü bir kişiye devir veya temlik edemez.",
      "İşbu Sözleşme'nin herhangi bir hükmünün geçersizliği, yasaya aykırılığı ve uygulanamazlığı, Sözleşme'nin geri kalan hükümlerinin yürürlüğünü ve geçerliliğini etkilemeyecektir.",
      "Müşteri ile kayıt olurken bildirdikleri e-mail vasıtasıyla iletişim kurulacaktır. E-mail ile yapılan iletişim yazılı iletişimin yerini tutar. E-mail adresini güncel tutmak müşterinin sorumluluğundadır.",
      "İşbu Sözleşme ve eklerinden kaynaklı uyuşmazlıklarda İstanbul Anadolu Mahkemeleri ve İcra Daireleri geçerli olacaktır.",
    ],
  },
];

export default function UyelikSozlesmesiPage() {
  return (
    <>
      <InfoPageBodyClass className="page-uyelik-sozlesmesi" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Üyelik Sözleşmesi
            </nav>
            <h1>Üyelik Sözleşmesi</h1>
            <p>Üyelik sistemi, hizmet alımı, bedel, cayma hakkı ve sözleşmenin feshine ilişkin hükümler.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>CASTAPOS Üyelik Sözleşmesi</h2>
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
