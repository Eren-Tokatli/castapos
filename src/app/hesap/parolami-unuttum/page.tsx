"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.classList.add("page-giris");
    return () => document.body.classList.remove("page-giris");
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="modern-auth-page premium-login-page">
      <div className="auth-layout auth-login-layout auth-reset-layout">
        <div className="auth-visual-panel">
          <span className="auth-eyebrow">Hesap Güvenliği</span>
          <h1>Parolanı güvenli şekilde yenile.</h1>
          <p>Hesabına erişimi geri kazanman için doğrulama adımlarını sade ve güvenli tutuyoruz.</p>

          <div className="auth-trust-grid" aria-label="Parola yenileme avantajları">
            <div>
              <Mail size={18} />
              <strong>E-posta Kontrolü</strong>
              <span>Bağlantı yalnızca kayıtlı adrese iletilir</span>
            </div>
            <div>
              <KeyRound size={18} />
              <strong>Tek Kullanımlık Link</strong>
              <span>Süreli ve güvenli yenileme adımı</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <strong>Hesap Koruması</strong>
              <span>Mevcut oturum bilgilerin korunur</span>
            </div>
          </div>

          <div className="auth-benefits">
            <span><Check size={15} /> Kiralama geçmişin güvende kalır</span>
            <span><Check size={15} /> Favorilerin ve adreslerin korunur</span>
            <span><Check size={15} /> Yeni parola ile hızlıca devam edersin</span>
          </div>
        </div>

        <div className="modern-auth-card auth-login-card">
          <div className="auth-card-head">
            <Link className="auth-back-button mb-3" href="/hesap/giris">
              <ArrowLeft size={13} /> Girişe Dön
            </Link>
            <span className="auth-card-kicker"><Sparkles size={14} /> Parola yardımı</span>
            <h2>Parolanı mı unuttun?</h2>
            <p>Kayıtlı e-posta adresini yaz; parola yenileme adımı için yönlendirme hazırlayalım.</p>
          </div>

          {!submitted ? (
            <form className="auth-form" onSubmit={handleSubmit} suppressHydrationWarning>
              <label suppressHydrationWarning>
                E-posta
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@eposta.com"
                  autoComplete="username"
                  data-1p-ignore="true"
                  data-keeper-ignore="true"
                  data-lpignore="true"
                  suppressHydrationWarning
                />
              </label>

              <button className="btn btn-primary auth-submit" type="submit">
                Sıfırlama Bağlantısı Gönder
              </button>

              <div className="auth-security-strip">
                <ShieldCheck size={16} />
                <span>Güvenlik için bağlantı sadece kısa süre kullanılabilir olacak şekilde hazırlanır.</span>
              </div>
            </form>
          ) : (
            <div className="auth-reset-success">
              <span><Mail size={24} /></span>
              <h3>E-postanı kontrol et</h3>
              <p>
                Eğer <b>{email}</b> adresiyle kayıtlı bir hesap varsa parola yenileme adımları bu adrese gönderilecek.
              </p>
              <Link className="btn btn-primary auth-submit" href="/hesap/giris">
                Giriş Sayfasına Dön
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
