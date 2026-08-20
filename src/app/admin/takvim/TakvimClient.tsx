"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Link2, MessageCircle, CheckCircle2 } from "lucide-react";
import { toggleInstallmentPaid, createInstallmentPaymentLink } from "../agreements/actions";
import { useAdminToast } from "../_components/ToastProvider";

interface CalendarInstallment {
  id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  description: string | null;
  tenantName: string;
  assetName: string;
  phone: string;
}

const WEEKDAYS = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return null;
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return "90" + digits.slice(1);
  return "90" + digits;
}

function statusOf(inst: CalendarInstallment): "paid" | "overdue" | "upcoming" {
  if (inst.paid) return "paid";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(inst.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today ? "overdue" : "upcoming";
}

const STATUS_STYLE: Record<string, { chip: string; label: string; dot: string }> = {
  paid: { chip: "bg-emerald-50 border-emerald-200 text-emerald-800", label: "Ödendi", dot: "bg-emerald-500" },
  overdue: { chip: "bg-red-50 border-red-200 text-red-800", label: "Gecikmiş", dot: "bg-red-500" },
  upcoming: { chip: "bg-orange-50 border-orange-300 text-orange-800", label: "Bekliyor", dot: "bg-orange-600" },
};

export function TakvimClient({ installments }: { installments: CalendarInstallment[] }) {
  const toast = useAdminToast();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<CalendarInstallment | null>(null);
  const [items, setItems] = useState(installments);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarInstallment[]>();
    for (const inst of items) {
      const d = new Date(inst.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inst);
    }
    return map;
  }, [items]);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Pazar
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

  const handleTogglePaid = async (inst: CalendarInstallment) => {
    const res = await toggleInstallmentPaid(inst.id, !inst.paid);
    if (res.success) {
      setItems((prev) => prev.map((i) => (i.id === inst.id ? { ...i, paid: !inst.paid } : i)));
      setSelected((prev) => (prev ? { ...prev, paid: !inst.paid } : prev));
      toast(!inst.paid ? "Ödeme alındı olarak işaretlendi." : "Ödeme durumu geri alındı.");
    }
  };

  const handleCopyLink = async (inst: CalendarInstallment) => {
    const link = `${window.location.origin}/pay/taksit/${inst.id}`;
    await createInstallmentPaymentLink(inst.id);
    try {
      await navigator.clipboard.writeText(link);
      toast("Ödeme linki kopyalandı ve Ödeme Kayıtları'na eklendi.");
    } catch {
      toast(`Link kopyalanamadı, elle kopyala: ${link}`);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ödeme Takvimi</h2>
        <p className="text-slate-500 text-sm">Vadesi gelen, geciken ve ödenen tüm taksitlerin aylık takvim görünümü.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-lg font-bold text-slate-800 min-w-[160px] text-center">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 transition text-slate-600"
          >
            Bugün
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Gecikmiş</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" /> Bekliyor</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Ödendi</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {WEEKDAYS.map((w) => (
            <div key={w} className="p-3 text-center text-xs font-bold text-slate-500 uppercase">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((date, idx) => {
            const key = date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : `empty-${idx}`;
            const dayItems = date ? byDay.get(key) || [] : [];
            return (
              <div
                key={key}
                className={`min-h-[110px] border-b border-r border-slate-100 p-2 ${date ? "" : "bg-slate-50/40"}`}
              >
                {date && (
                  <>
                    <span
                      className={`inline-flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full mb-1.5 ${
                        isToday(date) ? "bg-orange-500 text-white" : "text-slate-600"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    <div className="space-y-1">
                      {dayItems.map((inst) => {
                        const style = STATUS_STYLE[statusOf(inst)];
                        return (
                          <button
                            key={inst.id}
                            onClick={() => setSelected(inst)}
                            className={`w-full text-left px-1.5 py-1 rounded-md border text-[10px] leading-tight font-semibold transition hover:opacity-80 ${style.chip}`}
                          >
                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                              <span className="truncate">₺{inst.amount.toLocaleString("tr-TR")}</span>
                            </div>
                            <div className="truncate opacity-80">{inst.tenantName}</div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border mb-2 ${STATUS_STYLE[statusOf(selected)].chip}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[statusOf(selected)].dot}`} />
                  {STATUS_STYLE[statusOf(selected)].label}
                </span>
                <h3 className="font-bold text-slate-900 text-lg">{selected.tenantName}</h3>
                <p className="text-sm text-slate-500">{selected.assetName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Taksit</span>
                <span className="font-semibold text-slate-800">{selected.description || "Aylık Taksit"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Vade Tarihi</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selected.dueDate).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-slate-500 text-sm">Tutar</span>
                <span className="font-black text-slate-900 text-2xl">₺{selected.amount.toLocaleString("tr-TR")}</span>
              </div>

              {!selected.paid && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleCopyLink(selected)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition inline-flex items-center justify-center gap-1"
                  >
                    <Link2 size={13} /> Ödeme Linki
                  </button>
                  {toWhatsAppNumber(selected.phone) && (
                    <a
                      href={`https://wa.me/${toWhatsAppNumber(selected.phone)}?text=${encodeURIComponent(
                        `Merhaba ${selected.tenantName}, ${selected.assetName} kiralamanız için ${selected.description || "aylık"} ödemenizi aşağıdaki güvenli linkten yapabilirsiniz:\n${origin}/pay/taksit/${selected.id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => createInstallmentPaymentLink(selected.id)}
                      className="flex-1 px-3 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition inline-flex items-center justify-center gap-1"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  )}
                </div>
              )}

              <button
                onClick={() => handleTogglePaid(selected)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-bold transition inline-flex items-center justify-center gap-2 ${
                  selected.paid
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                <CheckCircle2 size={16} />
                {selected.paid ? "Ödeme Durumunu Geri Al" : "Ödeme Al (EFT/Cash)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
