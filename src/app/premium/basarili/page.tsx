import Link from "next/link";

export default function PremiumSuccessPage() {
  return (
    <section className="premium-hero">
      <div className="container premium-hero-inner">
        <span className="auth-eyebrow">Castapos Premium</span>
        <h1>Premium üyeliğin aktif!</h1>
        <p>Artık ekstra indirim, ücretsiz öncelikli teslimat ve öncelikli destekten yararlanabilirsin.</p>
        <Link className="btn btn-primary" href="/hesap/panel" style={{ marginTop: "20px" }}>
          Hesabıma Git
        </Link>
      </div>
    </section>
  );
}
