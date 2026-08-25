"use client";

import React, { useState } from "react";
import { Plus, Tag, Percent, Wallet, Pencil, Trash2 } from "lucide-react";
import { createCoupon, updateCoupon, deleteCoupon, type CouponFormData } from "./actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";
import { useTableControls } from "../_components/useTableControls";
import { SortableTh } from "../_components/SortableTh";
import { Pagination } from "../_components/Pagination";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  amount: number;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  minCartTotal: number | null;
  usedCount: number;
  totalDiscountGiven: number;
}

const EMPTY_FORM: CouponFormData = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  amount: "",
  active: true,
  expiresAt: "",
  usageLimit: "",
  usageLimitPerUser: "",
  minCartTotal: "",
};

function formatMoney(v: number) {
  return `₺${v.toLocaleString("tr-TR")}`;
}

function couponStatus(c: Coupon): { label: string; className: string } {
  if (!c.active) return { label: "Pasif", className: "bg-slate-100 text-slate-600 border-slate-200" };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
    return { label: "Süresi Doldu", className: "bg-red-50 text-red-700 border-red-200" };
  }
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) {
    return { label: "Limit Doldu", className: "bg-red-50 text-red-700 border-red-200" };
  }
  return { label: "Aktif", className: "bg-green-50 text-green-700 border-green-200" };
}

export function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const toast = useAdminToast();
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const table = useTableControls(coupons, 10);
  const stats = {
    active: coupons.filter((c) => couponStatus(c).label === "Aktif").length,
    totalUses: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    totalDiscount: coupons.reduce((sum, c) => sum + c.totalDiscountGiven, 0),
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setModalMode("create");
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      amount: String(c.amount),
      active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      usageLimitPerUser: c.usageLimitPerUser != null ? String(c.usageLimitPerUser) : "",
      minCartTotal: c.minCartTotal != null ? String(c.minCartTotal) : "",
    });
    setEditingId(c.id);
    setError("");
    setModalMode("edit");
  };

  const closeModal = () => setModalMode(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = editingId ? await updateCoupon(editingId, form) : await createCoupon(form);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "İşlem başarısız oldu.");
      return;
    }
    closeModal();
    toast(editingId ? "Kupon güncellendi." : "Kupon oluşturuldu.");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteCoupon(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.success) {
      setAlertMessage(res.error || "Kupon silinemedi.");
      return;
    }
    toast("Kupon silindi.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kampanyalar</h2>
          <p className="text-slate-500 text-sm mt-0.5">İndirim kuponları oluştur, kullanım limitlerini yönet.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition shrink-0"
        >
          <Plus size={16} strokeWidth={2.75} /> Kupon Ekle
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Aktif Kupon", value: stats.active, icon: Tag, tint: "text-emerald-600 bg-emerald-50" },
          { label: "Toplam Kullanım", value: stats.totalUses, icon: Percent, tint: "text-slate-600 bg-slate-100" },
          { label: "Toplam İndirim Verildi", value: formatMoney(stats.totalDiscount), icon: Wallet, tint: "text-orange-600 bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>
              <s.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-slate-900 leading-none tabular-nums">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1.5 uppercase tracking-wide truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <SortableTh label="Kod" active={table.sortKey === "code"} dir={table.sortDir} onClick={() => table.toggleSort("code")} />
                <th className="py-3.5 px-5">İndirim</th>
                <th className="py-3.5 px-5">Durum</th>
                <SortableTh label="Kullanım" active={table.sortKey === "usedCount"} dir={table.sortDir} onClick={() => table.toggleSort("usedCount")} />
                <th className="py-3.5 px-5">Getirdiği İndirim</th>
                <th className="py-3.5 px-5 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Henüz kupon eklenmemiş.
                  </td>
                </tr>
              ) : (
                table.pageItems.map((c) => {
                  const status = couponStatus(c);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 font-mono block">{c.code}</span>
                        {c.description && <span className="text-[11px] text-slate-400 block">{c.description}</span>}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {c.discountType === "PERCENTAGE" ? `%${c.amount}` : formatMoney(c.amount)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 tabular-nums">
                        {c.usedCount}
                        {c.usageLimit != null && <span className="text-slate-400"> / {c.usageLimit}</span>}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">{formatMoney(c.totalDiscountGiven)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                          >
                            <Pencil size={12} /> Düzenle
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition"
                          >
                            <Trash2 size={12} /> Sil
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
        <Pagination
          page={table.page}
          totalPages={table.totalPages}
          totalCount={table.totalCount}
          pageSize={10}
          onPageChange={table.setPage}
        />
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800">{modalMode === "create" ? "Yeni Kupon" : "Kuponu Düzenle"}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sepette müşterinin gireceği indirim kodunu tanımla.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl font-bold transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kupon Kodu *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="HOSGELDIN10"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-mono focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Açıklama (Sadece Yönetim Panelinde Görünür)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Yeni üyelere hoş geldin kampanyası"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">İndirim Tipi</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENTAGE" | "FIXED" })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none bg-white transition"
                  >
                    <option value="PERCENTAGE">Yüzde (%)</option>
                    <option value="FIXED">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    {form.discountType === "PERCENTAGE" ? "Yüzde *" : "Tutar (₺) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Son Kullanma Tarihi</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Boş = süresiz</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Min. Sepet Tutarı (₺)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minCartTotal}
                    onChange={(e) => setForm({ ...form, minCartTotal: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Boş = şart yok</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Toplam Kullanım Limiti</label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Boş = sınırsız</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kişi Başı Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimitPerUser}
                    onChange={(e) => setForm({ ...form, usageLimitPerUser: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Boş = sınırsız (misafirlerde sayılmaz)</p>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm font-semibold text-slate-700">Aktif — müşteriler bu kodu kullanabilir</span>
              </label>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : modalMode === "create" ? "Kuponu Oluştur" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kuponu Sil"
        message={deleteTarget ? `"${deleteTarget.code}" kuponunu silmek istediğine emin misin? Bu işlem geri alınamaz.` : ""}
        confirmLabel="Evet, Sil"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!alertMessage}
        title="Kupon Silinemedi"
        message={alertMessage || ""}
        danger={false}
        onClose={() => setAlertMessage(null)}
      />
    </div>
  );
}
