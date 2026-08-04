"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, Headphones, Mail, MessageCircle, X } from "lucide-react";

const whatsappUrl =
  "https://wa.me/905448010433?text=Merhaba%20Castapos%2C%20kiralama%20s%C3%BCreci%20hakk%C4%B1nda%20destek%20almak%20istiyorum.";

export function LiveSupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`live-support-widget ${open ? "open" : ""}`}>
      {open && (
        <section className="live-support-panel" aria-label="Canlı destek seçenekleri">
          <div className="live-support-head">
            <span className="live-support-logo">C</span>
            <div>
              <b>Merhaba!</b>
              <p>Sana nasıl yardımcı olabiliriz?</p>
            </div>
            <button type="button" aria-label="Canlı desteği kapat" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="live-support-options">
            <Link href="/canli-destek" onClick={() => setOpen(false)}>
              <span>
                <Headphones size={20} />
              </span>
              <div>
                <b>Canlı Destek</b>
                <small>WhatsApp, telefon ve hızlı destek kanalları</small>
              </div>
            </Link>
            <Link href="/ai-sohbet" onClick={() => setOpen(false)}>
              <span>
                <Bot size={20} />
              </span>
              <div>
                <b>AI ile sohbet</b>
                <small>Ürün seçimi ve kiralama soruları için akıllı asistan</small>
              </div>
            </Link>
            <Link href="/bilgi/iletisim" onClick={() => setOpen(false)}>
              <span>
                <Mail size={20} />
              </span>
              <div>
                <b>İletişim</b>
                <small>Tüm iletişim bilgilerini ve formu görüntüle</small>
              </div>
            </Link>
          </div>
        </section>
      )}

      <button
        type="button"
        className="live-support-fab"
        aria-expanded={open}
        aria-label={open ? "Canlı destek seçeneklerini kapat" : "Canlı destek seçeneklerini aç"}
        onClick={() => setOpen((prev) => !prev)}
      >
        <MessageCircle size={21} />
        <span>Canlı Destek</span>
      </button>

      <a className="live-support-whatsapp" href={whatsappUrl} target="_blank" rel="noopener" aria-label="WhatsApp destek">
        WhatsApp
      </a>
    </div>
  );
}
