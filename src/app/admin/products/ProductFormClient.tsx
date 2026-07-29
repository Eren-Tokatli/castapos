"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateFullProduct, deleteProduct, type ProductFormData } from "./actions";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  categories: Category[];
  initialData?: ProductFormData;
}

const emptyForm: ProductFormData = {
  name: "",
  sku: "",
  slug: "",
  description: "",
  saleMode: "BUY",
  buyPrice: "",
  buySpecialPrice: "",
  quantity: "0",
  stockStatus: "IN_STOCK",
  status: "ACTIVE",
  categoryIds: [],
  images: [],
  rentalTiers: [],
  options: [],
};

function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductFormClient({ mode, productId, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initialData ?? emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res =
      mode === "create" ? await createProduct(form) : await updateFullProduct(productId!, form);

    if (!res.success) {
      setError(res.error || "Bir hata oluştu.");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!productId) return;
    if (!confirm("Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await deleteProduct(productId);
  };

  const toggleCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {mode === "create" ? "Yeni Ürün Ekle" : "Ürünü Düzenle"}
        </h2>
        <p className="text-slate-500 text-sm">
          {mode === "create" ? "Kataloğa yeni bir cihaz ekleyin." : form.name}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Temel Bilgiler</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ürün Adı</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Slug (URL)</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm({ ...form, slug: e.target.value });
              }}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">SKU</label>
            <input
              type="text"
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Yayın Durumu</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProductFormData["status"] })}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none bg-white"
            >
              <option value="ACTIVE">Yayında / Aktif</option>
              <option value="INACTIVE">Gizli / Pasif</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Açıklama</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
          />
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kategoriler</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    form.categoryIds.includes(c.id)
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Satış Modu & Fiyat</h3>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Satış Modu</label>
          <select
            value={form.saleMode}
            onChange={(e) => setForm({ ...form, saleMode: e.target.value as ProductFormData["saleMode"] })}
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none bg-white"
          >
            <option value="BUY">Sadece Satılık</option>
            <option value="RENT">Sadece Kiralık</option>
            <option value="BOTH">Satılık & Kiralık</option>
          </select>
        </div>

        {form.saleMode !== "RENT" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Normal Satış Fiyatı</label>
              <input
                type="number"
                value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">İndirimli Satış Fiyatı</label>
              <input
                type="number"
                value={form.buySpecialPrice}
                onChange={(e) => setForm({ ...form, buySpecialPrice: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </div>
        )}

        {form.saleMode !== "BUY" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Kiralama Süreleri</label>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    rentalTiers: [...f.rentalTiers, { label: "", durationMonths: "", price: "", originalPrice: "" }],
                  }))
                }
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                + Süre Ekle
              </button>
            </div>
            <div className="space-y-2">
              {form.rentalTiers.map((tier, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center">
                  <input
                    placeholder="Etiket (ör. 3 Ay)"
                    value={tier.label}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        rentalTiers: f.rentalTiers.map((t, idx) => (idx === i ? { ...t, label: e.target.value } : t)),
                      }))
                    }
                    className="h-9 px-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    placeholder="Ay"
                    type="number"
                    value={tier.durationMonths}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        rentalTiers: f.rentalTiers.map((t, idx) => (idx === i ? { ...t, durationMonths: e.target.value } : t)),
                      }))
                    }
                    className="h-9 px-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    placeholder="Fiyat"
                    type="number"
                    value={tier.price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        rentalTiers: f.rentalTiers.map((t, idx) => (idx === i ? { ...t, price: e.target.value } : t)),
                      }))
                    }
                    className="h-9 px-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    placeholder="Eski Fiyat"
                    type="number"
                    value={tier.originalPrice}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        rentalTiers: f.rentalTiers.map((t, idx) => (idx === i ? { ...t, originalPrice: e.target.value } : t)),
                      }))
                    }
                    className="h-9 px-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rentalTiers: f.rentalTiers.filter((_, idx) => idx !== i) }))}
                    className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Stok</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stok Miktarı</label>
            <input
              type="number"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Stok Durumu</label>
            <select
              value={form.stockStatus}
              onChange={(e) => setForm({ ...form, stockStatus: e.target.value as ProductFormData["stockStatus"] })}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none bg-white"
            >
              <option value="IN_STOCK">Stokta Var</option>
              <option value="OUT_OF_STOCK">Tükendi</option>
              <option value="PREORDER">Ön Sipariş</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Görseller</h3>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, images: [...f.images, { url: "", alt: "" }] }))}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            + Görsel Ekle
          </button>
        </div>
        <div className="space-y-2">
          {form.images.map((img, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_auto] gap-2 items-center">
              <input
                placeholder="Görsel URL"
                value={img.url}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    images: f.images.map((im, idx) => (idx === i ? { ...im, url: e.target.value } : im)),
                  }))
                }
                className="h-9 px-2 border border-slate-200 rounded-lg text-xs"
              />
              <input
                placeholder="Alt metin"
                value={img.alt}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    images: f.images.map((im, idx) => (idx === i ? { ...im, alt: e.target.value } : im)),
                  }))
                }
                className="h-9 px-2 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Seçenekler (Renk, Ölçü vb.)</h3>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                options: [...f.options, { name: "", type: "SELECT", required: false, values: [] }],
              }))
            }
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            + Seçenek Ekle
          </button>
        </div>

        <div className="space-y-4">
          {form.options.map((opt, oi) => (
            <div key={oi} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="grid grid-cols-[2fr_1fr_auto_auto] gap-2 items-center">
                <input
                  placeholder="Seçenek adı (ör. Renk)"
                  value={opt.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      options: f.options.map((o, idx) => (idx === oi ? { ...o, name: e.target.value } : o)),
                    }))
                  }
                  className="h-9 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                />
                <select
                  value={opt.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      options: f.options.map((o, idx) => (idx === oi ? { ...o, type: e.target.value as any } : o)),
                    }))
                  }
                  className="h-9 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="SELECT">Seçmeli</option>
                  <option value="RADIO">Tekli (Radio)</option>
                  <option value="CHECKBOX">Çoklu (Checkbox)</option>
                  <option value="TEXT">Metin</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={opt.required}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        options: f.options.map((o, idx) => (idx === oi ? { ...o, required: e.target.checked } : o)),
                      }))
                    }
                  />
                  Zorunlu
                </label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== oi) }))}
                  className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
                >
                  ×
                </button>
              </div>

              <div className="pl-2 border-l-2 border-slate-200 space-y-2">
                {opt.values.map((val, vi) => (
                  <div key={vi} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2 items-center">
                    <input
                      placeholder="Değer (ör. Kırmızı)"
                      value={val.label}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          options: f.options.map((o, idx) =>
                            idx === oi
                              ? { ...o, values: o.values.map((v, vidx) => (vidx === vi ? { ...v, label: e.target.value } : v)) }
                              : o
                          ),
                        }))
                      }
                      className="h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                    <input
                      placeholder="Fiyat farkı"
                      type="number"
                      value={val.priceModifier}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          options: f.options.map((o, idx) =>
                            idx === oi
                              ? {
                                  ...o,
                                  values: o.values.map((v, vidx) => (vidx === vi ? { ...v, priceModifier: e.target.value } : v)),
                                }
                              : o
                          ),
                        }))
                      }
                      className="h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                    <input
                      placeholder="Renk (#fff)"
                      value={val.colorHex}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          options: f.options.map((o, idx) =>
                            idx === oi
                              ? { ...o, values: o.values.map((v, vidx) => (vidx === vi ? { ...v, colorHex: e.target.value } : v)) }
                              : o
                          ),
                        }))
                      }
                      className="h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                    <input
                      placeholder="Görsel URL"
                      value={val.imageUrl}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          options: f.options.map((o, idx) =>
                            idx === oi
                              ? { ...o, values: o.values.map((v, vidx) => (vidx === vi ? { ...v, imageUrl: e.target.value } : v)) }
                              : o
                          ),
                        }))
                      }
                      className="h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          options: f.options.map((o, idx) =>
                            idx === oi ? { ...o, values: o.values.filter((_, vidx) => vidx !== vi) } : o
                          ),
                        }))
                      }
                      className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      options: f.options.map((o, idx) =>
                        idx === oi
                          ? {
                              ...o,
                              values: [...o.values, { label: "", priceModifier: "", priceModifierType: "FIXED", colorHex: "", imageUrl: "" }],
                            }
                          : o
                      ),
                    }))
                  }
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  + Değer Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

      <div className="flex justify-between items-center pb-8">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-semibold transition disabled:opacity-50"
            >
              Ürünü Sil
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : mode === "create" ? "Ürünü Oluştur" : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>
    </form>
  );
}
