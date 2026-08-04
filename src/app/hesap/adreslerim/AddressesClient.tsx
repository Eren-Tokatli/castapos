"use client";

import React, { useState } from "react";
import { MapPin, Plus, Check, Trash2, Home, X } from "lucide-react";
import { addAddress, deleteAddress, setDefaultAddress } from "./actions";

interface Address {
  firstName: string;
  lastName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postcode: string;
  province?: string | null;
  country: string;
  isDefault: boolean;
}

export function AddressesClient({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await addAddress({
      firstName,
      lastName,
      company: company || undefined,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      postcode,
      province: province || undefined,
      country,
      isDefault,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Adres kaydedilirken bir hata oluştu.");
      return;
    }

    // Reset fields & close
    setFirstName("");
    setLastName("");
    setCompany("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setPostcode("");
    setProvince("");
    setCountry("Türkiye");
    setIsDefault(false);
    setShowAddForm(false);

    // Refresh page state
    window.location.reload();
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    const res = await deleteAddress(index);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleSetDefault = async (index: number) => {
    const res = await setDefaultAddress(index);
    if (res.success) {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Address Trigger Header */}
      <div className="flex justify-end">
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="premium-btn"
          >
            <Plus size={16} /> Yeni Adres Ekle
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT/MAIN AREA: Address Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div className="premium-surface p-8 text-center text-slate-400 col-span-2">
              <MapPin size={48} className="mx-auto opacity-20 mb-3" />
              Kayıtlı teslimat adresiniz bulunmuyor.
            </div>
          ) : (
            addresses.map((addr, idx) => (
              <div
                key={idx}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between min-h-[190px] transition ${
                  addr.isDefault ? "border-[var(--brand)] shadow-[0_0_0_3px_rgba(243,95,54,0.12)]" : "border-slate-200 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                      <Home size={14} className="text-slate-400" /> Teslimat Adresi
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-[var(--brand-dark)] bg-[#fff1ec] px-2 py-0.5 rounded-full border border-[#ffd6c8] flex items-center gap-1">
                        <Check size={10} /> Varsayılan
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-800">
                    {addr.firstName} {addr.lastName}
                  </p>
                  {addr.company && <p className="text-xs font-semibold text-slate-400 mt-0.5">{addr.company}</p>}

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    {addr.postcode} / {addr.city} / {addr.country}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-xs">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(idx)}
                      className="text-[var(--gold-dark)] hover:text-[var(--navy)] font-bold hover:underline"
                    >
                      Varsayılan Yap
                    </button>
                  ) : (
                    <span className="text-[var(--gold-dark)] font-bold">Birincil Adres</span>
                  )}

                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition"
                    title="Adresi Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT AREA: Form to Add Address */}
        {showAddForm && (
          <div className="premium-surface p-6 space-y-4 lg:col-span-1">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Yeni Adres Bilgisi</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">{error}</div>}

            <form onSubmit={handleCreateAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ad *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Soyad *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Şirket Adı (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Adres Satırı 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="Mahalle, sokak, daire no..."
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Adres Satırı 2 (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="Apartman adı, blok..."
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">İlçe / Şehir *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Beşiktaş / İstanbul"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Posta Kodu *</label>
                  <input
                    type="text"
                    required
                    placeholder="34357"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Semt / Eyalet</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ülke</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-9 px-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-200 text-[var(--gold-dark)] focus:ring-[var(--gold)] w-4 h-4"
                />
                <label htmlFor="defaultCheck" className="text-slate-500 font-bold cursor-pointer">
                  Varsayılan Teslimat Adresi Yap
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-btn"
                >
                  {loading ? "Kaydediliyor..." : "Adresi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
