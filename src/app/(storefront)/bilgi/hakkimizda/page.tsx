import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, CreditCard, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { AboutPageClient } from "./AboutPageClient";

export const metadata: Metadata = {
  title: "Hakkımızda | Castapos",
  description:
    "Castapos, kullanıcıların ihtiyaç duydukları ürünleri satın almadan önce kiralayarak deneyimleyebildiği premium kiralama platformudur.",
};

const metrics = [
  { value: "Tek ekran", label: "ürün, süre ve aylık fiyat karşılaştırması" },
  { value: "1, 3, 6, 9 ay", label: "esnek kiralama süreleri" },
  { value: "3D Secure", label: "güvenli ödeme altyapısı" },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Satın almadan önce güven",
    text: "Kullanıcıların pahalı ürünlerde karar vermeden önce gerçek deneyim kazanmasını önemsiyoruz.",
  },
  {
    icon: CalendarDays,
    title: "Şeffaf kiralama planı",
    text: "Aylık ücret, seçilen süre, teslimat ve süreç bilgileri anlaşılır şekilde aynı akışta sunulur.",
  },
  {
    icon: Truck,
    title: "Planlı teslimat",
    text: "Ürünlerin teslimat ve takip sürecini düzenli, ölçülebilir ve kullanıcı dostu hale getiriyoruz.",
  },
];

const processSteps = [
  { icon: Sparkles, title: "Keşfet", text: "İhtiyacına uygun ürünü kategori, marka ve dönem bilgisiyle bul." },
  { icon: CreditCard, title: "Planla", text: "Aylık tutarı gör, güvenli ödeme ile kiralama planını oluştur." },
  { icon: BadgeCheck, title: "Deneyimle", text: "Ürünü evinde kullan, süreni uzat veya deneyim sonrası karar ver." },
];

export default function HakkimizdaPage() {
  return (
    <>
      <AboutPageClient />

      <section className="listing-head account-hero about-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Hakkımızda
            </nav>
            <span className="section-kicker">Castapos</span>
            <h1>Satın almadan önce deneyimlemenin en sade yolu.</h1>
            <p>
              Castapos; spor aletlerinden ev ürünlerine kadar ihtiyaç duyulan ürünleri, satın alma baskısı olmadan
              denemeyi ve aylık planlarla kullanmayı kolaylaştıran kiralama platformudur.
            </p>
          </div>
          <div className="about-hero-panel" aria-label="Castapos özeti">
            {metrics.map((item) => (
              <article key={item.value}>
                <b>{item.value}</b>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section content-page about-page-section">
        <div className="container">
          <div className="about-story-grid enhanced-about-grid">
            <article className="about-story-card hero-about-card">
              <span>Hikayemiz</span>
              <h2>Bir ürüne sahip olmadan önce, onun hayatına gerçekten uyup uymadığını bilmek gerekir.</h2>
              <p>
                Castapos bu fikirle kuruldu. Kullanıcıların büyük bütçeli ürünlerde acele karar vermeden, evinde ve
                kendi rutininde deneyim kazanabilmesini hedefliyoruz. Kiralama sürecini ürün seçimi, fiyat görünürlüğü,
                teslimat ve destek adımlarını tek bir akışta toplayan modern bir platform deneyimine dönüştürüyoruz.
              </p>
            </article>

            <aside className="about-values-card">
              <h2>Ne yapıyoruz?</h2>
              <div>
                <b>Denemeyi kolaylaştırıyoruz</b>
                <p>Ürünü satın almadan önce kullanabileceğin kısa ve orta dönem kiralama planları sunuyoruz.</p>
              </div>
              <div>
                <b>Maliyeti görünür kılıyoruz</b>
                <p>Aylık ödeme, günlük karşılık ve dönem seçeneklerini karar anında netleştiriyoruz.</p>
              </div>
              <div>
                <b>Süreci takip edilebilir yapıyoruz</b>
                <p>Sipariş, teslimat, destek ve hesap yönetimini aynı platform içinde topluyoruz.</p>
              </div>
            </aside>
          </div>

          <div className="about-feature-grid about-principle-grid">
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <span className="about-icon-pill">
                    <Icon size={20} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>

          <div className="about-process-band">
            <div>
              <span className="section-kicker">Nasıl çalışır?</span>
              <h2>Kiralama kararını daha net, daha hızlı ve daha güvenli hale getiriyoruz.</h2>
            </div>
            <div className="about-process-steps">
              {processSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title}>
                    <Icon size={18} />
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                  </article>
                );
              })}
            </div>
          </div>

          <section className="about-cta-strip">
            <div>
              <span className="section-kicker">Castapos deneyimi</span>
              <h2>İhtiyacın olan ürünü bugün aylık planla keşfet.</h2>
              <p>Popüler kiralama ürünlerini incele, fiyatı gör ve satın alma kararını deneyimden sonra ver.</p>
            </div>
            <Link href="/kategori" className="btn btn-primary">
              Ürünleri keşfet <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </section>
    </>
  );
}
