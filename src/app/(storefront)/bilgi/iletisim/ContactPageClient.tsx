"use client";

import { useEffect, useState } from "react";

export function ContactPageClient() {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.body.classList.add("page-iletisim");
    return () => document.body.classList.remove("page-iletisim");
  }, []);

  return (
    <form
      className="contact-premium-form contact-form-card"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div>
        <h2>Ekibimize ulaş</h2>
        <p>Ürün, teslimat veya kiralama süreciyle ilgili konuyu bize yaz.</p>
      </div>
      <label>
        Ad Soyad
        <input name="name" placeholder="Adını ve soyadını yaz" required />
      </label>
      <label>
        E-posta
        <input name="email" type="email" placeholder="ornek@eposta.com" required />
      </label>
      <label>
        Konu
        <input name="subject" placeholder="Örn. Teslimat planı hakkında" required />
      </label>
      <label>
        Mesaj
        <textarea name="message" placeholder="Kısaca nasıl yardımcı olabileceğimizi yazabilirsin." required />
      </label>
      {sent && (
        <div className="contact-success-note">
          Mesajın hazırlandı. Gerçek gönderim altyapısı bağlandığında bu form doğrudan destek ekibine iletilecek.
        </div>
      )}
      <button className="btn btn-primary" type="submit">
        Mesajı hazırla
      </button>
    </form>
  );
}
