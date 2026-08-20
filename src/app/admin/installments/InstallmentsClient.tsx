"use client";

import React, { useState } from "react";
import { Search, Link2, MessageCircle } from "lucide-react";
import { toggleInstallmentPaid, createInstallmentPaymentLink } from "../agreements/actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";

interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  description: string | null;
  agreementId: string;
  tenantName: string;
  assetName: string;
  phone: string;
}

// Telefonu wa.me formatına çevirir: "0532 123 45 67" -> "905321234567"
function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return null;
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return "90" + digits.slice(1);
  return "90" + digits;
}

interface InstallmentsClientProps {
  initialInstallments: Installment[];
}

export function InstallmentsClient({ initialInstallments }: InstallmentsClientProps) {
  const toast = useAdminToast();
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [filter, setFilter] = useState<"all" | "overdue" | "week" | "month">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // JSX render sırasında (SSR dahil) kullanılıyor — window sadece tarayıcıda var,
  // sunucuda boş string'e düşer, WhatsApp linki hydration sonrası doğru dolar.
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const handleCopyLink = async (installment: Installment) => {
    const link = `${window.location.origin}/pay/taksit/${installment.id}`;
    // Ödeme Kayıtları'nda görünsün ve gönderim zamanı takip edilsin diye kaydı oluştur/güncelle.
    await createInstallmentPaymentLink(installment.id);
    try {
      await navigator.clipboard.writeText(link);
      toast("Ödeme linki kopyalandı ve Ödeme Kayıtları'na eklendi.");
    } catch {
      setAlertMessage(`Link kopyalanamadı, elle kopyala: ${link}`);
    }
  };

  const handleTogglePaid = async (id: string, currentPaid: boolean) => {
    const res = await toggleInstallmentPaid(id, !currentPaid);
    if (res.success) {
      // Update state locally
      setInstallments((prev) =>
        prev.map((i) => (i.id === id ? { ...i, paid: !currentPaid } : i))
      );
      toast(!currentPaid ? "Ödeme alındı olarak işaretlendi." : "Ödeme durumu geri alındı.");
    } else {
      setAlertMessage("Hata oluştu, güncellenemedi.");
    }
  };

  const getFilteredInstallments = () => {
    const today = new Date();
    const cleanSearch = searchTerm.toLowerCase();

    return installments.filter((i) => {
      // 1. Search term check
      const matchesSearch =
        i.tenantName.toLowerCase().includes(cleanSearch) ||
        i.assetName.toLowerCase().includes(cleanSearch) ||
        (i.description && i.description.toLowerCase().includes(cleanSearch));

      if (!matchesSearch) return false;

      // 2. Paid status check (always show unpaid in this view)
      if (i.paid) return false;

      // 3. Date range filter
      const dueDate = new Date(i.dueDate);
      if (filter === "overdue") {
        return dueDate < today;
      }
      if (filter === "week") {
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= today && dueDate <= nextWeek;
      }
      if (filter === "month") {
        const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return dueDate >= today && dueDate <= nextMonth;
      }
      return true;
    });
  };

  const filtered = getFilteredInstallments();

  // Statistics
  const today = new Date();
  const totalUnpaid = installments.filter((i) => !i.paid).reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = installments
    .filter((i) => !i.paid && new Date(i.dueDate) < today)
    .reduce((sum, i) => sum + i.amount, 0);
  const totalUpcoming = totalUnpaid - totalOverdue;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Taksitler & Kasa Takibi</h2>
        <p className="text-slate-500 text-sm">Vadesi gelen veya yaklaşan tüm kiralama taksitlerinin takibi.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase block">Toplam Alacak</span>
          <span className="text-2xl font-black text-slate-900 mt-2 block">
            ₺{totalUnpaid.toLocaleString("tr-TR")}
          </span>
        </div>

        <div className="bg-white p-6 border border-red-200 rounded-2xl shadow-sm bg-red-50/20">
          <span className="text-xs font-bold text-red-500 uppercase block">Geciken Alacaklar</span>
          <span className="text-2xl font-black text-red-600 mt-2 block">
            ₺{totalOverdue.toLocaleString("tr-TR")}
          </span>
        </div>

        <div className="bg-white p-6 border border-emerald-200 rounded-2xl shadow-sm bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-500 uppercase block">Gelecek Alacaklar (30 Gün)</span>
          <span className="text-2xl font-black text-emerald-600 mt-2 block">
            ₺{totalUpcoming.toLocaleString("tr-TR")}
          </span>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              filter === "all"
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Hepsi
          </button>
          <button
            onClick={() => setFilter("overdue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              filter === "overdue"
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Gecikmiş
          </button>
          <button
            onClick={() => setFilter("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              filter === "week"
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Bu Hafta
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              filter === "month"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Bu Ay
          </button>
        </div>

        <div className="w-full sm:w-80 flex items-center border border-slate-200 rounded-xl px-3 py-1.5">
          <Search size={15} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Müşteri veya cihaz ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-slate-800 outline-none placeholder-slate-400 bg-transparent"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase">
                <th className="p-4">Müşteri</th>
                <th className="p-4">Kiralık Cihaz</th>
                <th className="p-4">Taksit Tanımı</th>
                <th className="p-4">Vade Tarihi</th>
                <th className="p-4">Tutar</th>
                <th className="p-4 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Geciken veya bekleyen taksit bulunmuyor.
                  </td>
                </tr>
              ) : (
                filtered.map((i) => {
                  const isOverdue = new Date(i.dueDate) < today;
                  return (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-semibold text-slate-900">{i.tenantName}</td>
                      <td className="p-4 text-slate-600">{i.assetName}</td>
                      <td className="p-4 text-xs text-slate-500">{i.description || "Aylık Taksit"}</td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            isOverdue ? "text-red-600" : "text-slate-700"
                          }`}
                        >
                          {new Date(i.dueDate).toLocaleDateString("tr-TR")}
                        </span>
                        {isOverdue && (
                          <span className="ml-2 text-[9px] bg-red-50 border border-red-100 text-red-600 px-1 py-0.25 rounded font-bold uppercase">
                            Gecikmiş
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ₺{i.amount.toLocaleString("tr-TR")}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleCopyLink(i)}
                            title="Ödeme linkini kopyala"
                            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                          >
                            <Link2 size={13} /> Ödeme Linki
                          </button>
                          {toWhatsAppNumber(i.phone) && (
                            <a
                              href={`https://wa.me/${toWhatsAppNumber(i.phone)}?text=${encodeURIComponent(
                                `Merhaba ${i.tenantName}, ${i.assetName} kiralamanız için ${i.description || "aylık"} ödemenizi aşağıdaki güvenli linkten yapabilirsiniz:\n${origin}/pay/taksit/${i.id}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => createInstallmentPaymentLink(i.id)}
                              title="WhatsApp'tan gönder"
                              className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                            >
                              <MessageCircle size={13} /> WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => handleTogglePaid(i.id, i.paid)}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Ödeme Al (EFT/Cash)
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
