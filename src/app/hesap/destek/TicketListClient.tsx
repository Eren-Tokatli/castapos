"use client";

import React, { useMemo, useState } from "react";
import { MessageSquare, Plus, Send, ChevronRight, X } from "lucide-react";
import { addMessageToTicket } from "./actions";
import { NewTicketWizard, type WizardOrder } from "./NewTicketWizard";

interface Message {
  senderId: string;
  senderName: string;
  senderRole?: "CUSTOMER" | "GUEST" | "AGENT" | string;
  message: string;
  createdAt: string;
}

function isAgentMessage(msg: Message) {
  if (msg.senderRole) return msg.senderRole === "AGENT";
  // Eski kayıtlar (senderRole eklenmeden önce) için geriye dönük uyumluluk
  return msg.senderId === "agent" || msg.senderId === "support" || msg.senderId === "admin";
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED" | string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  orderNumber?: string | null;
  productName?: string | null;
  reasonLabel?: string | null;
}

const STATUS_META: Record<string, { text: string; tone: string }> = {
  OPEN: { text: "Yanıt Bekliyor", tone: "wait" },
  IN_PROGRESS: { text: "İşlemde", tone: "progress" },
  CLOSED: { text: "Çözüldü", tone: "done" },
};

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }).toLocaleUpperCase("tr-TR");
}

export function TicketListClient({
  initialTickets,
  orders,
}: {
  initialTickets: Ticket[];
  orders: WizardOrder[];
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const activeTicket = tickets.find((t) => t.id === activeTicketId) || null;

  const groups = useMemo(() => {
    const map = new Map<string, Ticket[]>();
    for (const t of tickets) {
      const key = monthKey(t.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [tickets]);

  const closeChat = () => {
    setActiveTicketId(null);
    setReplyMessage("");
  };

  const handleSendReply = async (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setReplyLoading(true);
    const res = await addMessageToTicket(ticketId, replyMessage);
    setReplyLoading(false);

    if (res.success) {
      const sentMessage = replyMessage.trim();
      setReplyMessage("");
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: "OPEN",
                messages: [
                  ...(t.messages || []),
                  { senderId: "current-user", senderName: "Siz", senderRole: "CUSTOMER", message: sentMessage, createdAt: new Date().toISOString() },
                ],
              }
            : t
        )
      );
    }
  };

  return (
    <>
      <div className="account-panel-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1>Soru ve Taleplerim</h1>
          <p>Bizimle iletişime geçin, sorularınızı ve teknik taleplerinizi buradan takip edin.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowWizard(true)}>
          <Plus size={16} /> Yeni Soru ve Talep
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-account-state">
          <span><MessageSquare size={30} /></span>
          <h2>Henüz bir talebin yok</h2>
          <p>Bir sorun ya da sorun varsa "Yeni Soru ve Talep" ile hemen bize ulaşabilirsin.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 22 }}>
          {groups.map(([month, monthTickets]) => (
            <div key={month}>
              <h4 style={{ fontSize: 12, fontWeight: 900, letterSpacing: ".06em", color: "#98a2b3", margin: "0 0 10px" }}>{month}</h4>
              <div className="order-list">
                {monthTickets.map((t) => {
                  const meta = STATUS_META[t.status] || { text: t.status, tone: "wait" };
                  const title = t.reasonLabel || t.subject;
                  const subLine = t.productName
                    ? `${t.productName}${t.orderNumber ? ` · Sipariş #${t.orderNumber}` : ""}`
                    : t.description;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      className="order-row"
                      style={{ width: "100%", cursor: "pointer", font: "inherit", textAlign: "left" }}
                      onClick={() => setActiveTicketId(t.id)}
                    >
                      <div className="order-row-thumbs">
                        <span className="order-row-thumb-fallback"><MessageSquare size={18} /></span>
                      </div>
                      <div className="order-row-main">
                        <span className="order-row-number"><b>{title}</b></span>
                        <span style={{ display: "block", minWidth: 0, maxWidth: "100%", color: "#667085", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {subLine}
                        </span>
                        <span className={`order-status-pill tone-${meta.tone}`}>{meta.text}</span>
                      </div>
                      <div className="order-row-end">
                        <span className="order-row-date">{new Date(t.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long" })}</span>
                      </div>
                      <ChevronRight size={18} className="order-row-chevron" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showWizard && (
        <NewTicketWizard
          orders={orders}
          onClose={() => setShowWizard(false)}
          onCreated={() => {
            setShowWizard(false);
            window.location.reload();
          }}
        />
      )}

      {activeTicket && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(16,24,40,.48)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 400 }}
          onClick={closeChat}
        >
          <section
            className="live-support-panel"
            aria-label="Konuşma geçmişi"
            style={{ width: "min(640px, calc(100vw - 32px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="live-support-head">
              <span className="live-support-logo"><MessageSquare size={18} /></span>
              <div>
                <b>{activeTicket.reasonLabel || activeTicket.subject}</b>
                <p>{STATUS_META[activeTicket.status]?.text || activeTicket.status}</p>
              </div>
              <button type="button" aria-label="Kapat" onClick={closeChat}>
                <X size={18} />
              </button>
            </div>

            <div className="live-support-chat">
              <div className="live-support-chat-messages">
                <div className="live-support-chat-bubble mine">
                  <p>{activeTicket.description}</p>
                </div>
                {activeTicket.messages?.map((msg, idx) => {
                  const isSiz = !isAgentMessage(msg);
                  return (
                    <div key={idx} className={`live-support-chat-bubble ${isSiz ? "mine" : "theirs"}`}>
                      {!isSiz && <small>{msg.senderName}</small>}
                      <p>{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              {activeTicket.status === "CLOSED" ? (
                <p className="live-support-chat-closed">Bu görüşme kapatıldı.</p>
              ) : (
                <form className="live-support-chat-composer" onSubmit={(e) => handleSendReply(e, activeTicket.id)}>
                  <input
                    type="text"
                    placeholder="Yanıtını yaz..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    disabled={replyLoading}
                  />
                  <button type="submit" disabled={replyLoading || !replyMessage.trim()} aria-label="Gönder">
                    <Send size={17} />
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
