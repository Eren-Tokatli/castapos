import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CreditCard, LifeBuoy, PackageCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { FaqPageClient } from "./FaqPageClient";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular | Castapos",
  description:
    "Castapos kiralama süreci, teslimat, ödeme, iade ve destek konularında sıkça sorulan sorular.",
};

const faqHighlights = [
  { icon: CalendarDays, title: "Kiralama süresi", text: "1, 3, 6 ve 9 ay seçeneklerini ürün detayında görebilirsin." },
  { icon: Truck, title: "Teslimat", text: "Uygun ürünlerde randevulu teslimat ve süreç takibi sağlanır." },
  { icon: ShieldCheck, title: "Güvenli ödeme", text: "Ödeme adımları 3D Secure destekli güvenli akışla ilerler." },
];

const faqGroups = [
  {
    title: "Kiralama süreci",
    items: [
      {
        q: "Castapos üzerinden nasıl kiralama yapabilirim?",
        a: "Ürünü seçip kiralama süresini belirledikten sonra sepetinde aylık ödeme tutarını görürsün. Teslimat ve ödeme bilgilerini tamamlayarak kiralama planını oluşturabilirsin.",
      },
      {
        q: "Kiralama süresini nasıl seçiyorum?",
        a: "Ürün detay sayfasında uygun olan 1, 3, 6 ve 9 ay seçenekleri gösterilir. Seçtiğin süreye göre aylık ve günlük karşılık otomatik hesaplanır.",
      },
      {
        q: "Ürünleri satın alabilir miyim?",
        a: "Hayır, Castapos üzerindeki tüm ürünler yalnızca kiralama modeliyle sunulur; satın alma seçeneği bulunmaz.",
      },
    ],
  },
  {
    title: "Teslimat ve kullanım",
    items: [
      {
        q: "Teslimat ne kadar sürer?",
        a: "Teslimat süresi ürün tipine ve adrese göre değişebilir. Sepet ve ödeme adımlarında teslimat bilgileri mümkün olduğunca net şekilde gösterilir.",
      },
      {
        q: "Spor aletleri hangi şehirlere teslim ediliyor?",
        a: "Spor aletleri gibi kurulum ve lojistik gerektiren ürünlerde teslimat kapsamı ürün ve operasyon durumuna göre değişebilir. Sepette adres bilgisi alınırken uygun şehirler gösterilir.",
      },
      {
        q: "Ürün kullanım sırasında destek alabilir miyim?",
        a: "Evet. Hesabındaki destek alanından talep oluşturabilir veya iletişim sayfasındaki kanallardan Castapos ekibine ulaşabilirsin.",
      },
    ],
  },
  {
    title: "Ödeme, iptal ve iade",
    items: [
      {
        q: "Fiyatlara KDV dahil mi?",
        a: "Sepet ödeme özetinde KDV dahil tutar ayrıca bilgilendirme satırı olarak gösterilir. Aylık ödenecek tutar kullanıcının göreceği nihai aylık ödeme tutarıdır.",
      },
      {
        q: "Ödemeyi nasıl yapabilirim?",
        a: "Ödeme adımı güvenli ödeme altyapısı üzerinden ilerler. Kullanılabilir ödeme seçenekleri ödeme ekranında gösterilir.",
      },
      {
        q: "İptal veya iade koşulları nerede yer alıyor?",
        a: "İptal ve iade koşullarını ilgili sözleşme ve bilgilendirme sayfalarından inceleyebilirsin. Ürün ve teslimat durumuna göre süreç farklılaşabilir.",
      },
    ],
  },
];

export default function SikcaSorulanSorularPage() {
  return (
    <>
      <FaqPageClient />

      <section className="listing-head account-hero faq-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Mağaza</Link> › Sıkça Sorulan Sorular
            </nav>
            <h1>Kiralama süreciyle ilgili en net cevaplar.</h1>
            <p>
              Ürün seçimi, teslimat, ödeme, iptal ve destek adımlarında merak edilenleri tek ekranda topladık.
            </p>
          </div>
          <Link className="btn btn-primary faq-hero-action" href="/bilgi/iletisim">
            Destek al <LifeBuoy size={17} />
          </Link>
        </div>
      </section>

      <section className="section content-page faq-page-section">
        <div className="container upgraded-faq-shell">
          <div className="faq-overview-grid faq-overview-visible">
            {faqHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <Icon size={20} />
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </article>
              );
            })}
          </div>

          <div className="faq-content-layout">
            <div className="upgraded-faq-list">
              {faqGroups.map((group) => (
                <section key={group.title} className="faq-group-card">
                  <h2>{group.title}</h2>
                  {group.items.map((item, index) => (
                    <details key={item.q} open={index === 0}>
                      <summary>{item.q}</summary>
                      <p>{item.a}</p>
                    </details>
                  ))}
                </section>
              ))}
            </div>
          </div>

          <div className="faq-mini-band">
            <article>
              <PackageCheck size={18} />
              <span>Ürün detayında uygun dönemleri gör.</span>
            </article>
            <article>
              <CreditCard size={18} />
              <span>Sepette aylık ödeme özetini kontrol et.</span>
            </article>
            <article>
              <RefreshCw size={18} />
              <span>İade ve destek süreçlerini hesabından takip et.</span>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
