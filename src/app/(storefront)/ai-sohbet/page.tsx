import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Headphones, Sparkles } from "lucide-react";
import { AiChatClient } from "./AiChatClient";

export const metadata: Metadata = {
  title: "AI ile Sohbet | Castapos",
  description: "Castapos AI sohbet asistanı ile ürün seçimi, kiralama süresi ve teslimat hakkında hızlı bilgi al.",
};

const prompts = ["Koşu bandı öner", "KDV dahil fiyat nasıl görünür?", "Teslimat ne zaman olur?", "Halı yıkama için hangi ürün?"];

export default function AiSohbetPage() {
  return (
    <section className="ai-chat-page">
      <div className="container standalone-breadcrumb-row">
        <nav className="breadcrumb">
          <Link href="/">Ana Sayfa</Link> › AI ile Sohbet
        </nav>
      </div>

      <div className="container ai-chat-page-layout">
        <div className="ai-chat-copy">
          <span className="section-kicker">Akıllı destek</span>
          <h1>Kiralama kararını birkaç soruyla netleştir.</h1>
          <p>
            Ürün seçimi, kiralama süresi, ödeme özeti veya teslimat hakkında hızlıca fikir al. Gerekirse canlı destek
            ekibine yönlenebilirsin.
          </p>
          <div className="ai-chat-prompt-list">
            {prompts.map((prompt) => (
              <span key={prompt}>
                <Sparkles size={14} />
                {prompt}
              </span>
            ))}
          </div>
          <div className="ai-chat-side-note">
            <BadgeCheck size={18} />
            <span>Bu ekran öneri amaçlıdır. Sipariş ve ödeme adımlarındaki nihai bilgiler esas alınır.</span>
          </div>
          <Link className="btn btn-soft" href="/canli-destek">
            <Headphones size={17} />
            Canlı desteğe geç
          </Link>
        </div>

        <AiChatClient />
      </div>
    </section>
  );
}
