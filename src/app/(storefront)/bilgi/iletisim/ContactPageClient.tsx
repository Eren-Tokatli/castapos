"use client";

import { useEffect, useState } from "react";
import { submitContactForm } from "@/app/hesap/destek/actions";

export function ContactPageClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("page-iletisim");
    return () => document.body.classList.remove("page-iletisim");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const result = await submitContactForm({
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Mesaj gönderilemedi, tekrar dener misin?");
      return;
    }

    setSent(true);
    form.reset();
  };

  return (
    <form className="contact-premium-form contact-form-card" onSubmit={handleSubmit}>
      <div>
        <h2>Ekibimize ulaş</h2>
        <p>Ürün, teslimat veya kiralama süreciyle ilgili konuyu bize yaz.</p>
      </div>
      <label>
        Ad Soyad
        <input name="name" placeholder="Adını ve soyadını yaz" required disabled={loading} />
      </label>
      <label>
        E-posta
        <input name="email" type="email" placeholder="ornek@eposta.com" required disabled={loading} />
      </label>
      <label>
        Konu
        <input name="subject" placeholder="Örn. Teslimat planı hakkında" required disabled={loading} />
      </label>
      <label>
        Mesaj
        <textarea name="message" placeholder="Kısaca nasıl yardımcı olabileceğimizi yazabilirsin." required disabled={loading} />
      </label>
      {error && <div className="contact-error-note">{error}</div>}
      {sent && (
        <div className="contact-success-note">
          Mesajın iletildi. Destek ekibimiz &quot;Soru ve Taleplerim&quot; akışı üzerinden en kısa sürede sana dönecek.
        </div>
      )}
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Gönderiliyor..." : "Mesajı gönder"}
      </button>
    </form>
  );
}
