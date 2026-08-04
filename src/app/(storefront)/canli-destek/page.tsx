import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Clock3, Headphones, Mail, MapPin, MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";
import { CanliDestekBodyClass } from "./CanliDestekBodyClass";

export const metadata: Metadata = {
  title: "Canlı Destek | Castapos",
  description: "Castapos canlı destek, WhatsApp, telefon, AI sohbet ve iletişim kanalları.",
};

const whatsappUrl =
  "https://wa.me/905448010433?text=Merhaba%20Castapos%2C%20kiralama%20s%C3%BCreci%20hakk%C4%B1nda%20destek%20almak%20istiyorum.";

const supportActions = [
  {
    icon: MessageCircle,
    title: "WhatsApp ile yaz",
    text: "Destek ekibimizle sohbet başlat.",
    value: "+90 544 801 04 33",
    href: whatsappUrl,
    external: true,
    featured: true,
  },
  {
    icon: PhoneCall,
    title: "Telefonla ara",
    text: "Sipariş, teslimat ve ürün desteği için ulaş.",
    value: "+90 544 801 04 33",
    href: "tel:+905448010433",
  },
  {
    icon: Bot,
    title: "AI ile sohbet",
    text: "Ürün seçimi ve kiralama süreci için hızlı öneri al.",
    value: "Akıllı asistanı aç",
    href: "/ai-sohbet",
  },
  {
    icon: Mail,
    title: "İletişim bilgileri",
    text: "Adres, e-posta ve form bilgilerini görüntüle.",
    value: "İletişim sayfasına git",
    href: "/bilgi/iletisim",
  },
];

export default function CanliDestekPage() {
  return (
    <>
      <CanliDestekBodyClass className="page-canli-destek" />

      <section className="live-support-page">
        <div className="container standalone-breadcrumb-row">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › Canlı Destek
          </nav>
        </div>

        <div className="live-support-page-shell">
          <div className="live-support-page-card">
            <div className="live-support-page-hero">
              <div className="live-support-hero-top">
                <span className="live-support-brand-mark">Castapos Destek</span>
                <strong>
                  <span aria-hidden="true" />
                  Çevrimiçi
                </strong>
              </div>
              <h1>Size en hızlı kanaldan yardımcı olalım.</h1>
              <p>Ürün seçimi, teslimat, ödeme ve kiralama planı için doğru destek kanalını seçebilirsin.</p>
              <div className="live-support-hero-pills">
                <span>
                  <Clock3 size={15} />
                  Hızlı dönüş
                </span>
                <span>
                  <ShieldCheck size={15} />
                  Resmi destek
                </span>
                <span>
                  <Headphones size={15} />
                  Tek ekranda yönlendirme
                </span>
              </div>
            </div>

            <div className="live-support-action-list">
              {supportActions.map((action) => {
                const Icon = action.icon;
                const content = (
                  <>
                    <span className="live-support-action-icon">
                      <Icon size={22} />
                    </span>
                    <span>
                      <b>{action.title}</b>
                      <small>{action.text}</small>
                    </span>
                    <strong>{action.value}</strong>
                  </>
                );

                return action.external ? (
                  <a
                    key={action.title}
                    className={`live-support-action ${action.featured ? "featured" : ""}`}
                    href={action.href}
                    target="_blank"
                    rel="noopener"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={action.title}
                    className={`live-support-action ${action.featured ? "featured" : ""}`}
                    href={action.href}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            <div className="live-support-page-note">
              <div>
                <Clock3 size={18} />
                <span>Yanıt süreleri yoğunluğa göre değişebilir; mesaj bırakırsan ekibimiz en kısa sürede dönüş yapar.</span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Sipariş ve ödeme bilgilerini yalnızca resmi Castapos kanallarında paylaş.</span>
              </div>
              <div>
                <MapPin size={18} />
                <span>Türkiye operasyon merkezi: Levent, Beşiktaş/İstanbul.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
