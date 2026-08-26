import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Tacir Satış Sözleşmesi | Castapos",
  description: "Castapos tacir müşteri hizmet sözleşmesi — üyelik, bedel, iade, sorumluluğun kısıtlanması ve fesih hükümleri.",
};

// Bu metin castapos.com'daki resmi "Tacir Müşteri İçin Hizmet Sözleşmesi"nden
// alınmıştır. Tüzel kişi/tacir müşteriler tüketici mevzuatına tabi olmadığı
// için bireysel müşterilerden ayrı bir sözleşme ile düzenlenir.
const sections: { title: string; body: string[] }[] = [
  {
    title: "Madde 1 — Taraflar",
    body: [
      "İşbu Hizmet Sözleşmesi (“Sözleşme”), CASTAPOS YAZILIM ÇÖZÜMLERİ VE ELEKTRONİK TİCARET A.Ş. (“CASTAPOS”) ile www.castapos.com Platformu'na kaydolan tüzel kişi “MÜŞTERİ” arasında akdedilmektedir. Sözleşme, Müşteri tarafından elektronik ortamda kabulü ile birlikte yürürlüğe girecek olup taraflarca belirtilen usuller doğrultusunda sona erdirilmediği sürece yürürlükte kalmaya devam edecektir.",
    ],
  },
  {
    title: "Madde 2 — Tanımlar",
    body: [
      "Hizmet: Abonelik iş modeli ile kiralama ve sonrasında talebe göre satışa dönüşebilecek eşyaların tedarikine yönelik hizmettir.",
      "Müşteri: CASTAPOS abonelik hizmetlerinden faydalanmak amacıyla castapos.com adresi üzerinden üyelik sözleşmesini onaylayan tüzel kişi müşteridir.",
      "Platform: İşbu sözleşmeye konu hizmetlerin yönetildiği CASTAPOS'a ait websitesi ve uygulamalardan oluşan sistemdir.",
      "Yeni Gibi Ürün: Sadece bir defa paketi açılmış ve iade edilmiş ya da sıfırlanmış, teknik kusursuzluğu test edilmiş ürünlerdir. Sıfır ürün ile ikinci el ürün arasındaki bir seviyededir.",
    ],
  },
  {
    title: "Madde 3 — Üyelik sistemi",
    body: [
      "Üyelik ücretsizdir. MÜŞTERİ, talep edilen bilgileri tam, doğru ve güncel bir şekilde sağlamasının gerektiğini bildiğini beyan eder. Bu bilgilerde herhangi bir değişiklik olması halinde, söz konusu bilgiler derhal güncellenecektir.",
    ],
  },
  {
    title: "Madde 4 — Hizmet alımı",
    body: [
      "MÜŞTERİ, üyelik sonrasında satın alma yapabilir. Listelenen ürün ve hizmetlerden dilediğini sepete ekleyip satın alabilir.",
      "CASTAPOS ürünler için bir üretici gibi garanti vermemektedir. Ürünler ile ilgili bütün sorumluluk ürünün üreticisine aittir.",
      "MÜŞTERİ, hizmetin risklerini en aza indirmek için kendisinden istenen bütün bilgileri doğru ve tam olarak paylaşmayı kabul ve taahhüt eder.",
    ],
  },
  {
    title: "Madde 5 — Bedel",
    body: [
      "MÜŞTERİ, ürün listeleme sayfalarındaki süre, bedel ve varsa kampanya koşullarına göre hizmet alacaktır. Ödemeler kredi kartı ile veya ödeme adımında belirtilen banka hesaplarına havale/EFT ya da mail order (kurumsal) ile yapılabilecektir.",
      "İşlem güvenliği gereği CASTAPOS müşterinin FİNDEKS raporu sorgulamasını yapacaktır. FİNDEKS rapor sonucuna göre CASTAPOS ürünü teslim edip etmemekte serbesttir.",
      "CASTAPOS, abonelik kapsamında yeni veya yeni gibi ürünlerin kiralamasını yapmaktadır; her durumda teknik kusursuzluğu test edilmiş ürünlerdir.",
      "Sipariş ile birlikte kiralamanın birinci ayının ücreti tahsil edilir. Kiralama süresinin bitiminin son gününe kadar ürün iade edilmek üzere kargoya verilmelidir; aksi durumda takip eden ay için de kiralama bedeli tahsil edilecektir.",
      "Müşteri, kiralamış olduğu ürünü liste fiyatında belirlenen farkı ödeyerek satın almaya dönüştürebilir. 24 aylık kiralama yapması halinde ürünü iade edip yerine başka bir ürün kiralayabilir.",
      "Elektronik, spor, anne ve çocuk kategorilerindeki ürünler sigortalı olarak kiralanmaktadır. Mobilya kategorisindeki ürünler opsiyonel olarak sigortalanabilir.",
    ],
  },
  {
    title: "Madde 6 — İade",
    body: [
      "Kiralama süresinin bitiminin son gününe kadar ürün iade edilmek üzere kargoya verilmelidir. Aksi durumda takip eden ay için de kiralama bedeli tahsil edilecektir.",
      "Kiralama süresinin bitiminde ürün ve tüm aksesuarları iade edilecektir. Aksesuarların iade sürecinde CASTAPOS'a iade edilmemesi halinde Müşteri CASTAPOS'un zararlarını tazmin etmekle yükümlüdür.",
    ],
  },
  {
    title: "Madde 7 — Hizmete uygulanacak kurallar",
    body: [
      "Ürünlerin özellikleri ilan edildiği sayfadaki içerik ile olduğu gibi sunulacaktır. Tacir MÜŞTERİ, tüketiciler ile ilgili mevzuata tabii değildir. Platformda herhangi bir ürün/hizmet için ödeme yapıldıktan sonra ayıp ile ilgili kurallar hariç cayma hakkı kullanılamaz.",
      "CASTAPOS, Müşteri tarafından seçilen ürünün stoklarında olmaması halinde bu ifa imkansızlığını Müşteri'ye bildirerek ücret iadesini yapacaktır.",
      "Söz konusu ürünlerin teslimi veya montajı sırasında, müşteri veya temsilcinin teslim mahallinde bulunması gereklidir. Teslim mahallinde bulunulmaması durumunda teslimat ve montajdan doğabilecek kayıp, hasar vb. arızalardan Castapos sorumlu değildir.",
    ],
  },
  {
    title: "Madde 8 — Fikri mülkiyet hakları",
    body: [
      "Site ve Uygulama üzerindeki her türlü hak, mülkiyet ve menfaat CASTAPOS'a aittir. MÜŞTERİ'ye kişiye özel, dünya çapında, telifsiz, devredilemez ve münhasır olmayan lisans verilmektedir.",
      "MÜŞTERİ, hiçbir şekilde ve nedenle siteyi veya uygulamayı kopyalama, çoğaltma, ters mühendisliğe tabi tutma, değiştirme, geri derleme hakkına sahip değildir.",
    ],
  },
  {
    title: "Madde 9 — Sorumluluğun kısıtlanması",
    body: [
      "Platform kapsamındaki uygulama, yazılım ve sair içerikler olduğu gibi sunulmakta olup, CASTAPOS'un doğruluk, tamlık ve güvenilirlik ile ilgili herhangi bir sorumluluk ya da taahhüdü bulunmamaktadır.",
      "CASTAPOS siber güvenlik konusunda makul tedbirleri almaktadır; ancak saldırılar sonucu Müşteri bilgilerinin kötü amaçlı kişilerin eline geçmesi halinde doğabilecek sonuçlardan sorumluluk kabul etmez.",
      "CASTAPOS, İş Ortaklarının verdikleri hizmetler konusunda herhangi bir garanti vermemekte ve sorumluluk kabul etmemektedir. Müşteri talep ve şikayetleri için Müşteri Yöneticileri atanmaktadır.",
    ],
  },
  {
    title: "Madde 10 — Sözleşmenin yürürlüğü ve feshi",
    body: [
      "İşbu Sözleşme MÜŞTERİ tarafından elektronik ortamda kabulü ile birlikte yürürlüğe girecek ve taraflardan herhangi biri tarafından feshedilmediği sürece yürürlükte kalacaktır.",
      "Taraflardan herhangi biri, 1 (bir) hafta önceden yapacağı yazılı bir bildirimle işbu sözleşmeyi dilediği zaman herhangi bir gerekçe göstermeksizin feshedebilecektir. Müşterinin yürürlükteki mevzuatı ihlal etmesi halinde CASTAPOS, Sözleşme'yi derhal geçerli olacak şekilde haklı nedenle feshedebilecektir.",
    ],
  },
  {
    title: "Madde 11 — Temerrüt faizi oranı ve ödemesi",
    body: [
      "Müşteriler'den herhangi birine ödeme vadesinde yapılmazsa, ilgili vade tarihinden fiili ödeme gününe kadar Ödenmemiş Tutar üzerinden Temerrüt Faizi almaya hak kazanılır.",
      "Temerrüt Faizi oranı, Temerrüt Hali'nin ortaya çıktığı tarihte kanuni temerrüt faizi oranına uygulanabilecek en yüksek oran esas alınarak %18 (yüzde on sekiz) olarak belirlenmiştir.",
    ],
  },
  {
    title: "Madde 12 — Genel hükümler",
    body: [
      "Müşteri, hesabını ve işbu sözleşmeden doğan hak ve yükümlülüklerini herhangi bir şekilde üçüncü bir kişiye devir veya temlik edemez.",
      "İşbu Sözleşme'nin herhangi bir hükmünün geçersizliği, Sözleşme'nin geri kalan hükümlerinin yürürlüğünü etkilemeyecektir.",
      "Müşteri ile kayıt olurken bildirdikleri e-mail vasıtasıyla iletişim kurulacaktır. E-mail ile yapılan iletişim yazılı iletişimin yerini tutar.",
      "İşbu Sözleşme ve eklerinden kaynaklı uyuşmazlıklarda İstanbul Merkez (Çağlayan) Mahkemeleri ve İcra Daireleri geçerli olacaktır.",
    ],
  },
];

export default function TacirSatisSozlesmesiPage() {
  return (
    <>
      <InfoPageBodyClass className="page-tacir-satis-sozlesmesi" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Tacir Satış Sözleşmesi
            </nav>
            <h1>Tacir Satış Sözleşmesi</h1>
            <p>Tüzel kişi / tacir müşteriler için hizmet, bedel, iade ve sorumluluk hükümleri.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>CASTAPOS Tacir Müşteri İçin Hizmet Sözleşmesi</h2>
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
