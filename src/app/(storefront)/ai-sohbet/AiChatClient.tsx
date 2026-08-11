"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bot, Headphones, Loader2, Send, Sparkles, UserRound } from "lucide-react";

type RecommendedProduct = {
  id: string;
  name: string;
  image: string;
  monthly: string;
  url: string;
};

type ClarifyQuestion = {
  question: string;
  options: string[];
};

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  displayText?: string;
  products?: RecommendedProduct[];
  clarify?: ClarifyQuestion | null;
};

// Sistem promptu markdown kullanmamasını söylese de AI bazen [Ürün](/urun/slug)
// linki, **kalın** vurgu veya çıplak /urun/slug yolu yazabiliyor — üçünü de
// tek geçişte yakalayıp gerçek link/kalın metne çeviriyoruz.
const MARKDOWN_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\((\/[^\s)]+)\)|(\/urun\/[a-z0-9-]+)/g;

function renderMessageText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  MARKDOWN_PATTERN.lastIndex = 0;
  while ((match = MARKDOWN_PATTERN.exec(text)) !== null) {
    const [whole, bold, linkText, linkHref, barePath] = match;
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (bold !== undefined) {
      parts.push(<strong key={key++}>{bold}</strong>);
    } else if (linkHref !== undefined) {
      parts.push(
        <Link key={key++} href={linkHref} className="ai-chat-link">
          {linkText}
        </Link>
      );
    } else if (barePath !== undefined) {
      parts.push(
        <Link key={key++} href={barePath} className="ai-chat-link">
          {barePath}
        </Link>
      );
    }
    lastIndex = match.index + whole.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const quickPrompts = ["Koşu bandı öner", "KDV dahil fiyat nasıl görünür?", "Teslimat ne zaman olur?", "Halı yıkama için hangi ürün?"];

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Merhaba, ben Castapos AI. Hangi ürün için kiralama planı arıyorsun? Kullanım amacı, şehir ve düşündüğün süreyi yazarsan daha net yönlendirebilirim.",
  },
];

export function AiChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.classList.add("page-ai-sohbet");
    return () => document.body.classList.remove("page-ai-sohbet");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, loading, error]);

  const sendMessage = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Yalniz role+text API'ye gider; products/clarify sadece UI icin, backend
        // sanitizeMessages zaten bunlari yok sayar ama gereksiz veri gondermeyelim.
        body: JSON.stringify({ messages: nextMessages.map(({ role, text }) => ({ role, text })) }),
      });
      const data = (await response.json()) as {
        reply?: string;
        historyReply?: string;
        products?: RecommendedProduct[];
        clarify?: ClarifyQuestion | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "AI yanıtı alınamadı.");
      }

      const displayText = data.reply || "Şu anda yanıt üretemedim. Canlı desteğe yönlenerek hızlıca yardım alabilirsin.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          // historyReply (SORU/SECENEK blogu korunmus) API gecmisine gider,
          // ekranda ise temizlenmis displayText gosterilir.
          text: data.historyReply || displayText,
          displayText,
          products: data.products,
          clarify: data.clarify,
        },
      ]);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "AI yanıtı alınamadı.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Şu anda AI bağlantısında bir sorun var. İstersen canlı destek ekibine geçebilir veya biraz sonra tekrar deneyebilirsin.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <div className="ai-chat-copy">
        <span className="section-kicker">Akıllı destek</span>
        <h1>Kiralama kararını birkaç soruyla netleştir.</h1>
        <p>
          Ürün seçimi, kiralama süresi, ödeme özeti veya teslimat hakkında hızlıca fikir al. Gerekirse canlı destek
          ekibine yönlenebilirsin.
        </p>
        <div className="ai-chat-prompt-list">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={loading}>
              <Sparkles size={14} />
              {prompt}
            </button>
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

      <section className="ai-chat-surface">
      <div className="ai-chat-header">
        <span>
          <Bot size={22} />
        </span>
        <div>
          <b>Castapos AI</b>
          <small>Ürün seçimi ve kiralama planı asistanı</small>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.map((message, index) => (
          <article key={`${message.role}-${index}`} className={`ai-chat-message ${message.role}`}>
            <span aria-hidden="true">{message.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}</span>
            <div>
              <p>{renderMessageText(message.displayText ?? message.text)}</p>
              {message.products && message.products.length > 0 && (
                <div className="ai-chat-product-cards">
                  {message.products.map((product) => (
                    <Link key={product.id} href={product.url} className="ai-chat-product-card">
                      <img src={product.image} alt={product.name} />
                      <div>
                        <b>{product.name}</b>
                        <span>{product.monthly} / ay</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {message.clarify && (
                <div className="ai-chat-quick-options">
                  {message.clarify.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="ai-chat-quick-option"
                      onClick={() => sendMessage(option)}
                      disabled={loading}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
        {loading && (
          <article className="ai-chat-message assistant loading">
            <span aria-hidden="true">
              <Loader2 size={17} />
            </span>
            <p>Castapos AI yanıt hazırlıyor...</p>
          </article>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      <form className="ai-chat-form" onSubmit={handleSubmit}>
        {error && <div className="ai-chat-error">{error}</div>}
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Örn. Ev için koşu bandı arıyorum, 3 ay kiralamak istiyorum."
          disabled={loading}
        />
        <button type="submit" aria-label="Mesaj gönder" disabled={loading}>
          {loading ? <Loader2 size={18} /> : <Send size={18} />}
        </button>
      </form>
      </section>
    </>
  );
}
