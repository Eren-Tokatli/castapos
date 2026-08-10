"use client";

import React, { useState } from "react";
import { Search, Users, ShieldCheck, LifeBuoy, Pencil, Trash2 } from "lucide-react";
import { updateUserRole, deleteUser } from "./actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";
import { useTableControls } from "../_components/useTableControls";
import { SortableTh } from "../_components/SortableTh";
import { Pagination } from "../_components/Pagination";

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

export function UsersClient({ users: initialUsers }: { users: AdminUser[] }) {
  const toast = useAdminToast();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<AdminUser["role"]>("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setEditRole(u.role);
    setError("");
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    setError("");

    const res = await updateUserRole(editing.id, editRole);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Rol güncellenemedi.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, role: editRole } : u)));
    setEditing(null);
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
    toast("Kullanıcı silindi.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kullanıcılar & Müşteriler</h2>
        <p className="text-slate-500 text-sm mt-0.5">Tüm hesapları görüntüle, rol değiştir, gerekirse hesabı sil.</p>
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
                <th className="py-3.5 px-5 text-right">Eylemler</th>
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
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
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
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                          >
                            <Pencil size={12} /> Rol
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
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

      {editing && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRole}
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-bold text-slate-800">Rolü Değiştir</h3>
                <p className="text-xs text-slate-500 mt-0.5">{editing.firstName} {editing.lastName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl font-bold transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Rol</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminUser["role"])}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none bg-white transition"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
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
