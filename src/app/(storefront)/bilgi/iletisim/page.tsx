import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Clock3, Headphones, Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { ContactPageClient } from "./ContactPageClient";

export const metadata: Metadata = {
  title: "İletişim | Castapos",
  description:
    "Castapos iletişim bilgileri, destek kanalları ve kiralama süreci hakkında iletişim formu.",
};

const contactCards = [
  {
    icon: Mail,
    title: "E-posta",
    text: "Ürün, sipariş ve iş birlikleri için bize yazabilirsin.",
    value: "bilgi@castapos.com",
    href: "mailto:bilgi@castapos.com",
  },
  {
    icon: Headphones,
    title: "Canlı Destek",
    text: "WhatsApp, telefon ve hızlı destek kanallarını aç.",
    value: "Canlı desteğe git",
    href: "/canli-destek",
  },
  {
    icon: Bot,
    title: "AI ile sohbet",
    text: "Ürün seçimi ve kiralama planı için hızlı öneri al.",
    value: "Asistanı aç",
    href: "/ai-sohbet",
  },
  {
    icon: MapPin,
    title: "Merkez",
    text: "Levent Mah. Büyükdere Caddesi Yapı Kredi Plaza, Beşiktaş/İstanbul",
    value: "Türkiye operasyon merkezi",
    href: "#adresler",
  },
];

export default function IletisimPage() {
  return (
    <>
      <section className="listing-head account-hero contact-hero">
        <div className="container listing-head-inner">
          <div>
            <nav className="breadcrumb">
              <Link href="/">Ana Sayfa</Link> › İletişim
            </nav>
            <h1>Castapos ekibiyle hızlıca iletişime geç.</h1>
            <p>
              Kiralama planı, teslimat, destek talepleri veya iş birlikleri için doğru kanalı seçerek bize ulaşabilirsin.
            </p>
          </div>
        </div>
      </section>

      <section className="section content-page contact-page-section">
        <div className="container">
          <div className="contact-channel-grid">
            {contactCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="contact-channel-card">
                  <Icon size={21} />
                  <span>{item.title}</span>
                  <p>{item.text}</p>
                  <b>{item.value}</b>
                </Link>
              );
            })}
          </div>

          <div className="contact-grid enhanced-contact contact-premium-layout">
            <article className="contact-info-panel">
              <h2>Kiralama sürecinin her adımında net destek.</h2>
              <p>
                Ürün seçimi, ödeme, teslimat veya iade sürecinde aklına takılanları ekibimize iletebilirsin. Hesap
                sahipleri destek taleplerini panel üzerinden daha kolay takip edebilir.
              </p>
              <div className="contact-info-list">
                <div>
                  <ShieldCheck size={18} />
                  <span>3D Secure ödeme akışı</span>
                </div>
                <div>
                  <Clock3 size={18} />
                  <span>Planlı teslimat ve süreç takibi</span>
                </div>
                <div>
                  <MessageCircle size={18} />
                  <span>Hesap panelinden destek talebi</span>
                </div>
              </div>
              <div id="adresler" className="contact-address-box">
                <b>Türkiye</b>
                <p>Levent Mah. Büyükdere Caddesi Yapı Kredi Plaza, C Blok Kat:17 No:40-41, Beşiktaş/İstanbul</p>
                <b>ABD</b>
                <p>4695 MacArthur Ct #1100, Newport Beach, CA 92660, Amerika Birleşik Devletleri</p>
              </div>
            </article>

            <ContactPageClient />
          </div>
        </div>
      </section>
    </>
  );
}
