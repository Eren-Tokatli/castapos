"use client";

import React, { useState } from "react";
import { MessageSquare, Plus, Send, Clock, CheckCircle2, ChevronRight, X } from "lucide-react";
import { createTicket, addMessageToTicket } from "./actions";

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
}

export function TicketListClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTickets.length > 0 ? initialTickets[0].id : null
  );

  // New ticket form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [newLoading, setNewLoading] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  // Reply form state
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewError(null);
    setNewLoading(true);

    const res = await createTicket(subject, description);
    setNewLoading(false);

    if (!res.success) {
      setNewError(res.error || "Bir hata oluştu.");
      return;
    }

    // Reset and close
    setSubject("");
    setDescription("");
    setShowNewForm(false);
    
    // Quick refresh of ticket list (simplest for dev is reloading page or manual append)
    window.location.reload();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyMessage.trim()) return;

    setReplyLoading(true);
    const res = await addMessageToTicket(selectedTicketId, replyMessage);
    setReplyLoading(false);

    if (res.success) {
      setReplyMessage("");
      // Update state locally to immediately show reply
      const updatedTickets = tickets.map((t) => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            status: "OPEN",
            messages: [
              ...(t.messages || []),
              {
                senderId: "current-user", // placeholder to match alignment logic
                senderName: "Siz",
                message: replyMessage.trim(),
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return t;
      });
      setTickets(updatedTickets);
      // Wait a moment and sync with db
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-h-[580px]">
      {/* LEFT COLUMN: Tickets list */}
      <div className="premium-surface p-4 space-y-4 lg:col-span-1">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Taleplerim</h3>
          <button
            onClick={() => setShowNewForm(true)}
            className="premium-btn !px-3 !py-1.5 !text-xs"
          >
            <Plus size={14} /> Yeni Talep
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
          {tickets.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              Aktif destek talebiniz bulunmuyor.
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`w-full text-left p-3 rounded-xl transition flex justify-between items-start gap-2 ${
                  selectedTicketId === t.id ? "bg-[#fff1ec] border border-[#ffd6c8]" : "hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">{t.subject}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(t.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <span
                  className={`status-pill text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    t.status === "OPEN"
                      ? "bg-[#fff1ec] text-[var(--brand-dark)] border border-[#ffd6c8]"
                      : t.status === "IN_PROGRESS"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {t.status === "OPEN" ? "Yanıt Bekliyor" : t.status === "IN_PROGRESS" ? "İşlemde" : "Çözüldü"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Ticket Chat Thread */}
      <div className="lg:col-span-2 min-h-[500px]">
        {showNewForm ? (
          /* Create New Ticket Form */
          <div className="premium-surface p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Yeni Destek Talebi</h3>
              <button
                onClick={() => setShowNewForm(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition"
              >
                <X size={20} />
              </button>
            </div>

            {newError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">{newError}</div>}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Destek Konusu</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Cihaz teslimatı hakkında"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Sorunuz veya Mesajınız</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Talebinizi detaylandırın. Sipariş numarası veya cihaz kodunu ekleyebilirsiniz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[var(--gold)] resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={newLoading}
                  className="premium-btn !px-5 !py-2 !text-sm"
                >
                  {newLoading ? "Gönderiliyor..." : "Talebi Gönder"}
                </button>
              </div>
            </form>
          </div>
        ) : selectedTicket ? (
          /* Active Chat Thread */
          <div className="premium-surface flex flex-col min-h-[500px]">
            {/* Thread Header */}
            <div className="p-5 border-b border-[#ffd6c8] flex justify-between items-center bg-[#fff7f4] rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Talep ID: <span className="font-mono text-slate-500">{selectedTicket.id}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedTicket.status === "CLOSED" ? (
                  <span className="status-pill flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 size={13} /> Çözüldü
                  </span>
                ) : (
                  <span className="status-pill flex items-center gap-1 text-xs font-bold text-[var(--brand-dark)] bg-[#fff1ec] px-2.5 py-1 rounded-full border border-[#ffd6c8]">
                    <Clock size={13} /> Yanıt Bekleniyor
                  </span>
                )}
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-5 space-y-4 max-h-[360px] overflow-y-auto bg-slate-50/30">
              {/* Main Ticket Description */}
              <div className="flex flex-col items-start max-w-[85%] bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm text-sm">
                <span className="text-[10px] font-bold text-slate-400 mb-1">Müşteri</span>
                <p className="text-slate-800 whitespace-pre-wrap">{selectedTicket.description}</p>
                <span className="text-[9px] text-slate-400 self-end mt-2">
                  {new Date(selectedTicket.createdAt).toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Chat replies */}
              {selectedTicket.messages?.map((msg, index) => {
                const isSiz = msg.senderId !== "agent" && msg.senderId !== "support" && msg.senderId !== "admin";
                return (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[85%] p-4 rounded-2xl text-sm ${
                      isSiz
                        ? "self-end items-end text-[var(--gold-light)] rounded-tr-sm"
                        : "self-start items-start bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-sm"
                    }`}
                    style={{
                      marginLeft: isSiz ? "auto" : "0",
                      marginRight: isSiz ? "0" : "auto",
                      background: isSiz ? "linear-gradient(135deg, var(--navy), var(--navy-3))" : undefined,
                    }}
                  >
                    <span className={`text-[10px] font-bold mb-1 ${isSiz ? "text-[var(--gold)]" : "text-slate-400"}`}>
                      {msg.senderName}
                    </span>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <span className={`text-[9px] self-end mt-2 ${isSiz ? "text-[var(--gold)]" : "text-slate-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            {selectedTicket.status !== "CLOSED" ? (
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Yanıtınızı buraya yazın..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[var(--gold)]"
                />
                <button
                  type="submit"
                  disabled={replyLoading || !replyMessage.trim()}
                  className="premium-btn !w-11 !h-11 !p-0"
                >
                  <Send size={16} />
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400 bg-slate-50 rounded-b-2xl">
                Bu destek talebi kapatılmıştır. Sorularınız için yeni bir destek talebi oluşturabilirsiniz.
              </div>
            )}
          </div>
        ) : (
          <div className="premium-surface min-h-[500px] flex flex-col items-center justify-center p-6 text-slate-400 text-center">
            <MessageSquare size={48} className="opacity-20 mb-3" />
            <h3 className="font-bold text-slate-700 text-base">Destek Görüşmesi Seçilmedi</h3>
            <p className="text-xs text-slate-400 max-w-[320px] mt-1.5">
              Sorularınız ve talepleriniz için sol taraftan bir destek kaydı seçin veya yeni bir talep başlatın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
