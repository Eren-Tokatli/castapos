"use client";

import React, { useState } from "react";
import { Search, Users, ShieldCheck, LifeBuoy, Trash2, X, Mail, Phone, Calendar, ShoppingBag, Package, ChevronRight, Sparkles } from "lucide-react";
import { updateUserRole, deleteUser } from "./actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";
import { useTableControls } from "../_components/useTableControls";
import { SortableTh } from "../_components/SortableTh";
import { Pagination } from "../_components/Pagination";

interface RecentOrder {
  orderNumber: string;
  createdAt: string;
  status: "PENDING_PAYMENT" | "PROCESSING" | "PAID" | "CANCELLED" | "REFUNDED";
  total: number;
  itemCount: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "ADMIN" | "CUSTOMER" | "SUPPORT" | "SELLER";
  createdAt: string;
  orderCount: number;
  ticketCount: number;
  isPremiumMember: boolean;
  totalSpent: number;
  itemsPurchased: number;
  recentOrders: RecentOrder[];
}

// SELLER, mevcut eski hesapları düzgün göstermek için burada duruyor ama
// aşağıdaki listelerden (filtre + atanabilir rol) kasıtlı olarak çıkarıldı:
// Castapos'ta satıcı doğrudan işletmenin kendisi, bu rolü kimseye atamaya gerek yok.
const ROLE_META: Record<string, { label: string; className: string }> = {
  ADMIN: { label: "Yönetici", className: "bg-purple-50 text-purple-700 border-purple-200" },
  CUSTOMER: { label: "Müşteri", className: "bg-blue-50 text-blue-700 border-blue-200" },
  SUPPORT: { label: "Destek", className: "bg-amber-50 text-amber-700 border-amber-200" },
  SELLER: { label: "Satıcı", className: "bg-teal-50 text-teal-700 border-teal-200" },
};

const ORDER_STATUS_META: Record<RecentOrder["status"], { label: string; className: string }> = {
  PENDING_PAYMENT: { label: "Ödeme Bekliyor", className: "bg-slate-100 text-slate-600" },
  PROCESSING: { label: "İşleniyor", className: "bg-blue-50 text-blue-700" },
  PAID: { label: "Ödendi", className: "bg-green-50 text-green-700" },
  CANCELLED: { label: "İptal", className: "bg-red-50 text-red-700" },
  REFUNDED: { label: "İade", className: "bg-orange-50 text-orange-700" },
};

const ROLE_FILTERS = [
  { value: "ALL", label: "Tümü" },
  { value: "CUSTOMER", label: "Müşteri" },
  { value: "SUPPORT", label: "Destek" },
  { value: "ADMIN", label: "Yönetici" },
];

const ASSIGNABLE_ROLES: { value: AdminUser["role"]; label: string }[] = [
  { value: "CUSTOMER", label: "Müşteri" },
  { value: "SUPPORT", label: "Destek" },
  { value: "ADMIN", label: "Yönetici" },
];

function formatMoney(v: number) {
  return new Intl.NumberFormat("tr-TR").format(Math.round(v)) + " TL";
}

