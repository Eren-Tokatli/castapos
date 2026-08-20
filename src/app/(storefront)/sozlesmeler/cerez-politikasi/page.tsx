import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarClock } from "lucide-react";
import { InfoPageBodyClass } from "../../bilgi/_components/InfoPageBodyClass";

export const metadata: Metadata = {
  title: "Çerez Politikası | Castapos",
  description: "Castapos çerez politikası, kullanılan çerez türleri ve çerez tercihlerini yönetme bilgileri.",
};

const sections = [
  {
    title: "Çerez nedir?",
    body: "Çerezler, ziyaret ettiğin web siteleri tarafından tarayıcına kaydedilen küçük metin dosyalarıdır. Siteyi güvenli çalıştırmak, sepet ve oturum gibi tercihleri hatırlamak ve deneyimi geliştirmek için kullanılabilir.",
  },
  {
    title: "Zorunlu çerezler",
    body: "Platformun temel işlevleri için gereklidir. Oturum yönetimi, güvenlik, sepet, tema tercihi ve ödeme akışının sağlıklı çalışması gibi süreçleri destekler. Bu çerezler kapatılamaz.",
  },
  {
    title: "Analitik çerezleri",
    body: "Google Analytics 4, Yandex Metrica ve Yandex Webvisor bu kategori altında değerlendirilir. Ziyaret edilen sayfalar, trafik kaynakları, cihaz ve tarayıcı bilgileri ile site içi genel etkileşimler yalnızca analitik çerez izni verilirse ölçülür. Webvisor özelliği, sayfa içi tıklama, kaydırma ve gezinme davranışlarının oturum kaydı olarak analiz edilmesini sağlayabilir.",
  },
  {
    title: "Pazarlama çerezleri",
    body: "Google Ads, Meta Pixel ve TikTok Pixel bu kategori altında değerlendirilir. Reklam kampanyalarının performansını ve dönüşümleri ölçmek, reklamları optimize etmek, hedefleme ve yeniden pazarlama çalışmaları yapmak için yalnızca pazarlama çerez izni verilirse aktif edilir.",
  },
  {
    title: "Google Tag Manager",
    body: "Google Tag Manager, ölçüm ve reklam etiketlerini merkezi olarak yönetmek için kullanılabilir. Castapos tarafındaki teknik kurgu, GTM'i yalnızca analitik veya pazarlama çerezlerinden en az biri için izin verilmesi halinde yükler ve Google Consent Mode üzerinden izin durumunu iletir.",
  },
  {
    title: "Tercihleri yönetme",
    body: "Çerez tercihlerini ilk ziyaretinde çıkan banner üzerinden veya footer alanındaki Çerez Tercihleri bağlantısıyla yeniden düzenleyebilirsin. Tarayıcı ayarlarından da çerezleri silebilir veya engelleyebilirsin.",
  },
];

const cookieServices = [
  {
    category: "Zorunlu",
    services: "Oturum, güvenlik, sepet, tema ve çerez tercihleri",
    condition: "Her zaman aktif",
  },
  {
    category: "Analitik",
    services: "Google Analytics 4, Yandex Metrica, Yandex Webvisor",
    condition: "Analitik çerez izni verilirse aktif",
  },
  {
    category: "Pazarlama/Reklam",
    services: "Google Ads, Meta Pixel, TikTok Pixel",
    condition: "Pazarlama çerez izni verilirse aktif",
  },
  {
    category: "Etiket yönetimi",
    services: "Google Tag Manager",
    condition: "Analitik veya pazarlama iznine göre aktif",
  },
];

export default function CerezPolitikasiPage() {
  return (
    <>
      <InfoPageBodyClass className="page-cerez-politikasi" />

      <section className="listing-head account-hero info-doc-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › Çerez Politikası
            </nav>
            <h1>Çerez Politikası</h1>
            <p>Castapos deneyimini güvenli, hızlı ve kişiselleştirilebilir hale getirmek için kullanılan çerezler.</p>
          </div>
        </div>
      </section>

      <section className="section content-page info-doc-section">
        <div className="container info-doc-layout">
          <article className="legal-copy-card detailed-legal-copy info-doc-card">
            <div className="legal-document-title">
              <h2>Çerez türleri ve tercih yönetimi</h2>
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
                <BadgeCheck size={18} />
                Kullanılan sistemler
              </h2>
              <div className="legal-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Sistemler</th>
                      <th>Çalışma koşulu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieServices.map((service) => (
                      <tr key={service.category}>
                        <td>{service.category}</td>
                        <td>{service.services}</td>
                        <td>{service.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
