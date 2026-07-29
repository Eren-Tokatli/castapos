"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Package, CheckCircle2, XCircle, EyeOff, Pencil, RefreshCcw } from "lucide-react";
import { updateProduct } from "./actions";

interface Product {
  id: string;
  sku: string;
  name: string;
  saleMode: string;
  buyPrice: number | null;
  buySpecialPrice: number | null;
  quantity: number;
  stockStatus: string;
  status: boolean;
  rentalTiers: Array<{
    label: string;
    price: number;
  }>;
}

interface ProductsClientProps {
  products: Product[];
}

const MODE_STYLES: Record<string, { label: string; dot: string; className: string }> = {
  BUY: { label: "Sadece Satılık", dot: "bg-sky-500", className: "bg-sky-50 border-sky-200 text-sky-700" },
  RENT: { label: "Sadece Kiralık", dot: "bg-orange-500", className: "bg-orange-50 border-orange-200 text-orange-700" },
  BOTH: { label: "Satılık & Kiralık", dot: "bg-violet-500", className: "bg-violet-50 border-violet-200 text-violet-700" },
};

const STOCK_STYLES: Record<string, { label: string; dot: string; className: string }> = {
  IN_STOCK: { label: "Stokta Var", dot: "bg-emerald-500", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  OUT_OF_STOCK: { label: "Tükendi", dot: "bg-red-500", className: "bg-red-50 text-red-700 border-red-200" },
  PREORDER: { label: "Ön Sipariş", dot: "bg-amber-500", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function ProductsClient({ products }: ProductsClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    quantity: "0",
    stockStatus: "IN_STOCK",
    buyPrice: "",
    buySpecialPrice: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stockStatus === "IN_STOCK").length,
    outOfStock: products.filter((p) => p.stockStatus === "OUT_OF_STOCK").length,
    hidden: products.filter((p) => !p.status).length,
  };

  const handleEditClick = (p: Product) => {
    setSelectedProduct(p);
    setEditForm({
      quantity: p.quantity.toString(),
      stockStatus: p.stockStatus,
      buyPrice: p.buyPrice ? p.buyPrice.toString() : "",
      buySpecialPrice: p.buySpecialPrice ? p.buySpecialPrice.toString() : "",
      status: p.status ? "ACTIVE" : "INACTIVE",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setLoading(true);
    setError("");

    const res = await updateProduct(selectedProduct.id, editForm);
    if (!res.success) {
      setError(res.error || "Stok güncellenemedi.");
      setLoading(false);
    } else {
      setLoading(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Stok & Ürün Envanteri</h2>
          <p className="text-slate-500 text-sm mt-0.5">Mağazada satışta ve kiralık olan cihazların stok durumunu yönetin.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition shrink-0"
        >
          <Plus size={16} strokeWidth={2.75} /> Ürün Ekle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Ürün", value: stats.total, icon: Package, tint: "text-slate-600 bg-slate-100" },
          { label: "Stokta Var", value: stats.inStock, icon: CheckCircle2, tint: "text-emerald-600 bg-emerald-50" },
          { label: "Tükendi", value: stats.outOfStock, icon: XCircle, tint: "text-red-600 bg-red-50" },
          { label: "Gizli Ürün", value: stats.hidden, icon: EyeOff, tint: "text-slate-500 bg-slate-100" },
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

      {/* List */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5">SKU / Cihaz Adı</th>
                <th className="py-3.5 px-5">Mod</th>
                <th className="py-3.5 px-5">Satış Fiyatı</th>
                <th className="py-3.5 px-5">Kiralama Fiyatı (En Düşük)</th>
                <th className="py-3.5 px-5">Stok Miktarı</th>
                <th className="py-3.5 px-5">Stok Durumu</th>
                <th className="py-3.5 px-5">Yayın Durumu</th>
                <th className="py-3.5 px-5 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((p) => {
                const minRentalPrice = p.rentalTiers.reduce(
                  (min, tier) => (tier.price < min ? tier.price : min),
                  Infinity
                );
                const mode = MODE_STYLES[p.saleMode] ?? MODE_STYLES.BUY;
                const stock = STOCK_STYLES[p.stockStatus] ?? STOCK_STYLES.IN_STOCK;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <Link href={`/admin/products/${p.id}`} className="font-bold text-slate-900 block hover:text-orange-600 transition">
                        {p.name}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 inline-block mt-1">
                        {p.sku}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 border rounded-full w-fit ${mode.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${mode.dot}`} />
                        {mode.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800 tabular-nums">
                      {p.buyPrice ? `₺${p.buyPrice.toLocaleString("tr-TR")}` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800 tabular-nums">
                      {minRentalPrice !== Infinity ? `₺${minRentalPrice.toLocaleString("tr-TR")} / ay` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">{p.quantity} Adet</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${stock.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                        {stock.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          p.status
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-300"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {p.status ? "Yayında" : "Gizli"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                        >
                          <Pencil size={12} /> Düzenle
                        </Link>
                        <button
                          onClick={() => handleEditClick(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold transition"
                        >
                          <RefreshCcw size={12} /> Stok Güncelle
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-bold text-slate-800">Ürün Stoğunu Düzenle</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl font-bold transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stok Miktarı</label>
                <input
                  type="number"
                  required
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stok Durumu</label>
                <select
                  value={editForm.stockStatus}
                  onChange={(e) => setEditForm({ ...editForm, stockStatus: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none bg-white transition"
                >
                  <option value="IN_STOCK">Stokta Var</option>
                  <option value="OUT_OF_STOCK">Tükendi</option>
                  <option value="PREORDER">Ön Sipariş</option>
                </select>
              </div>

              {selectedProduct.saleMode !== "RENT" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Normal Satış Fiyatı</label>
                    <input
                      type="number"
                      value={editForm.buyPrice}
                      onChange={(e) => setEditForm({ ...editForm, buyPrice: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">İndirimli Satış Fiyatı</label>
                    <input
                      type="number"
                      value={editForm.buySpecialPrice}
                      onChange={(e) => setEditForm({ ...editForm, buySpecialPrice: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Yayın Durumu</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none bg-white transition"
                >
                  <option value="ACTIVE">Yayında / Aktif</option>
                  <option value="INACTIVE">Gizli / Pasif</option>
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
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Stoku Güncelle"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