export function UsersClient({ users: initialUsers }: { users: AdminUser[] }) {
  const toast = useAdminToast();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const stats = {
    total: users.length,
    customers: users.filter((u) => u.role === "CUSTOMER").length,
    support: users.filter((u) => u.role === "SUPPORT").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  const filtered = users.filter((u) => {
    const term = search.toLocaleLowerCase("tr-TR");
    const matchesSearch =
      !term ||
      `${u.firstName} ${u.lastName}`.toLocaleLowerCase("tr-TR").includes(term) ||
      u.email.toLocaleLowerCase("tr-TR").includes(term);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const table = useTableControls(filtered, 10);

  const handleRoleChange = async (role: AdminUser["role"]) => {
    if (!selected) return;
    setRoleSaving(true);
    const res = await updateUserRole(selected.id, role);
    setRoleSaving(false);

    if (!res.success) {
      setAlertMessage(res.error || "Rol güncellenemedi.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === selected.id ? { ...u, role } : u)));
    setSelected((prev) => (prev ? { ...prev, role } : prev));
    toast("Rol güncellendi.");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteUser(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.success) {
      setAlertMessage(res.error || "Kullanıcı silinemedi.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    if (selected?.id === deleteTarget.id) setSelected(null);
    toast("Kullanıcı silindi.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kullanıcılar & Müşteriler</h2>
        <p className="text-slate-500 text-sm mt-0.5">Bir kullanıcıya tıklayarak sipariş geçmişini ve hesap detaylarını gör.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Hesap", value: stats.total, icon: Users, tint: "text-slate-600 bg-slate-100" },
          { label: "Müşteri", value: stats.customers, icon: Users, tint: "text-blue-600 bg-blue-50" },
          { label: "Destek Ekibi", value: stats.support, icon: LifeBuoy, tint: "text-amber-600 bg-amber-50" },
          { label: "Yönetici", value: stats.admins, icon: ShieldCheck, tint: "text-purple-600 bg-purple-50" },
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
            placeholder="İsim veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                roleFilter === f.value
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <SortableTh label="Kullanıcı" active={table.sortKey === "firstName"} dir={table.sortDir} onClick={() => table.toggleSort("firstName")} />
                <th className="py-3.5 px-5">Rol</th>
                <SortableTh label="Sipariş" active={table.sortKey === "orderCount"} dir={table.sortDir} onClick={() => table.toggleSort("orderCount")} />
                <SortableTh label="Talep" active={table.sortKey === "ticketCount"} dir={table.sortDir} onClick={() => table.toggleSort("ticketCount")} />
                <SortableTh label="Kayıt Tarihi" active={table.sortKey === "createdAt"} dir={table.sortDir} onClick={() => table.toggleSort("createdAt")} />
                <th className="py-3.5 px-5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Kriterlere uyan kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                table.pageItems.map((u) => {
                  const role = ROLE_META[u.role];
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelected(u)}
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${selected?.id === u.id ? "bg-orange-50/60" : ""}`}
                    >
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block">{u.firstName} {u.lastName}</span>
                        <span className="text-[11px] text-slate-400 block">{u.email}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${role.className}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">{u.orderCount}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">{u.ticketCount}</td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-3.5 px-5 text-slate-300">
                        <ChevronRight size={16} />
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

      {/* KULLANICI DETAY PANELİ (satıra tıklayınca sağdan açılır) */}
      {selected && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-50 flex justify-end"
          onClick={() => setSelected(null)}
        >
          <aside
            className="w-full max-w-sm h-full bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-800">Kullanıcı Bilgileri</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Kimlik */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {selected.firstName[0]}{selected.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{selected.firstName} {selected.lastName}</p>
                  <p className="text-xs text-slate-400 truncate">{selected.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${ROLE_META[selected.role].className}`}>
                  {ROLE_META[selected.role].label}
                </span>
                {selected.isPremiumMember && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold bg-amber-50 text-amber-700 border-amber-200">
                    <Sparkles size={11} /> Premium
                  </span>
                )}
              </div>

              {/* İstatistikler */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-3">
                  <ShoppingBag size={16} className="mx-auto text-slate-400 mb-1" />
                  <p className="font-extrabold text-slate-900 tabular-nums">{selected.orderCount}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Sipariş</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <Package size={16} className="mx-auto text-slate-400 mb-1" />
                  <p className="font-extrabold text-slate-900 tabular-nums">{selected.itemsPurchased}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Ürün Aldı</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <LifeBuoy size={16} className="mx-auto text-slate-400 mb-1" />
                  <p className="font-extrabold text-slate-900 tabular-nums">{selected.ticketCount}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Destek</p>
                </div>
              </div>

              {/* İletişim */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">İletişim</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{selected.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{selected.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>{new Date(selected.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} tarihinde katıldı</span>
                  </div>
                </div>
              </div>

              {/* Toplam harcama */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Toplam Harcama (ödenen siparişler)</p>
                <p className="text-2xl font-extrabold mt-1">{formatMoney(selected.totalSpent)}</p>
              </div>

              {/* Son siparişler */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Son Siparişler</h4>
                {selected.recentOrders.length === 0 ? (
                  <p className="text-sm text-slate-400">Henüz sipariş yok.</p>
                ) : (
                  <div className="space-y-2">
                    {selected.recentOrders.map((o) => {
                      const meta = ORDER_STATUS_META[o.status];
                      return (
                        <div key={o.orderNumber} className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{o.orderNumber}</p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString("tr-TR")} · {o.itemCount} ürün
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="text-xs font-bold text-slate-900">{formatMoney(o.total)}</p>
                            <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${meta.className}`}>
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* İşlemler */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">İşlemler</h4>
                <label className="block text-xs font-bold text-slate-500 mb-1">Rol Değiştir</label>
                <select
                  value={selected.role}
                  disabled={roleSaving}
                  onChange={(e) => handleRoleChange(e.target.value as AdminUser["role"])}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none bg-white transition mb-3 disabled:opacity-50"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setDeleteTarget(selected)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition"
                >
                  <Trash2 size={13} /> Kullanıcıyı Sil
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kullanıcıyı Sil"
        message={
          deleteTarget
            ? `${deleteTarget.firstName} ${deleteTarget.lastName} hesabını kalıcı olarak silmek istediğine emin misin?\n\nAdresleri, favorileri, destek talepleri ve değerlendirmeleri de birlikte silinir. Siparişleri (finansal kayıt olarak) korunur. Bu işlem geri alınamaz.`
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
