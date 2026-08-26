import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock, Building2 } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu | Castapos",
  description: "Castapos ön bilgilendirme formu — sipariş, teslimat, cayma hakkı ve temerrüt hükümlerine ilişkin bilgilendirme.",
};

// Bu metin castapos.com'daki resmi Ön Bilgilendirme Formu'ndan alınmıştır.
// Formun her siparişe özel doldurulan alanları (T.C., ürün/fiyat tablosu vb.)
// bu genel bilgilendirme sayfasında yer almaz — bunlar sipariş sonrası
// müşteriye e-posta ile ayrıca gönderilir.
const sections: { title: string; body: string[] }[] = [
  {
    title: "Sipariş bilgilendirmesi",
    body: [
      "İşbu Ön Bilgilendirme Formu kapsamında Müşteri'ye siparişinin detayları hakkında bilgilendirme yapılmakta olup, Müşteri'nin mal veya hizmetin elektronik olarak satın alınmasına ilişkin olarak Mesafeli Sözleşmeler Yönetmeliği gereğince mesafeli satış sözleşmesini onaylaması gerekmektedir.",
      "Müşteri, Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ne ilişkin bilgileri CASTAPOS'ta yer alan üyelik sayfasından takip edebilecektir. Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi CASTAPOS tarafından mevzuatta öngörülen süre boyunca kayıt altına alınmakta olup, Müşteri bu süre boyunca dilediği zaman üyelik sayfasından metinlere ulaşabilecektir. Ayrıca Müşteri siparişi onayladıktan sonra her bir siparişe özel olarak düzenlenen Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi, Müşteri'ye e-posta yoluyla gönderilmektedir.",
    ],
  },
  {
    title: "Sözleşme konusu mal ve hizmetin temel nitelikleri ve fiyatı",
    body: [
      "İşlem güvenliği gereği CASTAPOS müşterinin FİNDEKS raporu sorgulamasını yapacaktır. FİNDEKS rapor sonucuna göre CASTAPOS hizmet verip vermemek konusunda serbesttir. Önceden bir ödeme alınmışsa ücret iadesi yapılacaktır. CASTAPOS her kiralamada ayrıca sorgulama yapabilecektir. CASTAPOS, ilgili raporu sadece hizmet için kullanacağını taahhüt eder.",
      "Sipariş ile birlikte aboneliğin birinci ayının ücreti tahsil edilir. Abonelik süresinin hesaplanmasında ürünün teslim alındığı gün abonelik süresinin başlangıcı olarak kabul edilir. Abonelik süresince her ay tahsilat yapılır.",
      "Abonelik süresinin bitiminin son gününe kadar, abonelik kapsamında kullanılan ürün iade edilmek üzere kargoya verilmelidir. Aksi durumda takip eden ay için de abonelik bedeli tahsil edilecektir.",
      "Müşteri, tarafların işlem güvenliği için ürünü iade etmeden hemen önce ürünün fotoğraflarını çekecektir. İkinci el durumuna gelmiş olan ürünün fotoğraf çekilmeden iade yapılması halinde taşıma sırasında oluşan hasarlardan kargo firması sorumlu tutulamayacaktır. Bu sebeple iade öncesi fotoğraf çekilmesi kritiktir.",
      "Müşteri, cihazları iade etmeden önce cihazı fabrika ayarlarına döndürerek ve şifreleri sıfırlayarak göndermeyi taahhüt eder. Aksi durumda cihazın yeniden kullanılması için gerekli olacak bütün bilgiler için ürünün Müşteriye iade gerekecektir. Bu tür cihazı yeniden kullanım için yapılacak bütün masraflar ve abonelik süresi dolmuşsa takip eden aya ait abonelik ücreti Müşteri'den tahsil edilecektir.",
      "Elektronik, spor, anne ve çocuk kategorilerindeki ürünlerin sigortalı olarak abone olunabilmektedir. Mobilya kategorisindeki ürünler ise opsiyonel olarak sigortalanabilir.",
      "CASTAPOS, Müşteri tarafından iletilen iletişim adresine abonelik bedeli kadar faturayı iletecektir. E-fatura kullanıcısı olmayan Müşterilerin e-arşiv faturaları elektronik ortamda oluşturulacak ve elektronik ortamda muhafaza edilecektir. Elektronik ortamda oluşturulan faturalar ile ilgili bildirim en geç 7 gün içerisinde Müşterilerin e-posta adreslerine yapılacak ve faturalar PDF formatında e-posta yolu ile gönderilecektir.",
    ],
  },
  {
    title: "Ürün teslimi ve teslim şekli",
    body: [
      "Sözleşme Müşteri tarafından elektronik ortamda onaylanmakla yürürlüğe girmiş olup, Müşteri'nin abonelik kapsamında kiralamış olduğu ürünün Müşteri'ye teslim edilmesiyle ifa edilmiş olur.",
      "Müşteri, hayatın olağan akışına uygun olarak aşağıdaki halleri bildiğini kabul eder: ahşap kaplamalar doğal malzemeden üretildiğinden modüllerde ton farkı olabilir; koltuk gruplarında kullanılan kumaşlarda doğal pamuk kullanıldığından tüylenme olabilir; doğal mermer ürünlerinde desen ve ton farkı olabilir. Mesafeli satış sözleşmesindeki ürün, fiyat, adet ve proje çizimleri ve tüm bilgiler müşteri tarafından kontrol ve kabul edilmiştir.",
    ],
  },
  {
    title: "Teslimat masrafları ve ifası",
    body: [
      "Malın teslimat masrafları aksine bir hüküm yoksa Müşteri'ye aittir. Online verilen hizmetlerde bir masraf ödemesi olmayacaktır. Ürün satın almadan itibaren en çok 30 gün içerisinde ifa edilir.",
      "Ürünlere ait ölçüler Portalda ilan edilmiştir. Müşteri buna uygun olarak ürünü teslim alacağını beyan eder. Montaj esnasında, ürünlerin müşterinin merdiven ya da asansöre sığmaması durumlarında, ürünlerin taşınması için çağırılacak olan vinç bedeli müşteriye aittir.",
      "Söz konusu ürünlerin teslimi veya montajı sırasında, müşteri veya temsilcinin teslim mahallinde bulunması gereklidir. Teslim mahallinde bulunulmaması durumunda teslimat ve montajdan doğabilecek kayıp, hasar vb. arızalardan Castapos sorumlu değildir. Mobilya kategorisindeki ürünlerde montaj ve teslimat için müşteriye gün ve saat randevusu verilir; Müşteri randevu zamanına uymak yükümlülüğündedir.",
      "Abonelik süresi dolmuş ürünlerde müşteri ürünü iade ve teslim edeceği zaman kargo ücreti Castapos'a aittir. Abonelik süresi dolmuş ürünler tüm aksesuarları ile eksiksiz bir biçimde Castapos'a teslim edilecektir. Aksesuarların ürün ile teslim edilmemesi halinde Müşteri, teslimat masrafları kendisine ait olmak üzere aksesuarları Castapos'a iade etmekle yükümlüdür.",
    ],
  },
  {
    title: "Cayma hakkı",
    body: [
      "Müşteri, abonelik kapsamındaki hizmetin ifa edilmemiş olması şartıyla, ödemeyi müteakip 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Ürünün ilk 14 gün içerisinde hiç kullanılmamış olması abonelik kapsamında hizmetin başlamadığı anlamına gelecektir.",
      "Bununla birlikte talep edilen ürün teslim edilerek kullanıma başlanmışsa, abonelik toplam bedelinin %30'u ödenerek abonelik süresinin dolması beklenmeden sözleşme sona erdirilebilir.",
    ],
  },
  {
    title: "Temerrüt faizi oranı ve ödemesi",
    body: [
      "Tüketiciler, platform aracılığıyla akdedilen sözleşme tahtında Müşteriler'den herhangi birine (i) vadesi gelmiş bir ödemeyi vadesinde veya (ii) vadesinden önce muacceliyet kesbetmiş bir ödemeyi, muacceliyet kesbettiği tarihte yapmazsa (“Ödenmemiş Tutar”), başkaca hiçbir ihtara veya bildirime gerek kalmaksızın Müşteriler, ilgili vade tarihinden veya ilgili muacceliyet tarihinden itibaren fiili ödeme gününe kadar Ödenmemiş Tutar üzerinden Temerrüt Faizi almaya hak kazanır.",
      "Temerrüt Faizi oranı, Temerrüt Hali'nin ortaya çıktığı tarihte kanuni temerrüt faizi oranına uygulanabilecek en yüksek oran esas alınarak %18 (yüzde on sekiz) olarak belirlenmiştir.",
    ],
  },
  {
    title: "Uyuşmazlıkların çözümü",
    body: [
      "İşbu Mesafeli Satış Sözleşmesi ile ilgili çıkacak ihtilaflarda; her yıl Gümrük ve Ticaret Bakanlığı tarafından ilan edilen değere kadar Müşteri'nin yerleşim yerindeki ürünü satın aldığı veya ikametgâhının bulunduğu yerdeki İl veya İlçe Tüketici Sorunları Hakem Heyetleri, söz konusu değerin üzerindeki ihtilaflarda ise Tüketici Mahkemeleri yetkilidir.",
    ],
  },
];

export default function OnBilgilendirmeFormuPage() {
  return (
    <>
      <InfoPageBodyClass className="page-on-bilgilendirme-formu" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Ön Bilgilendirme Formu
            </nav>
            <h1>Ön Bilgilendirme Formu</h1>
            <p>Siparişini onaylamadan önce ürün, fiyat, teslimat, ödeme ve iade süreci hakkında temel bilgiler.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>CASTAPOS Ön Bilgilendirme Formu</h2>
            </div>
            <section>
              <h2>
                <Building2 size={18} />
                Satıcı bilgileri
              </h2>
              <p>
                <strong>Unvanı:</strong> Castapos Yazılım Çözümleri ve Elektronik Ticaret A.Ş.
                <br />
                <strong>Adres:</strong> İçerenköy Mah. Umut Sk. Quick Tower Sitesi No:10-12 İç Kapı No:2 Ataşehir/İstanbul
                <br />
                <strong>Telefon:</strong> +90 850 213 61 44
                <br />
                <strong>E-posta:</strong> iletisim@castapos.com
              </p>
            </section>
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
