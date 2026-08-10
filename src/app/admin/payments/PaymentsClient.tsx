"use client";

import React, { useState } from "react";
import { Search, Plus, Copy, Check, Trash2, Link as LinkIcon, FileText, X } from "lucide-react";
import { createPaymentLink, deletePaymentLink } from "./actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";

interface PaymentRecord {
  id: string;
  kind: string;
  payerName: string;
  payerEmail: string | null;
  payerPhone: string | null;
  amount: number;
  description: string | null;
  iyzicoToken: string | null;
  iyzicoPaymentId: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface PaymentLinkRecord {
  id: string;
  token: string;
  payerName: string;
  payerEmail: string;
  payerPhone: string | null;
  amount: number;
  description: string;
  paid: boolean;
  createdAt: string;
}

interface PaymentsClientProps {
  payments: PaymentRecord[];
  paymentLinks: PaymentLinkRecord[];
}

export function PaymentsClient({ payments, paymentLinks }: PaymentsClientProps) {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<"logs" | "links">("logs");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);

  // Form Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentLinkRecord | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Geçerli bir tutar girin.");
      setLoading(false);
      return;
    }

    const res = await createPaymentLink({
      payerName: formName,
      payerEmail: formEmail,
      payerPhone: formPhone || undefined,
      amount: amountNum,
      description: formDesc,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Ödeme linki oluşturulamadı.");
      return;
    }

    // Set generated link for display
    const host = typeof window !== "undefined" ? window.location.origin : "";
    const fullLink = `${host}/pay/link/${res.token}`;
    setGeneratedLink(fullLink);

    // Reset inputs
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAmount("");
    setFormDesc("");
  };

  const confirmDeleteLink = async () => {
    if (!deleteTarget) return;
    const res = await deletePaymentLink(deleteTarget.id);
    setDeleteTarget(null);
    if (res.success) {
      window.location.reload();
    } else {
      setAlertMessage("Silme işlemi başarısız.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.payerName.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.iyzicoPaymentId && p.iyzicoPaymentId.toLowerCase().includes(term))
    );
  });

  const filteredLinks = paymentLinks.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      l.payerName.toLowerCase().includes(term) ||
      l.payerEmail.toLowerCase().includes(term) ||
      l.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title with Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ödemeler & Kasalar</h2>
          <p className="text-slate-500 text-sm">
            Iyzico işlem geçmişini görüntüleyin veya özel müşteri ödeme linkleri tanımlayın.
          </p>
        </div>
        {activeTab === "links" && (
          <button
            onClick={() => {
              setGeneratedLink(null);
              setError(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            <Plus size={16} /> Ödeme Linki Oluştur
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="border-b border-slate-200 flex gap-4 text-sm font-bold">
        <button
          onClick={() => {
            setActiveTab("logs");
            setSearchTerm("");
          }}
          className={`pb-3 transition ${
            activeTab === "logs" ? "border-b-2 border-orange-500 text-orange-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Iyzico İşlem Kayıtları
        </button>
        <button
          onClick={() => {
            setActiveTab("links");
            setSearchTerm("");
          }}
          className={`pb-3 transition ${
            activeTab === "links" ? "border-b-2 border-orange-500 text-orange-500" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Oluşturulan Ödeme Linkleri
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex items-center">
        <Search size={17} className="text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder={
            activeTab === "logs"
              ? "Ödeyen kişi, açıklama veya Iyzico ref no ile arama yapın..."
              : "Müşteri adı, e-posta veya açıklama ile arama yapın..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-slate-800 placeholder-slate-400 outline-none text-sm bg-transparent"
        />
      </div>

      {/* TAB 1: Payment Logs (Iyzico transaction logs) */}
      {activeTab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase">
                  <th className="p-4">İşlem ID / Tarih</th>
                  <th className="p-4">Tür</th>
                  <th className="p-4">Ödeyen</th>
                  <th className="p-4">Açıklama</th>
                  <th className="p-4">Tutar</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Ödeme işlem kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <span className="text-[10px] font-mono text-slate-400 block">{p.id.toUpperCase()}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {new Date(p.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                            p.kind === "ORDER"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {p.kind === "ORDER" ? "Sipariş Ödemesi" : "Taksit Ödemesi"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-900 block">{p.payerName}</span>
                        {p.payerPhone && <span className="text-xs text-slate-500 block">{p.payerPhone}</span>}
                      </td>
                      <td className="p-4 text-slate-600 text-xs">{p.description}</td>
                      <td className="p-4 font-bold text-slate-950 text-base">
                        ₺{p.amount.toLocaleString("tr-TR")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            p.status === "SUCCESS"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : p.status === "FAILED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          {p.status === "SUCCESS" ? "Başarılı" : p.status === "FAILED" ? "Başarısız" : "Beklemede"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Generated Custom Payment Links */}
      {activeTab === "links" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase">
                  <th className="p-4">Oluşturma Tarihi</th>
                  <th className="p-4">Müşteri</th>
                  <th className="p-4">Açıklama</th>
                  <th className="p-4">Tutar</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Oluşturulmuş ödeme linki bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => {
                    const host = typeof window !== "undefined" ? window.location.origin : "";
                    const fullUrl = `${host}/pay/link/${link.token}`;
                    return (
                      <tr key={link.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <span className="text-slate-500">
                            {new Date(link.createdAt).toLocaleString("tr-TR")}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-900 block">{link.payerName}</span>
                          <span className="text-[10px] text-slate-400 block">{link.payerEmail}</span>
                          {link.payerPhone && <span className="text-[10px] text-slate-400 block">{link.payerPhone}</span>}
                        </td>
                        <td className="p-4 text-slate-600 truncate max-w-[200px]">{link.description}</td>
                        <td className="p-4 font-bold text-slate-950 text-sm">
                          ₺{link.amount.toLocaleString("tr-TR")}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              link.paid
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {link.paid ? "Ödendi" : "Beklemede"}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2 items-center">
                          <button
                            onClick={() => copyToClipboard(fullUrl, link.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold transition"
                            title="Linki Kopyala"
                          >
                            {copiedId === link.id ? (
                              <><Check size={12} className="text-green-600" /> Kopyalandı</>
                            ) : (
                              <><LinkIcon size={12} /> Kopyala</>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(link)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Linki İptal Et/Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PAYMENT LINK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" /> Yeni Ödeme Linki Tanımla
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  window.location.reload();
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {generatedLink ? (
              <div className="p-6 space-y-4 text-sm text-center">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={26} />
                </div>
                <h4 className="font-bold text-slate-800">Ödeme Linki Başarıyla Oluşturuldu</h4>
                <p className="text-xs text-slate-500 leading-normal px-4">
                  Müşteriniz bu linke girerek kredi kartı ile ödemesini iyzico güvencesiyle tamamlayabilir.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs text-left">
                  <span className="truncate pr-4 select-all font-mono text-slate-600">{generatedLink}</span>
                  <button
                    onClick={() => copyToClipboard(generatedLink, "modal")}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold"
                  >
                    {copiedId === "modal" ? <Check size={12} /> : <Copy size={12} />} Kopyala
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      window.location.reload();
                    }}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition text-xs"
                  >
                    Kapat ve Listeye Dön
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateLink} className="p-6 space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Müşteri Adı Soyadı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">E-posta Adresi *</label>
                    <input
                      type="email"
                      required
                      placeholder="ahmet@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Telefon Numarası</label>
                    <input
                      type="tel"
                      placeholder="5xxxxxxxxx"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tahsil Edilecek Tutar (TL) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="500.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ödeme Açıklaması *</label>
                  <textarea
                    required
                    placeholder="Örn: Hasarlı Cihaz Bedeli Tahsilatı veya Hasar Faturası Ek Bedel..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full min-h-[80px] p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      window.location.reload();
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Oluşturuluyor..." : "Ödeme Linki Oluştur"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL (Payment Record detail logs) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">İşlem Detayları</h3>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Ödeyen Kişi</span>
                <b className="col-span-2 text-slate-900 font-semibold">{selectedRecord.payerName}</b>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">İletişim</span>
                <span className="col-span-2 text-slate-800">
                  {selectedRecord.payerEmail || "-"} <br /> {selectedRecord.payerPhone || "-"}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Tutar / Durum</span>
                <span className="col-span-2">
                  <b className="text-slate-900 text-base">₺{selectedRecord.amount.toLocaleString("tr-TR")}</b>
                  <span
                    className={`ml-2 text-xs font-bold px-2 py-0.25 rounded-full border ${
                      selectedRecord.status === "SUCCESS"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {selectedRecord.status === "SUCCESS" ? "Başarılı" : "Başarısız"}
                  </span>
                </span>
              </div>
              {selectedRecord.iyzicoPaymentId && (
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Iyzico Ref ID</span>
                  <span className="col-span-2 font-mono text-xs text-slate-800">{selectedRecord.iyzicoPaymentId}</span>
                </div>
              )}
              {selectedRecord.errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 space-y-1">
                  <span className="text-xs font-bold uppercase block">Hata Mesajı</span>
                  <p className="text-xs leading-relaxed font-semibold">{selectedRecord.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl text-sm transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Ödeme Linkini Sil"
        message={deleteTarget ? `${deleteTarget.payerName} adına oluşturulan ödeme linkini iptal etmek/silmek istediğine emin misin?` : ""}
        confirmLabel="Evet, Sil"
        onConfirm={confirmDeleteLink}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!alertMessage}
        title="İşlem Başarısız"
        message={alertMessage || ""}
        danger={false}
        onClose={() => setAlertMessage(null)}
      />
    </div>
  );
}
