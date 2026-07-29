"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Check, MailWarning, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { registerCustomer, sendEmailOtp } from "./actions";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email verification state
  const [otpSent, setOtpSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);

  // Live password requirements checks
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[@$!%*?&._-]/.test(password),
  };
  const isPasswordValid = Object.values(checks).every(Boolean);

  useEffect(() => {
    document.body.classList.add("page-uye-ol");
    return () => document.body.classList.remove("page-uye-ol");
  }, []);

  // Step 1: Send Email Verification OTP
  const handleRequestEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone number length if entered
    if (phone && phone.length !== 10) {
      setError("Telefon numarası 10 hane olmalıdır (Örn: 5051234567).");
      return;
    }

    if (!isPasswordValid) {
      setError("Şifreniz tüm güvenlik kriterlerini karşılamalıdır.");
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(email);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "E-posta doğrulama kodu gönderilemedi.");
      return;
    }

    if ("debugCode" in res && res.debugCode) {
      setDebugCode(res.debugCode);
    }
    setOtpSent(true);
  };

  // Step 2: Complete registration with OTP validation
  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await registerCustomer({
      firstName,
      lastName,
      email,
      password,
      phone,
      verificationCode,
    });

    if (!result.success) {
      setLoading(false);
      setError(result.error || "Kayıt sırasında bir hata oluştu.");
      return;
    }

    // Automatically sign in user
    const signInResult = await signIn("credentials", {
      email,
      password,
      code: verificationCode,
      redirect: false,
    });
    setLoading(false);

    if (signInResult?.error) {
      router.push("/hesap/giris");
      return;
    }

    router.push("/hesap/panel");
    router.refresh();
  };

  return (
    <section className="modern-auth-page">
      <div className="auth-layout">
        <div className="auth-visual-panel">
          <span className="auth-eyebrow">Castapos Üyelik</span>
          <h1>Birkaç adımda hesabını oluştur.</h1>
          <p>Kirala, favorilerini kaydet ve Premium üyelikle ayrıcalıklardan yararlan.</p>
          <div className="auth-benefits">
            <span><Check size={15} /> Hızlı ve güvenli kiralama süreci</span>
            <span><Check size={15} /> Siparişlerini tek yerden takip et</span>
            <span><Check size={15} /> Premium üyelikle öncelikli teslimat</span>
          </div>
        </div>

        <div className="modern-auth-card">
          {!otpSent ? (
            // STEP 1: Registration form
            <>
              <div className="auth-card-head">
                <h2>Kayıt Ol</h2>
                <p>Hesabını oluşturmak için bilgilerini gir.</p>
              </div>

              <form className="auth-form" onSubmit={handleRequestEmailOtp}>
                {error && <div className="auth-message error">{error}</div>}

                <div className="auth-form-grid">
                  <label>
                    Ad
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Adınız"
                      autoComplete="given-name"
                    />
                  </label>
                  <label>
                    Soyad
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Soyadınız"
                      autoComplete="family-name"
                    />
                  </label>
                </div>

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
                  Telefon <small style={{ fontWeight: 400, color: "#98a2b3" }}>(opsiyonel)</small>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+90</span>
                    <input
                      type="text"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="5xxxxxxxxx"
                      autoComplete="tel"
                      className="phone-input-field"
                    />
                  </div>
                </label>

                <label>
                  Şifre
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Güçlü bir şifre belirleyin"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </label>

                {/* Password Strength Checklist */}
                <div className="mt-1 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 space-y-1.5">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1">
                    Şifre Güvenlik Kriterleri:
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${checks.length ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                      ✓
                    </span>
                    <span className={checks.length ? "text-emerald-750 font-bold" : ""}>En az 8 karakter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${checks.upper ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                      ✓
                    </span>
                    <span className={checks.upper ? "text-emerald-750 font-bold" : ""}>En az bir büyük harf (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${checks.lower ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                      ✓
                    </span>
                    <span className={checks.lower ? "text-emerald-750 font-bold" : ""}>En az bir küçük harf (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${checks.digit ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                      ✓
                    </span>
                    <span className={checks.digit ? "text-emerald-750 font-bold" : ""}>En az bir rakam (0-9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${checks.special ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                      ✓
                    </span>
                    <span className={checks.special ? "text-emerald-750 font-bold" : ""}>En az bir özel karakter (@, $, !, %, *, ?, &, ., _, -)</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary auth-submit mt-2"
                  type="submit"
                  disabled={loading || !isPasswordValid}
                >
                  {loading ? "Kod gönderiliyor…" : "Devam Et ve Kod Gönder"}
                </button>

                <p className="auth-login-link">
                  Zaten hesabın var mı? <Link href="/hesap/giris">Giriş yap</Link>
                </p>
              </form>
            </>
          ) : (
            // STEP 2: Verify email OTP code
            <>
              <div className="auth-card-head">
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setVerificationCode("");
                    setError(null);
                  }}
                  className="auth-back-button mb-3"
                >
                  <ArrowLeft size={13} /> Geri Dön
                </button>
                <h2>E-posta Doğrulama</h2>
                <p>Kayıt işlemini tamamlamak için e-posta adresinizi doğrulayın.</p>
              </div>

              <form className="auth-form" onSubmit={handleCompleteRegister}>
                {error && <div className="auth-message error">{error}</div>}

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-xs leading-normal text-slate-500 mb-2">
                  <MailWarning size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p>
                      <b>{email}</b> e-posta adresinize gönderilen 6 haneli kayıt doğrulama kodunu girin.
                    </p>
                  </div>
                </div>

                {debugCode && (
                  <div className="p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-xs mb-3 text-center">
                    <b>Geliştirici Modu:</b> Kayıt doğrulama kodunuz ➔ <b className="font-mono text-sm">{debugCode}</b>
                  </div>
                )}

                <label>
                  E-posta Doğrulama Kodu
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="font-mono text-center text-lg tracking-widest font-bold"
                  />
                </label>

                <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                  {loading ? "Doğrulanıyor ve Kaydediliyor…" : "Kodu Doğrula ve Kayıt Ol"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
