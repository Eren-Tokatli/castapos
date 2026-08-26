import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Kullanım Şartları | Castapos",
  description: "Castapos kullanım şartları — üyelik sistemi, hizmet alımı, cayma hakkı, fikri mülkiyet ve temerrüt faizi hükümleri.",
};

// Bu metin castapos.com'daki resmi Kullanım Şartları'ndan alınmıştır.
const sections: { title: string; body: string[] }[] = [
  {
    title: "Madde 1 — Tanımlar",
    body: [
      "Hizmet: Abonelik iş modeli ile kiralama ve sonrasında talebe göre satışa dönüşebilecek eşyaların tedarikine yönelik hizmettir.",
      "Tüketici: CASTAPOS dijital kiralama hizmetlerinden faydalanmak amacıyla castapos.com adresi üzerinden üyelik sözleşmesini onaylayan gerçek kişi müşteridir.",
      "Platform: İşbu sözleşmeye konu hizmetlerin yönetildiği CASTAPOS'a ait websitesi ve uygulamalardan oluşan sistemdir.",
      "Müşteri Paneli: CASTAPOS ile Müşteri arasındaki bilgi alışverişini sağlamak üzere kullanılacak olan platforma ait arayüzdür.",
      "Müşteri Yöneticisi: Müşterilerin aldıkları hizmetler kapsamında Müşterileri arayarak bilgi veren, gelen soruları yanıtlayan, kiralama risk sistemi çerçevesinde tarafların birbirini daha iyi tanımasını sağlayan CASTAPOS çalışanlarıdır.",
    ],
  },
  {
    title: "Madde 2 — Üyelik sistemi",
    body: [
      "Üyelik ücretsizdir. MÜŞTERİ, CASTAPOS tarafından talep edilen bilgileri tam, doğru ve güncel bir şekilde sağlamasının gerektiğini bildiğini beyan eder. Bu bilgilerde herhangi bir değişiklik olması halinde, söz konusu bilgiler derhal güncellenecektir.",
      "MÜŞTERİ, Platform Müşteri Yöneticilerinin kendisinden istediği bilgileri Müşteri Yönetim Panelinden ve kendisinden istenildiği şekilde paylaşması gerektiğini bildiğini beyan eder. Bu bilgilerin eksik olması, gerçeğe aykırı olarak verilmesi, güncel olmaması veya bilgilerin paylaşılmaması nedeniyle Platform hizmetlerinden faydalanılamamasından CASTAPOS sorumlu tutulamaz.",
      "MÜŞTERİ tarafından Platform'a erişim e-posta adresi ve parolası kullanılarak gerçekleştirilecektir. Kullanıcı parolalarının gizliliğinin ve güvenliğinin korunmasından Müşteri sorumlu olacak olup site üzerinden söz konusu bilgilerin kullanımı ile gerçekleştirilen her türlü faaliyetin müşteri tarafından gerçekleştirildiği kabul edilecek, bu faaliyetlerden doğan her türlü yasal ve cezai sorumluluk müşteriye ait olacaktır. Müşteri, parolasının yetkisiz kullanımı veya güvenliğin başka şekilde ihlalinden haberdar olduğunda bu durumu derhal CASTAPOS'a bildirecektir.",
    ],
  },
  {
    title: "Madde 3 — Hizmet alımı",
    body: [
      "MÜŞTERİ, üyelik sonrasında satın alma yapabilir. Listelenen ürün ve hizmetlerden dilediğini sepete ekleyip satın alabilir. Her yeni ürün veya hizmet için de işbu Sözleşmenin hükümleri uygulanmaya devam edecektir.",
      "CASTAPOS ürünler için bir üretici gibi garanti vermemektedir. Ürünler ile ilgili bütün sorumluluk ürünün üreticisine aittir.",
      "MÜŞTERİ, hizmetin risklerini en aza indirmek için kendisinden istenen bütün bilgileri doğru ve tam olarak paylaşmayı kabul ve taahhüt eder. Hatalı bilgi paylaşımı sonucu ürünün teslim edilememesi, sigortasının geçersiz kalması, hizmeti vermenin riskli olduğuna kanaat getirilmesi gibi sonuçlardan CASTAPOS sorumlu değildir. CASTAPOS almış olduğu bu bilgileri sadece Platformdan beklenen hizmetler ile sınırlı olarak kullanacağını taahhüt eder.",
    ],
  },
  {
    title: "Madde 4 — Hizmete uygulanacak kurallar ve cayma hakkı",
    body: [
      "Hizmetlerin ürüne ait sayfada ilan edildiği şekilde verilecektir.",
      "Tüzel kişi MÜŞTERİ ve tacir MÜŞTERİ, tüketiciler ile ilgili mevzuata tabii değildir. Platformda herhangi bir ürün/hizmet için ödeme yapıldıktan sonra ayıp ile ilgili kurallar hariç cayma hakkı kullanılamaz.",
      "CASTAPOS, Müşteri tarafından seçilen ürünün stoklarında olmaması halinde bu ifa imkansızlığını Müşteri'ye bildirerek ücret iadesini yapacaktır.",
      "Ürünlere ait ölçüler Portalda ilan edilmiştir. Müşteri buna uygun olarak ürünü teslim alacağını beyan eder. Montaj esnasında, ürünlerin müşterinin merdiven ya da asansöre sığmaması durumlarında, ürünlerin taşınması için çağırılacak olan vinç bedeli müşteriye aittir.",
      "Söz konusu ürünlerin teslimi veya montajı sırasında, müşteri veya temsilcinin teslim mahallinde bulunması gereklidir. Teslim mahallinde bulunulmaması durumunda teslimat ve montajdan doğabilecek kayıp, hasar vb. arızalardan Castapos sorumlu değildir. Mobilya kategorisindeki ürünlerde montaj ve teslimat için müşteriye gün ve saat randevusu verilir; Müşteri randevu zamanına uymak yükümlülüğündedir.",
    ],
  },
  {
    title: "Madde 5 — Fikri mülkiyet hakları",
    body: [
      "Site ve Uygulama üzerindeki her türlü hak, mülkiyet ve menfaat CASTAPOS'a aittir. İşbu Sözleşme kapsamında Müşteriye site ve uygulamayı kullanmak üzere kişiye özel, dünya çapında, telifsiz, devredilemez ve münhasır olmayan lisans verilmektedir.",
      "MÜŞTERİ, hiçbir şekilde ve nedenle siteyi veya uygulamayı kopyalama, çoğaltma, ters mühendisliğe tabi tutma, değiştirme, geri derleme ve sair şekillerde site üzerindeki yazılımın kaynak koduna ulaşma, siteden işleme eser oluşturma hakkına sahip değildir. Platforma ilişkin tarayıcı ve içeriklerin herhangi bir şekilde değiştirilmesi, şirketin açık izni olmaksızın siteye veya siteden link verilmesi kesinlikle yasaktır.",
    ],
  },
  {
    title: "Madde 6 — Temerrüt faizi oranı ve ödemesi",
    body: [
      "Tüketiciler, platform aracılığıyla akdedilen sözleşme tahtında Müşteriler'den herhangi birine (i) vadesi gelmiş bir ödemeyi vadesinde veya (ii) vadesinden önce muacceliyet kesbetmiş bir ödemeyi, muacceliyet kesbettiği tarihte yapmazsa (“Ödenmemiş Tutar”), başkaca hiçbir ihtara veya bildirime gerek kalmaksızın Müşteriler, ilgili vade tarihinden veya ilgili muacceliyet tarihinden itibaren fiili ödeme gününe kadar Ödenmemiş Tutar üzerinden Temerrüt Faizi almaya hak kazanır.",
      "Temerrüt Faizi oranı, Temerrüt Hali'nin ortaya çıktığı tarihte kanuni temerrüt faizi oranına uygulanabilecek en yüksek oran esas alınarak %18 (yüzde on sekiz) olarak belirlenmiştir.",
    ],
  },
];

export default function KullanimSartlariPage() {
  return (
    <>
      <InfoPageBodyClass className="page-kullanim-sartlari" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Kullanım Şartları
            </nav>
            <h1>Kullanım Şartları</h1>
            <p>Üyelik sistemi, hizmet alımı, cayma hakkı ve platform kullanımına ilişkin temel kurallar.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>CASTAPOS Kullanım Şartları</h2>
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
