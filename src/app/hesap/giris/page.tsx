"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { ArrowLeft, Check, Clock3, Heart, PackageCheck, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { requestMfaCode } from "./actions";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA states
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("page-giris");
    return () => document.body.classList.remove("page-giris");
  }, []);

  // Step 1: Request OTP code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await requestMfaCode(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "E-posta veya şifre hatalı.");
      return;
    }

    if ("maskedPhone" in res) {
      setMaskedPhone(res.maskedPhone);
    }
    if ("debugCode" in res && res.debugCode) {
      setDebugCode(res.debugCode);
    }
    setMfaRequired(true);
  };

  // Step 2: Perform sign in with email, password, and OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      code: mfaCode,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Doğrulama kodu hatalı veya süresi geçmiş.");
      return;
    }

    // callbackUrl açıkça verilmemişse (örn. /destek veya /admin'den
    // yönlendirilmemişse), rolüne göre kullanıcıyı doğrudan kendi paneline gönder.
    let target = callbackUrl;
    if (callbackUrl === "/") {
      const session = await getSession();
      const role = session?.user?.role;
      if (role === "ADMIN") {
        target = "/admin";
      } else if (role === "SUPPORT") {
        target = "/destek";
      }
    }

    router.push(target);
    router.refresh();
  };

  return (
    <section className="modern-auth-page premium-login-page">
      <div className="auth-layout auth-login-layout">
        <div className="auth-visual-panel">
          <span className="auth-eyebrow">Castapos Üyelik</span>
          <h1>Kiralamalarını tek panelden yönet.</h1>
          <p>Aktif siparişlerin, favorilerin, teslimat planların ve üyelik avantajların güvenli hesabında hazır.</p>

          <div className="auth-trust-grid" aria-label="Castapos hesap avantajları">
            <div>
              <PackageCheck size={18} />
              <strong>Planlı Teslimat</strong>
              <span>Randevu ve sipariş takibi</span>
            </div>
            <div>
              <Heart size={18} />
              <strong>Favori Listesi</strong>
              <span>Beğendiğin ürünlere hızlı dönüş</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <strong>Güvenli Hesap</strong>
              <span>MFA doğrulama desteği</span>
            </div>
          </div>

          <div className="auth-benefits">
            <span><Check size={15} /> Siparişlerini ve taksitlerini takip et</span>
            <span><Check size={15} /> Favori ürünlerine hızlıca eriş</span>
            <span><Check size={15} /> Premium üyelikle ayrıcalıklı avantajlar</span>
          </div>

          <div className="auth-mini-metrics" aria-label="Castapos güven bilgileri">
            <span><b>4,7</b> Ortalama deneyim</span>
            <span><b>24s</b> Hızlı planlama</span>
          </div>
        </div>

        <div className="modern-auth-card auth-login-card">
          {!mfaRequired ? (
            // STEP 1: Credentials Form
            <>
              <div className="auth-card-head">
                <span className="auth-card-kicker"><Sparkles size={14} /> Güvenli giriş</span>
                <h2>Tekrar hoş geldin.</h2>
                <p>Hesabına giriş yaparak kiralama sürecini kaldığın yerden sürdür.</p>
              </div>

              <form className="auth-form" onSubmit={handleRequestOtp} suppressHydrationWarning>
                {error && <div className="auth-message error">{error}</div>}

                <label suppressHydrationWarning>
                  E-posta
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    autoComplete="username"
                    data-1p-ignore="true"
                    data-keeper-ignore="true"
                    data-lpignore="true"
                    suppressHydrationWarning
                  />
                </label>

                <label suppressHydrationWarning>
                  Şifre
                  <div className="password-field" suppressHydrationWarning>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifreni gir"
                      autoComplete="current-password"
                      data-1p-ignore="true"
                      data-keeper-ignore="true"
                      data-lpignore="true"
                      suppressHydrationWarning
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </label>

                <div className="auth-helper-row">
                  <span>MFA ile korunur</span>
                  <a className="auth-forgot-link" href="/hesap/parolami-unuttum">
                    Parolamı unuttum
                  </a>
                </div>

                <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
                </button>

                <div className="auth-security-strip">
                  <ShieldCheck size={16} />
                  <span>Bilgilerin şifreli oturum ve MFA doğrulaması ile korunur.</span>
                </div>

                <div className="auth-divider">veya</div>

                <Link className="auth-create-link" href="/hesap/kayit">
                  Yeni hesap oluştur
                </Link>
              </form>
            </>
          ) : (
            // STEP 2: MFA Verification Form
            <>
              <div className="auth-card-head">
                <button
                  onClick={() => {
                    setMfaRequired(false);
                    setMfaCode("");
                    setError(null);
                  }}
                  className="auth-back-button mb-3"
                >
                  <ArrowLeft size={13} /> Geri Dön
                </button>
                <span className="auth-card-kicker"><Clock3 size={14} /> Tek kullanımlık kod</span>
                <h2>Girişini doğrula.</h2>
                <p>Hesabını korumak için gönderilen 6 haneli kodu gir.</p>
              </div>

              <form className="auth-form" onSubmit={handleVerifyOtp} suppressHydrationWarning>
                {error && <div className="auth-message error">{error}</div>}

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-xs leading-normal text-slate-500 mb-2">
                  <ShieldAlert size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p>
                      <b>{email}</b> adresine gönderilen 6 haneli MFA kodunu gir. Kod kısa süre içinde geçerliliğini kaybeder.
                      {maskedPhone ? ` Kayıtlı ${maskedPhone} telefonuna da bilgilendirme gönderilebilir.` : ""}
                    </p>
                  </div>
                </div>

                {debugCode && (
                  <div className="p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-xs mb-3 text-center">
                    <b>Geliştirici Modu:</b> Doğrulama kodunuz ➔ <b className="font-mono text-sm">{debugCode}</b>
                  </div>
                )}

                <label suppressHydrationWarning>
                  Doğrulama Kodu (OTP)
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="123456"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="font-mono text-center text-lg tracking-widest font-bold"
                    autoComplete="one-time-code"
                    data-1p-ignore="true"
                    data-keeper-ignore="true"
                    data-lpignore="true"
                    suppressHydrationWarning
                  />
                </label>

                <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? "Doğrulanıyor…" : "Kodu Doğrula ve Giriş Yap"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
