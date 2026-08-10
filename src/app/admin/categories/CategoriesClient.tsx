"use client";

import React, { useState } from "react";
import { Plus, FolderTree, Pencil, Trash2, Package } from "lucide-react";
import { createCategory, updateCategory, deleteCategory, type CategoryFormData } from "./actions";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";
import { ImagePreviewThumb } from "../_components/ImagePreviewThumb";
import { useTableControls } from "../_components/useTableControls";
import { SortableTh } from "../_components/SortableTh";
import { Pagination } from "../_components/Pagination";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
  imageUrl: string | null;
  productCount: number;
}

const EMPTY_FORM: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  sortOrder: "0",
  imageUrl: "",
};

function slugify(input: string) {
  const trMap: Record<string, string> = { ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u" };
  return input
    .split("")
    .map((ch) => trMap[ch] ?? ch)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const toast = useAdminToast();
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const table = useTableControls(categories, 10);
  const stats = {
    total: categories.length,
    withProducts: categories.filter((c) => c.productCount > 0).length,
    empty: categories.filter((c) => c.productCount === 0).length,
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setEditingId(null);
    setError("");
    setModalMode("create");
  };

  const openEdit = (c: Category) => {
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      parentId: c.parentId || "",
      sortOrder: String(c.sortOrder),
      imageUrl: c.imageUrl || "",
    });
    setSlugTouched(true);
    setEditingId(c.id);
    setError("");
    setModalMode("edit");
  };

  const closeModal = () => setModalMode(null);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = editingId ? await updateCategory(editingId, form) : await createCategory(form);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "İşlem başarısız oldu.");
      return;
    }
    closeModal();
    toast(editingId ? "Kategori güncellendi." : "Kategori oluşturuldu.");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    if (!res.success) {
      setAlertMessage(res.error || "Kategori silinemedi.");
      return;
    }
    toast("Kategori silindi.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kategoriler</h2>
          <p className="text-slate-500 text-sm mt-0.5">Ürünlerin bağlı olduğu kategorileri buradan oluştur ve düzenle.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition shrink-0"
        >
          <Plus size={16} strokeWidth={2.75} /> Kategori Ekle
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Toplam Kategori", value: stats.total, icon: FolderTree, tint: "text-slate-600 bg-slate-100" },
          { label: "Ürünü Olan", value: stats.withProducts, icon: Package, tint: "text-emerald-600 bg-emerald-50" },
          { label: "Boş Kategori", value: stats.empty, icon: FolderTree, tint: "text-orange-600 bg-orange-50" },
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
                <SortableTh label="Kategori" active={table.sortKey === "name"} dir={table.sortDir} onClick={() => table.toggleSort("name")} />
                <th className="py-3.5 px-5">Üst Kategori</th>
                <SortableTh label="Ürün Sayısı" active={table.sortKey === "productCount"} dir={table.sortDir} onClick={() => table.toggleSort("productCount")} />
                <SortableTh label="Sıra" active={table.sortKey === "sortOrder"} dir={table.sortDir} onClick={() => table.toggleSort("sortOrder")} />
                <th className="py-3.5 px-5 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Henüz kategori eklenmemiş.
                  </td>
                </tr>
              ) : (
                table.pageItems.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0" />
                        ) : (
                          <span className="w-9 h-9 rounded-lg bg-slate-100 grid place-items-center text-slate-400 shrink-0">
                            <FolderTree size={16} />
                          </span>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block">{c.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{c.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {c.parentId ? categoryById.get(c.parentId)?.name || <span className="text-slate-300">—</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">{c.productCount}</td>
                    <td className="py-3.5 px-5 tabular-nums text-slate-500">{c.sortOrder}</td>
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
                ))
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
                <h3 className="font-bold text-slate-800">{modalMode === "create" ? "Yeni Kategori" : "Kategoriyi Düzenle"}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ürünlerin gruplanacağı kategori bilgilerini gir.</p>
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
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm({ ...form, slug: e.target.value });
                  }}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm font-mono focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Açıklama</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Üst Kategori</label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none bg-white transition"
                  >
                    <option value="">Yok (Kök kategori)</option>
                    {categories
                      .filter((c) => c.id !== editingId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sıra</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Görsel URL (İsteğe Bağlı)</label>
                <div className="flex items-center gap-2">
                  <ImagePreviewThumb url={form.imageUrl} />
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                  />
                </div>
              </div>

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
                {loading ? "Kaydediliyor..." : modalMode === "create" ? "Kategoriyi Oluştur" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kategoriyi Sil"
        message={deleteTarget ? `"${deleteTarget.name}" kategorisini silmek istediğine emin misin? Bu işlem geri alınamaz.` : ""}
        confirmLabel="Evet, Sil"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!alertMessage}
        title="Kategori Silinemedi"
        message={alertMessage || ""}
        danger={false}
        onClose={() => setAlertMessage(null)}
      />
    </div>
  );
}
