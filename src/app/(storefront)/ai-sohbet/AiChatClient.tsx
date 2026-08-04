"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, UserRound } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: value },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "AI yanıtı alınamadı.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "Şu anda yanıt üretemedim. Canlı desteğe yönlenerek hızlıca yardım alabilirsin.",
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

  return (
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
            <p>{message.text}</p>
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
  );
}
