"use client";

import React, { useState } from "react";
import { Search, Star, MessageSquareText, Clock, Check, X, TrendingDown, Trash2 } from "lucide-react";
import { deleteReview, approveReview, rejectReview } from "./actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";
import { useTableControls } from "../_components/useTableControls";
import { SortableTh } from "../_components/SortableTh";
import { Pagination } from "../_components/Pagination";
import { ImagePreviewThumb } from "../_components/ImagePreviewThumb";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AdminReview {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  productImage: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

const STATUS_META: Record<ReviewStatus, { label: string; className: string }> = {
  PENDING: { label: "Onay Bekliyor", className: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Yayında", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Reddedildi", className: "bg-red-50 text-red-700 border-red-200" },
};

const STATUS_FILTERS = [
  { value: "PENDING", label: "Onay Bekliyor" },
  { value: "APPROVED", label: "Yayında" },
  { value: "REJECTED", label: "Reddedildi" },
  { value: "ALL", label: "Tümü" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5 yıldız`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
        />
      ))}
    </div>
  );
}

export function ReviewsClient({ reviews: initialReviews }: { reviews: AdminReview[] }) {
  const toast = useAdminToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  // Panele girince önce onay bekleyenler görünsün — asıl yapılacak iş bu.
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">("PENDING");
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "PENDING").length,
    average: reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—",
    low: reviews.filter((r) => r.rating <= 2).length,
  };

  const filtered = reviews.filter((r) => {
    const term = search.toLocaleLowerCase("tr-TR");
    const matchesSearch =
      !term ||
      r.userName.toLocaleLowerCase("tr-TR").includes(term) ||
      r.userEmail.toLocaleLowerCase("tr-TR").includes(term) ||
      r.productName.toLocaleLowerCase("tr-TR").includes(term) ||
      r.comment.toLocaleLowerCase("tr-TR").includes(term);
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const table = useTableControls(filtered, 10);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteReview(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.success) {
      setAlertMessage(res.error || "Değerlendirme silinemedi.");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast("Değerlendirme silindi.");
  };

  const handleStatusChange = async (review: AdminReview, next: "APPROVED" | "REJECTED") => {
    setBusyId(review.id);
    const res = next === "APPROVED" ? await approveReview(review.id) : await rejectReview(review.id);
    setBusyId(null);
    if (!res.success) {
      setAlertMessage(res.error || "Durum güncellenemedi.");
      return;
    }
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: next } : r)));
    toast(next === "APPROVED" ? "Değerlendirme onaylandı, sitede yayında." : "Değerlendirme reddedildi.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Değerlendirmeler</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Yeni değerlendirmeler onaylanmadan sitede görünmez. Önce onay bekleyenleri incele.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Onay Bekliyor", value: stats.pending, icon: Clock, tint: "text-amber-600 bg-amber-50" },
          { label: "Toplam Değerlendirme", value: stats.total, icon: MessageSquareText, tint: "text-slate-600 bg-slate-100" },
          { label: "Ortalama Puan", value: stats.average, icon: Star, tint: "text-amber-600 bg-amber-50" },
          { label: "Düşük Puanlı (≤2)", value: stats.low, icon: TrendingDown, tint: "text-red-600 bg-red-50" },
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

      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Kullanıcı, ürün veya yorum ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value as ReviewStatus | "ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                statusFilter === f.value
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
              {f.value === "PENDING" && stats.pending > 0 && (
                <span className={`ml-1.5 ${statusFilter === f.value ? "text-amber-300" : "text-amber-500"}`}>
                  · {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5">Ürün</th>
                <SortableTh label="Kullanıcı" active={table.sortKey === "userName"} dir={table.sortDir} onClick={() => table.toggleSort("userName")} />
                <SortableTh label="Puan" active={table.sortKey === "rating"} dir={table.sortDir} onClick={() => table.toggleSort("rating")} />
                <th className="py-3.5 px-5">Yorum</th>
                <th className="py-3.5 px-5">Durum</th>
                <SortableTh label="Tarih" active={table.sortKey === "createdAt"} dir={table.sortDir} onClick={() => table.toggleSort("createdAt")} />
                <th className="py-3.5 px-5 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Kriterlere uyan değerlendirme bulunamadı.
                  </td>
                </tr>
              ) : (
                table.pageItems.map((r) => {
                  const busy = busyId === r.id;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ImagePreviewThumb url={r.productImage || ""} size={36} />
                          <span className="font-bold text-slate-900 truncate max-w-[160px]">{r.productName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800 block">{r.userName}</span>
                        <span className="text-[11px] text-slate-400 block">{r.userEmail}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Stars rating={r.rating} />
                      </td>
                      <td className="py-3.5 px-5 max-w-xs">
                        <p className="text-slate-600 line-clamp-2">{r.comment}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${STATUS_META[r.status].className}`}>
                          {STATUS_META[r.status].label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== "APPROVED" && (
                            <button
                              onClick={() => handleStatusChange(r, "APPROVED")}
                              disabled={busy}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition disabled:opacity-40"
                              aria-label="Onayla"
                              title="Onayla"
                            >
                              <Check size={15} />
                            </button>
                          )}
                          {r.status !== "REJECTED" && (
                            <button
                              onClick={() => handleStatusChange(r, "REJECTED")}
                              disabled={busy}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition disabled:opacity-40"
                              aria-label="Reddet"
                              title="Reddet"
                            >
                              <X size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            aria-label="Değerlendirmeyi sil"
                            title="Sil"
                          >
                            <Trash2 size={15} />
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Değerlendirmeyi Sil"
        message={
          deleteTarget
            ? `${deleteTarget.userName} tarafından "${deleteTarget.productName}" ürününe bırakılan değerlendirmeyi kalıcı olarak silmek istediğine emin misin?\n\nBu işlem geri alınamaz.`
            : ""
        }
        confirmLabel="Evet, Sil"
        onConfirm={confirmDelete}
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
