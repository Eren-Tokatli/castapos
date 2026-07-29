"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, Clock, Mail, Phone, User, Filter, ShieldAlert } from "lucide-react";
import { addMessageToTicket } from "../hesap/destek/actions";
import { closeTicket } from "./actions";

interface Message {
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED" | string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  user: UserDetail;
}

export function AgentTicketListClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTickets.length > 0 ? initialTickets[0].id : null
  );

  // Filter state: ALL, OPEN, CLOSED
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

  // Reply form state
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  // Filtered tickets logic
  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "OPEN") return t.status !== "CLOSED";
    if (filterStatus === "CLOSED") return t.status === "CLOSED";
    return true;
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyMessage.trim()) return;

    setReplyLoading(true);
    const res = await addMessageToTicket(selectedTicketId, replyMessage);
    setReplyLoading(false);

    if (res.success) {
      setReplyMessage("");
      // Update state locally
      const updatedTickets = tickets.map((t) => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            status: "IN_PROGRESS",
            messages: [
              ...(t.messages || []),
              {
                senderId: "agent",
                senderName: "Destek Temsilcisi (Siz)",
                message: replyMessage.trim(),
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return t;
      });
      setTickets(updatedTickets);
      // Brief sync with backend
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicketId) return;

    setStatusLoading(true);
    const res = await closeTicket(selectedTicketId);
    setStatusLoading(false);

    if (res.success) {
      const updatedTickets = tickets.map((t) => {
        if (t.id === selectedTicketId) {
          return { ...t, status: "CLOSED" };
        }
        return t;
      });
      setTickets(updatedTickets);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px] items-start">
      {/* FILTER & LIST AREA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm lg:col-span-1 space-y-4">
        {/* Filters */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter size={11} /> Durum Filtresi
          </span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === "ALL" ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Tümü ({tickets.length})
            </button>
            <button
              onClick={() => setFilterStatus("OPEN")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === "OPEN" ? "bg-blue-500 text-white" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Açık / İşlemde ({tickets.filter((t) => t.status !== "CLOSED").length})
            </button>
            <button
              onClick={() => setFilterStatus("CLOSED")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === "CLOSED" ? "bg-emerald-500 text-white" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              Çözülenler ({tickets.filter((t) => t.status === "CLOSED").length})
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Talepler</span>
          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto mt-2 pr-1 space-y-1">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">Filtreye uygun kayıt bulunamadı.</div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-1.5 ${
                    selectedTicketId === t.id ? "bg-blue-50/70 border border-blue-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start w-full gap-2">
                    <h4 className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{t.subject}</h4>
                    <span
                      className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        t.status === "OPEN"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : t.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {t.status === "OPEN" ? "AÇIK" : t.status === "IN_PROGRESS" ? "İŞLEMDE" : "KAPANDI"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold truncate">
                    {t.user.firstName} {t.user.lastName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {new Date(t.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CHAT & USER METADATA THREAD AREA */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Selected Ticket Thread */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[500px]">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedTicket.subject}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Talep ID: <span className="font-mono text-slate-600">{selectedTicket.id}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedTicket.status !== "CLOSED" && (
                    <button
                      onClick={handleCloseTicket}
                      disabled={statusLoading}
                      className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 size={13} /> Talebi Kapat
                    </button>
                  )}
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-5 space-y-4 max-h-[380px] overflow-y-auto bg-slate-50/20">
                {/* Main description */}
                <div className="flex flex-col items-start max-w-[85%] bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm text-sm shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">Müşteri</span>
                  <p className="text-slate-800 whitespace-pre-wrap">{selectedTicket.description}</p>
                  <span className="text-[9px] text-slate-400 self-end mt-2">
                    {new Date(selectedTicket.createdAt).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Replies */}
                {selectedTicket.messages?.map((msg, index) => {
                  const isAgent = msg.senderId === "agent" || msg.senderId === "support" || msg.senderId === "admin";
                  return (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] p-4 rounded-2xl text-sm ${
                        isAgent
                          ? "self-end items-end bg-blue-600 text-white rounded-tr-sm shadow-sm"
                          : "self-start items-start bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-sm"
                      }`}
                      style={{ marginLeft: isAgent ? "auto" : "0", marginRight: isAgent ? "0" : "auto" }}
                    >
                      <span className={`text-[10px] font-bold mb-1 ${isAgent ? "text-blue-200" : "text-slate-400"}`}>
                        {msg.senderName}
                      </span>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <span className={`text-[9px] self-end mt-2 ${isAgent ? "text-blue-200" : "text-slate-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message composer */}
              {selectedTicket.status !== "CLOSED" ? (
                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50/50 rounded-b-2xl">
                  <input
                    type="text"
                    required
                    placeholder="Temsilci olarak yanıtlayın..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={replyLoading || !replyMessage.trim()}
                    className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition shadow-sm disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400 bg-slate-50 rounded-b-2xl">
                  Bu destek talebi kapatılmıştır.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-center min-h-[500px]">
              <MessageSquare size={48} className="opacity-20 mb-3" />
              <h3 className="font-bold text-slate-700 text-base">Talep Seçilmedi</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mt-1.5">
                Müşteri görüşmesini görüntülemek için sol menüden bir destek kaydı seçin.
              </p>
            </div>
          )}
        </div>

        {/* User Info Details Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            Müşteri Kartı
          </h3>
          {selectedTicket ? (
            <div className="space-y-4 text-slate-700">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shadow-xs">
                  <User size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold">MÜŞTERİ</p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shadow-xs">
                  <Mail size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold">E-POSTA</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{selectedTicket.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shadow-xs">
                  <Phone size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold">TELEFON</p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {selectedTicket.user.phone || "Girilmemiş"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400">YETKİLENDİRME</span>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-500 text-[10px] leading-relaxed mt-1 flex gap-1.5 items-start">
                  <ShieldAlert size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  Görüşmeler iyzico ödeme kayıtları ve kiralama sözleşmeleriyle doğrudan ilişkilidir.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">Seçili müşteri bilgisi yok.</div>
          )}
        </div>
      </div>
    </div>
  );
}
