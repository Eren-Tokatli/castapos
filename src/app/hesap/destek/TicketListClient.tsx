"use client";

import React, { useMemo, useState } from "react";
import { MessageSquare, Plus, Send, ChevronDown } from "lucide-react";
import { addMessageToTicket } from "./actions";
import { NewTicketWizard, type WizardOrder } from "./NewTicketWizard";

interface Message {
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, Ticket[]>();
    for (const t of tickets) {
      const key = monthKey(t.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [tickets]);

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
                  { senderId: "current-user", senderName: "Siz", message: sentMessage, createdAt: new Date().toISOString() },
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
                  const isOpen = expandedId === t.id;
                  const title = t.reasonLabel || t.subject;
                  const subLine = t.productName
                    ? `${t.productName}${t.orderNumber ? ` · Sipariş #${t.orderNumber}` : ""}`
                    : t.description;

                  return (
                    <div key={t.id}>
                      <button
                        type="button"
                        className="order-row"
                        style={{ width: "100%", cursor: "pointer", font: "inherit", textAlign: "left" }}
                        onClick={() => setExpandedId(isOpen ? null : t.id)}
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
                        <ChevronDown size={18} className="order-row-chevron" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s ease" }} />
                      </button>

                      {isOpen && (
                        <div style={{ border: "1px solid var(--line)", borderTop: 0, borderRadius: "0 0 16px 16px", marginTop: -12, padding: 18, background: "#fbfbfd" }}>
                          <div style={{ display: "grid", gap: 12, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 12, maxWidth: "85%" }}>
                              <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#98a2b3", marginBottom: 4 }}>Müşteri</span>
                              <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{t.description}</p>
                            </div>

                            {t.messages?.map((msg, idx) => {
                              const isSiz = msg.senderId !== "agent" && msg.senderId !== "support" && msg.senderId !== "admin";
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    alignSelf: isSiz ? "flex-end" : "flex-start",
                                    marginLeft: isSiz ? "auto" : 0,
                                    maxWidth: "85%",
                                    background: isSiz ? "var(--brand)" : "#fff",
                                    color: isSiz ? "#fff" : "#101828",
                                    border: isSiz ? "none" : "1px solid var(--line)",
                                    borderRadius: 14,
                                    padding: 12,
                                  }}
                                >
                                  <span style={{ display: "block", fontSize: 10, fontWeight: 800, opacity: 0.8, marginBottom: 4 }}>{msg.senderName}</span>
                                  <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{msg.message}</p>
                                </div>
                              );
                            })}
                          </div>

                          {t.status !== "CLOSED" && (
                            <form onSubmit={(e) => handleSendReply(e, t.id)} style={{ display: "flex", gap: 8, marginTop: 14 }}>
                              <input
                                type="text"
                                required
                                placeholder="Yanıtınızı yazın..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                style={{ flex: 1, height: 42, border: "1px solid var(--line)", borderRadius: 10, padding: "0 12px", font: "inherit" }}
                              />
                              <button type="submit" className="btn btn-primary" disabled={replyLoading} style={{ width: 42, height: 42, padding: 0, display: "grid", placeItems: "center" }}>
                                <Send size={16} />
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
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
    </>
  );
}
