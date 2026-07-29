"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Check, ShieldAlert, ArrowLeft } from "lucide-react";
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
  const callbackUrl = searchParams.get("callbackUrl") || "/hesap/panel";

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

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <section className="modern-auth-page">
      <div className="auth-layout">
        <div className="auth-visual-panel">
          <span className="auth-eyebrow">Castapos Üyelik</span>
          <h1>Hesabına giriş yap, kiralamalarını kolayca yönet.</h1>
          <p>Sipariş takibi, favorilerin ve Premium üyelik ayrıcalıkların tek yerde.</p>
          <div className="auth-benefits">
            <span><Check size={15} /> Siparişlerini ve taksitlerini takip et</span>
            <span><Check size={15} /> Favori ürünlerine hızlıca eriş</span>
            <span><Check size={15} /> Premium üyelikle ayrıcalıklı avantajlar</span>
          </div>
        </div>

        <div className="modern-auth-card">
          {!mfaRequired ? (
            // STEP 1: Credentials Form
            <>
              <div className="auth-card-head">
                <h2>Giriş Yap</h2>
                <p>Devam etmek için hesap bilgilerinle giriş yap.</p>
              </div>

              <form className="auth-form" onSubmit={handleRequestOtp}>
                {error && <div className="auth-message error">{error}</div>}

                <label>
                  E-posta
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  Şifre
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </label>

                <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
                </button>

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
                <h2>2FA Doğrulama</h2>
                <p>Güvenliğiniz için hesabınıza doğrulama kodu gönderilmiştir.</p>
              </div>

              <form className="auth-form" onSubmit={handleVerifyOtp}>
                {error && <div className="auth-message error">{error}</div>}

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-xs leading-normal text-slate-500 mb-2">
                  <ShieldAlert size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    {maskedPhone ? (
                      <p>
                        Kayıtlı <b>{maskedPhone}</b> telefon numaranıza SMS ile gönderilen 6 haneli doğrulama kodunu girin.
                      </p>
                    ) : (
                      <p>
                        Telefon numaranız kayıtlı olmadığı için doğrulama kodu e-postanıza/konsola yönlendirilmiştir.
                      </p>
                    )}
                  </div>
                </div>

                {debugCode && (
                  <div className="p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-xs mb-3 text-center">
                    <b>Geliştirici Modu:</b> Doğrulama kodunuz ➔ <b className="font-mono text-sm">{debugCode}</b>
                  </div>
                )}

                <label>
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
