import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Castapos",
  description: "Castapos mesafeli satış sözleşmesi — taraflar, hizmetin konusu, teslimat, cayma hakkı ve temerrüt hükümleri.",
};

// Bu metin castapos.com'daki resmi Mesafeli Satış Sözleşmesi'nden alınmıştır
// (bkz. sepet/checkout'taki zorunlu onay kutusu). Sipariş formundaki
// müşteriye özel alanlar (T.C., ürün/fiyat tablosu vb.) — bunlar her siparişte
// otomatik doldurulup e-posta ile gönderilir, bu genel bilgilendirme
// sayfasında yer almaz.
const sections: { title: string; body: string[] }[] = [
  {
    title: "Madde 1 — Taraflar",
    body: [
      "İşbu Mesafeli Satış Sözleşmesi (“Sözleşme”), CASTAPOS YAZILIM ÇÖZÜMLERİ VE ELEKTRONİK TİCARET A.Ş. (“CASTAPOS”) ile www.castapos.com “Platformu”na kaydolan “TÜKETİCİ” arasında akdedilmektedir. İşbu sözleşme ve Platformda yer alan diğer kurallar CASTAPOS tarafından sunulan veya aracılık edilen hizmetlere ilişkin şart ve koşulları ile Platformun kullanılmasına ilişkin kuralları düzenlemektedir. Sözleşme, Tüketici tarafından elektronik ortamda kabulü ile birlikte yürürlüğe girecek olup; taraflarca Sözleşme'de belirtilen usuller doğrultusunda sona erdirilmediği sürece yürürlükte kalmaya devam edecektir.",
      "İşbu mesafeli satış sözleşmesi tüketici müşteriler için geçerlidir. İşbu Sözleşmenin Müşteri tarafı tüzel kişi ise hizmet tüketiciler ile ilgili mevzuata tabii olmayıp bütün süreçler tacirler arası hukuka tabidir.",
    ],
  },
  {
    title: "Madde 2 — Tanımlar",
    body: [
      "Hizmet: Abonelik iş modeli ile kiralama ve sonrasında talebe göre satışa dönüşebilecek eşyaların tedarikine yönelik hizmettir.",
      "Tüketici: CASTAPOS hizmetlerinden faydalanmak amacıyla castapos.com adresi üzerinden üyelik sözleşmesini onaylayan gerçek kişi müşteridir.",
      "Platform: İşbu sözleşmeye konu hizmetlerin yönetildiği CASTAPOS'a ait websitesi ve uygulamalardan oluşan sistemdir.",
      "Müşteri Paneli: CASTAPOS ile Tüketici arasındaki bilgi alışverişini sağlamak üzere kullanılacak olan platforma ait arayüzdür.",
      "Müşteri Yöneticisi: Müşterilerin aldıkları hizmetler kapsamında Müşterileri arayarak bilgi veren, gelen soruları yanıtlayan, risk sistemi çerçevesinde tarafların birbirini daha iyi tanımasını sağlayan CASTAPOS çalışanlarıdır.",
      "Üyelik Sözleşmesi: İşbu mesafeli satış sözleşmesinden önce Platforma üye olurken Müşterilerin kabul ettiği sözleşmedir. Sadelik açısından işbu mesafeli satış sözleşmesinde sadece satış ile ilgili hükümlere yer verilmiş olup burada yer almayan konularla ilgili üyelik sözleşmesi geçerlidir.",
      "Yeni Gibi Ürün: Sadece bir defa paketi açılmış ve iade edilmiş ya da üretici tarafından sıfırlanmış ürünlerdir fakat her durumda kullanım için mükemmel durumda olan ürünlerdir. Sıfır ürün ile ikinci el ürün arasındaki bir seviyededir.",
    ],
  },
  {
    title: "Madde 3 — Sözleşmenin konusu ve kapsamı",
    body: [
      "İşbu Mesafeli Satış Sözleşmesi (“Sözleşme”) 6502 Sayılı Tüketicinin Korunması Hakkında Kanun (“Kanun”) ve Mesafeli Sözleşmeler Yönetmeliği'ne uygun olarak düzenlenmiştir. İşbu Sözleşme'nin tarafları işbu Sözleşme tahtında Kanun'dan ve Mesafeli Sözleşmeler Yönetmeliği'nden kaynaklanan yükümlülük ve sorumluluklarını bildiklerini ve anladıklarını kabul ve beyan ederler. Bu sözleşmede yer alan gerçek kişi tüketicilere özel hükümler, tacir tüketiciler için uygulanmaz.",
      "İşbu Sözleşme'nin konusunu; Tüketici Müşteri'nin, Platform aracılığıyla seçtiği ürün için abonelik iş modeli ile kurgulanan kiralama hizmeti alınmasına yönelik elektronik olarak sipariş verdiği, Sözleşme'de ve ürünün sayfasında belirtilen niteliklere sahip hizmetin satışı ve ifası ile ilgili olarak Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesi oluşturur.",
      "İşlem güvenliği gereği CASTAPOS müşterinin FİNDEKS raporu sorgulamasını yapacaktır. FİNDEKS rapor sonucuna göre CASTAPOS hizmet verip vermemekte serbesttir. Hizmet verilmemesi halinde ücret iadesi yapılacaktır. CASTAPOS her yeni işlemde ayrıca sorgulama yapabilecektir. CASTAPOS, ilgili raporu sadece ilgili faaliyet için kullanacağını taahhüt eder.",
      "Sipariş ile birlikte aboneliğin birinci ayının ücreti tahsil edilir. Abonelik süresinin hesaplanmasında ürünün teslim alındığı gün abonelik süresinin başlangıcı olarak kabul edilir. Abonelik süresince her ay tahsilat yapılır.",
      "Abonelik süresinin bitiminin son gününe kadar ürün iade edilmek üzere kargoya verilmelidir. Aksi durumda takip eden ay için de abonelik bedeli tahsil edilecektir.",
      "Müşteri, tarafların işlem güvenliği için ürünü teslim aldığında ve iade etmeden hemen önce ürünün fotoğraflarını çekecektir. Teslim anında fotoğraf çekilmemesi halinde sigorta süreci başlamayacaktır. Ayrıca ürünün fotoğraf çekilmeden iade yapılması halinde taşıma sırasında oluşan hasarlardan kargo firması sorumlu tutulamayacaktır. Bu sebeplerle teslim sonrası ve iade öncesi fotoğraf çekilmesi kritiktir.",
      "Müşteri, abonelik kapsamında kiralamış olduğu ürünü liste fiyatında belirlenen farkı ödeyerek satın almaya dönüştürebilir.",
      "Müşteri, 24 aylık abonelik kapsamında kiralamış olduğu ürünü iade edip yerine başka bir ürün kiralayabilir. Önceki kiralanan ürün ile yeni kiralanan ürün arasında fark yeniden hesaplanacak ve önceki kiralamada yapılan ödemesi de mahsup edilecektir.",
      "Kiralama süresinin bitiminde ürün ve tüm aksesuarları iade edilecektir. Tüm ürün aksesuarlarının iade sürecinde CASTAPOS'a iade edilmemesi halinde Müşteri CASTAPOS'un zararlarını tazmin etmekle yükümlüdür.",
      "Ürün aksesuarı sevkiyat masrafı olan kargo ücretleri Müşteri tarafından ödenecektir. Ürün aksesuarlarının kaybedilmesi/kullanılabilir halde bulunmaması gibi nedenlerle iade edilememesi halinde Müşteri aksesuar ve sevkiyat masraflarını CASTAPOS'a ödemekle yükümlüdür.",
      "Müşteri, kiralanan cihazı iade etmeden önce cihazı fabrika ayarlarına döndürerek ve şifreleri sıfırlayarak göndermeyi taahhüt eder. Aksi durumda cihazın yeniden kullanılması için gerekli olacak bütün bilgiler için ürünün Müşteriye iade gerekecektir. Bu tür cihazı yeniden kullanım için yapılacak bütün masraflar ve kiralama süresi dolmuşsa takip eden aya ait kira ücreti Müşteri'den tahsil edilecektir.",
      "Elektronik, spor, anne ve çocuk kategorilerindeki ürünlerin sigortalı olarak abonelik yapılmaktadır. Mobilya kategorisindeki ürünler ise opsiyonel olarak sigortalanabilir.",
      "Müşteri, abonelik kapsamında kiralamış olduğu ürünleri satın almaya dönüştürmedikçe sözleşmeye konu ürünü Türkiye Cumhuriyeti sınırları dışına çıkartamaz.",
      "CASTAPOS, Müşteri tarafından seçilen ürünün stoklarında olmaması halinde bu ifa imkansızlığını Müşteri'ye bildirerek ücret iadesini yapacaktır.",
    ],
  },
  {
    title: "Madde 4 — Ürün teslimi ve teslim şekli",
    body: [
      "Sözleşme Müşteri tarafından elektronik ortamda onaylanmakla yürürlüğe girmiş olup, Müşteri'nin abonelik kapsamında kiralamış olduğu ürünün Müşteri'ye teslim edilmesiyle ifa edilmiş olur.",
      "Müşteri, hayatın olağan akışına uygun olarak aşağıdaki halleri bildiğini kabul eder: ahşap kaplamalar doğal malzemeden üretildiğinden modüllerde ton farkı olabilir; koltuk gruplarında kullanılan kumaşlarda doğal pamuk kullanıldığından tüylenme olabilir; doğal mermer ürünlerinde desen ve ton farkı olabilir.",
      "Mesafeli satış sözleşmesindeki ürün, fiyat, adet ve proje çizimleri ve tüm bilgiler müşteri tarafından kontrol ve kabul edilmiştir.",
    ],
  },
  {
    title: "Madde 5 — Teslimat masrafları ve ifası",
    body: [
      "Malın teslimat masrafları aksine bir hüküm yoksa Müşteri'ye aittir. Online verilen hizmetlerde bir masraf ödemesi olmayacaktır. Ürün satın almadan itibaren en çok 30 gün içerisinde ifa edilir.",
      "Ürünlere ait ölçüler Portalda ilan edilmiştir. Müşteri buna uygun olarak ürünü teslim alacağını beyan eder. Montaj esnasında, ürünlerin müşterinin merdiven ya da asansöre sığmaması durumlarında, ürünlerin taşınması için çağırılacak olan vinç bedeli müşteriye aittir.",
      "Söz konusu ürünlerin teslimi veya montajı sırasında, müşteri veya temsilcinin teslim mahallinde bulunması gereklidir. Teslim mahallinde bulunulmaması durumunda teslimat ve montajdan doğabilecek kayıp, hasar vb. arızalardan Castapos sorumlu değildir.",
      "Mobilya kategorisindeki ürünlerde montaj ve teslimat için müşteriye gün ve saat randevusu verilir. Müşteri, randevu zamanına uymak yükümlülüğündedir.",
      "Abonelik süresi dolmuş ürünlerde müşteri ürünü iade ve teslim edeceği zaman kargo ücreti Castapos'a aittir.",
    ],
  },
  {
    title: "Madde 6 — Cayma hakkı",
    body: [
      "Müşteri, abonelik kapsamındaki hizmetin ifa edilmemiş olması şartıyla, ödemeyi müteakip 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Ürünün ilk 14 gün içerisinde hiç kullanılmamış olması abonelik kapsamında hizmetin başlamadığı anlamına gelecektir.",
      "Bununla birlikte talep edilen ürün teslim edilerek kullanıma başlanmışsa, abonelik toplam bedelinin %30'u ödenerek abonelik süresinin dolması beklenmeden sözleşme sona erdirilebilir.",
    ],
  },
  {
    title: "Madde 7 — Uyuşmazlıkların çözümü",
    body: [
      "İşbu Mesafeli Satış Sözleşmesi ile ilgili çıkacak ihtilaflarda; her yıl Gümrük ve Ticaret Bakanlığı tarafından ilan edilen değere kadar Müşteri'nin yerleşim yerindeki ürünü satın aldığı veya ikametgâhının bulunduğu yerdeki İl veya İlçe Tüketici Sorunları Hakem Heyetleri, söz konusu değerin üzerindeki ihtilaflarda ise Tüketici Mahkemeleri yetkilidir.",
    ],
  },
  {
    title: "Madde 8 — Mal/hizmetin fiyatı",
    body: [
      "Malın peşin veya vadeli satış fiyatı, sipariş formunda yer almakla birlikte, sipariş sonu gönderilen bilgilendirme e-postası ve ürün ile birlikte müşteriye gönderilen fatura içeriğinde mevcut olan fiyattır.",
    ],
  },
  {
    title: "Madde 9 — Temerrüt hali ve hukuki sonuçları",
    body: [
      "Müşteri'nin, kredi kartı ile yapmış olduğu işlemlerde temerrüde düşmesi halinde kart sahibi bankanın kendisi ile yapmış olduğu kredi kartı sözleşmesi çerçevesinde faiz ödeyecek ve bankaya karşı sorumlu olacaktır. Bu durumda ilgili banka hukuki yollara başvurabilir; doğacak masrafları ve vekâlet ücretini Müşteri'den talep edebilir ve her koşulda Müşteri'nin borcundan dolayı temerrüde düşmesi halinde, Müşteri'nin borcu gecikmeli ifasından dolayı İş Ortağının uğradığı zarar ve ziyandan Müşteri sorumlu olacaktır.",
    ],
  },
  {
    title: "Madde 10 — Bildirimler ve delil sözleşmesi",
    body: [
      "İşbu Sözleşme tahtında taraflar arasında yapılacak her türlü yazışma, mevzuatta sayılan zorunlu haller dışında elektronik posta aracılığıyla yapılacaktır. Müşteri, faaliyetin dijital bir iş olması sebebiyle işbu Sözleşme'den doğabilecek ihtilaflarda tarafların resmi defter ve ticari kayıtlarıyla, kendi veri tabanında, sunucularında tuttuğu elektronik bilgilerin ve bilgisayar kayıtlarının, bağlayıcı, kesin ve münhasır delil teşkil edeceğini, bu maddenin Hukuk Muhakemeleri Kanunu'nun 193. maddesi anlamında delil sözleşmesi niteliğinde olduğunu kabul, beyan ve taahhüt eder.",
    ],
  },
  {
    title: "Madde 11 — Temerrüt faizi oranı ve ödemesi",
    body: [
      "Tüketiciler, platform aracılığıyla akdedilen sözleşme tahtında Müşteriler'den herhangi birine (i) vadesi gelmiş bir ödemeyi vadesinde veya (ii) vadesinden önce muacceliyet kesbetmiş bir ödemeyi, muacceliyet kesbettiği tarihte yapmazsa (“Ödenmemiş Tutar”), başkaca hiçbir ihtara veya bildirime gerek kalmaksızın Müşteriler, ilgili vade tarihinden veya ilgili muacceliyet tarihinden itibaren fiili ödeme gününe kadar Ödenmemiş Tutar üzerinden Temerrüt Faizi almaya hak kazanır.",
      "Temerrüt Faizi oranı, Temerrüt Hali'nin ortaya çıktığı tarihte kanuni temerrüt faizi oranına uygulanabilecek en yüksek oran esas alınarak %18 (yüzde on sekiz) olarak belirlenmiştir. Bakanlar Kurulunun 2005/9831 sayılı 16.12.2005 tarihli kararıyla ticari olmayan işlerde uygulanacak 01.01.2006 tarihinden sonrası için belirlemiş olduğu %9 (yüzde dokuz)'luk kanuni temerrüt faiz oranında artış yapılması halinde, işbu platform aracılığıyla taraflar arasında akdedilen sözleşme tahtında Müşteri'nin yukarıda belirlenmiş olan sözleşmesel temerrüt faizi oranını arttırma hakkı saklıdır.",
    ],
  },
  {
    title: "Madde 12 — Yürürlük",
    body: [
      "Bu Sözleşme, taraflarca okunarak, Müşteri tarafından elektronik ortamda onaylanmak veya olumlu bir fiili hareket olarak ödeme yapmak suretiyle akdedilmiş ve yürürlüğe girmiştir.",
    ],
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
              <Link href="/">Ana Sayfa</Link> › Mesafeli Satış Sözleşmesi
            </nav>
            <h1>Mesafeli Satış Sözleşmesi</h1>
            <p>6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği&apos;ne uygun olarak düzenlenmiştir.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>CASTAPOS Mesafeli Satış Sözleşmesi</h2>
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
