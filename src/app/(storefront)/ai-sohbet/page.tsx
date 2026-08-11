import type { Metadata } from "next";
import Link from "next/link";
import { AiChatClient } from "./AiChatClient";

export const metadata: Metadata = {
  title: "AI ile Sohbet | Castapos",
  description: "Castapos AI sohbet asistanı ile ürün seçimi, kiralama süresi ve teslimat hakkında hızlı bilgi al.",
};

export default function AiSohbetPage() {
  return (
    <section className="ai-chat-page">
      <div className="container standalone-breadcrumb-row">
        <nav className="breadcrumb">
          <Link href="/">Ana Sayfa</Link> › AI ile Sohbet
        </nav>
      </div>

      <div className="container ai-chat-page-layout">
        <AiChatClient />
      </div>
    </section>
  );
}
