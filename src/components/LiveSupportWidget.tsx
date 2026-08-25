"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bot, Headphones, Mail, MessageCircle, Send, X, ChevronLeft } from "lucide-react";
import { getMyLiveTicket, startLiveChat, getLiveTicket, addMessageToTicket } from "@/app/hesap/destek/actions";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface LiveMessage {
  senderId: string;
  senderName: string;
  senderRole?: string;
  message: string;
  createdAt: string;
}

interface LiveTicket {
  id: string;
  description: string;
  createdAt: string;
  status: string;
  messages: LiveMessage[];
}

export function LiveSupportWidget() {
  const { supportPhone } = useSiteSettings();
  const whatsappUrl = `https://wa.me/${supportPhone.replace(/\D/g, "")}?text=Merhaba%20Castapos%2C%20kiralama%20s%C3%BCreci%20hakk%C4%B1nda%20destek%20almak%20istiyorum.`;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "chat">("menu");
  const [ticket, setTicket] = useState<LiveTicket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  // Sayfanın başka bir yerinden (ör. Müşteri Hizmetleri butonu) doğrudan
  // sohbet görünümünü açmak için — FAB'ın kendi menü akışı bundan etkilenmez.
  useEffect(() => {
    const openDirectlyToChat = () => {
      setOpen(true);
      setView("chat");
    };
    window.addEventListener("castapos-open-live-chat", openDirectlyToChat);
    return () => window.removeEventListener("castapos-open-live-chat", openDirectlyToChat);
  }, []);

  // Sohbet paneli açıldığında: daha önce açık bir görüşme var mı diye bak.
  useEffect(() => {
    if (view !== "chat") return;
    let cancelled = false;
    setLoadingTicket(true);
    getMyLiveTicket().then((t) => {
      if (!cancelled) {
        setTicket(t);
        setLoadingTicket(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [view]);

  // ~5sn'de bir yeni mesaj var mı diye sessizce kontrol et (yazarken atlanır).
  useEffect(() => {
    if (view !== "chat" || !ticket?.id) return;
    const timer = setInterval(async () => {
      if (draftRef.current.trim()) return;
      const fresh = await getLiveTicket(ticket.id);
      if (fresh) setTicket(fresh);
    }, 5000);
    return () => clearInterval(timer);
  }, [view, ticket?.id]);

  // Yeni mesaj gelince en alta kaydır.
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [ticket?.messages?.length]);

  const openChat = () => {
    setView("chat");
  };

  const backToMenu = () => {
    setView("menu");
  };

  const closeWidget = () => {
    setOpen(false);
    setView("menu");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft("");

    if (!ticket || ticket.status === "CLOSED") {
      const res = await startLiveChat(text);
      if (res.success && res.ticket) {
        setTicket(res.ticket);
      }
    } else {
      // İyimser güncelleme — bir sonraki polling turu gerçek veriyle değişir.
      setTicket({
        ...ticket,
        messages: [
          ...ticket.messages,
          {
            senderId: "me",
            senderName: "Sen",
            senderRole: "CUSTOMER",
            message: text,
            createdAt: new Date().toISOString(),
          },
        ],
      });
      await addMessageToTicket(ticket.id, text);
      const fresh = await getLiveTicket(ticket.id);
      if (fresh) setTicket(fresh);
    }
    setSending(false);
  };

  return (
    <div className={`live-support-widget ${open ? "open" : ""}`}>
      {open && (
        <section className="live-support-panel" aria-label="Canlı destek">
          <div className="live-support-head">
            {view === "chat" ? (
              <button type="button" className="live-support-back" aria-label="Menüye dön" onClick={backToMenu}>
                <ChevronLeft size={18} />
              </button>
            ) : (
              <span className="live-support-logo">C</span>
            )}
            <div>
              <b>{view === "chat" ? "Canlı Destek" : "Merhaba!"}</b>
              <p>{view === "chat" ? "Ekibimiz en kısa sürede yanıtlayacak" : "Sana nasıl yardımcı olabiliriz?"}</p>
            </div>
            <button type="button" aria-label="Canlı desteği kapat" onClick={closeWidget}>
              <X size={18} />
            </button>
          </div>

          {view === "menu" ? (
            <div className="live-support-options">
              <button type="button" onClick={openChat}>
                <span>
                  <Headphones size={20} />
                </span>
                <div>
                  <b>Canlı Destek</b>
                  <small>Ekibimizle site üzerinden anında yazış, giriş yapmana gerek yok</small>
                </div>
              </button>
              <Link href="/ai-sohbet" onClick={closeWidget}>
                <span>
                  <Bot size={20} />
                </span>
                <div>
                  <b>AI ile sohbet</b>
                  <small>Ürün seçimi ve kiralama soruları için akıllı asistan</small>
                </div>
              </Link>
              <Link href="/bilgi/iletisim" onClick={closeWidget}>
                <span>
                  <Mail size={20} />
                </span>
                <div>
                  <b>İletişim</b>
                  <small>Tüm iletişim bilgilerini ve formu görüntüle</small>
                </div>
              </Link>
            </div>
          ) : (
            <div className="live-support-chat">
              <div className="live-support-chat-messages" ref={messagesRef}>
                {loadingTicket ? (
                  <p className="live-support-chat-empty">Yükleniyor...</p>
                ) : !ticket ? (
                  <p className="live-support-chat-empty">
                    Merhaba! Aklına takılan her şeyi yazabilirsin, ekibimiz en kısa sürede döner.
                  </p>
                ) : (
                  <>
                    <div className="live-support-chat-bubble mine">
                      <p>{ticket.description}</p>
                    </div>
                    {ticket.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`live-support-chat-bubble ${msg.senderRole === "AGENT" ? "theirs" : "mine"}`}
                      >
                        {msg.senderRole === "AGENT" && <small>{msg.senderName}</small>}
                        <p>{msg.message}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {ticket?.status === "CLOSED" && (
                <p className="live-support-chat-closed">Bu görüşme kapatıldı. Yazacağın yeni mesaj yeni bir görüşme başlatır.</p>
              )}

              <form className="live-support-chat-composer" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Mesajını yaz..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !draft.trim()} aria-label="Gönder">
                  <Send size={17} />
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        className="live-support-fab"
        aria-expanded={open}
        aria-label={open ? "Canlı destek seçeneklerini kapat" : "Canlı destek seçeneklerini aç"}
        onClick={() => setOpen((prev) => !prev)}
      >
        <MessageCircle size={21} />
        <span>Canlı Destek</span>
      </button>

      <a className="live-support-whatsapp" href={whatsappUrl} target="_blank" rel="noopener" aria-label="WhatsApp destek">
        WhatsApp
      </a>
    </div>
  );
}
