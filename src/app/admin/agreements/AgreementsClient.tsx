"use client";

import React, { useState } from "react";
import { CalendarClock, Pencil, Check, Search } from "lucide-react";
import {
  createAgreement,
  updateAgreement,
  deleteAgreement,
  toggleInstallmentPaid,
} from "./actions";

interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  description: string | null;
}

interface Agreement {
  id: string;
  assetName: string;
  assetSku: string | null;
  tenantName: string;
  taxOrNationalId: string;
  rentalTermMonths: number | null;
  monthlyAmount: number;
  rentalStart: string | null;
  rentalEnd: string | null;
  deliveryStatus: string;
  paymentStatus: string;
  serialNumber: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  paymentDueDay: number | null;
  installments?: Installment[];
}

interface AgreementsClientProps {
  agreements: Agreement[];
}

export function AgreementsClient({ agreements }: AgreementsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModal, setActiveModal] = useState<"create" | "edit" | "installments" | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create Form State
  const [createForm, setCreateForm] = useState({
    tenantName: "",
    taxOrNationalId: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    assetName: "",
    assetSku: "",
    rentalTermMonths: "3",
    monthlyAmount: "",
    rentalStart: new Date().toISOString().split("T")[0],
    serialNumber: "",
    deliveryStatus: "PENDING",
    paymentDueDay: "5",
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    tenantName: "",
    taxOrNationalId: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    assetName: "",
    assetSku: "",
    serialNumber: "",
    deliveryStatus: "PENDING",
    paymentStatus: "CURRENT",
    notes: "",
  });

  const filteredAgreements = agreements.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.tenantName.toLowerCase().includes(term) ||
      a.assetName.toLowerCase().includes(term) ||
      a.taxOrNationalId.includes(term) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(term))
    );
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await createAgreement(createForm);
    if (!res.success) {
      setError(res.error || "Sözleşme oluşturulamadı.");
      setLoading(false);
    } else {
      setLoading(false);
      setActiveModal(null);
      // Reset form
      setCreateForm({
        tenantName: "",
        taxOrNationalId: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        assetName: "",
        assetSku: "",
        rentalTermMonths: "3",
        monthlyAmount: "",
        rentalStart: new Date().toISOString().split("T")[0],
        serialNumber: "",
        deliveryStatus: "PENDING",
        paymentDueDay: "5",
      });
    }
  };

  const handleEditClick = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setEditForm({
      tenantName: agreement.tenantName,
      taxOrNationalId: agreement.taxOrNationalId,
      phone: agreement.phone,
      email: agreement.email || "",
      address: agreement.address || "",
      city: agreement.city || "",
      assetName: agreement.assetName,
      assetSku: agreement.assetSku || "",
      serialNumber: agreement.serialNumber || "",
      deliveryStatus: agreement.deliveryStatus,
      paymentStatus: agreement.paymentStatus,
      notes: agreement.notes || "",
    });
    setActiveModal("edit");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreement) return;
    setLoading(true);
    setError("");

    const res = await updateAgreement(selectedAgreement.id, editForm);
    if (!res.success) {
      setError(res.error || "Güncelleme yapılamadı.");
      setLoading(false);
    } else {
      setLoading(false);
      setActiveModal(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu sözleşmeyi ve tüm taksitlerini silmek istediğinize emin misiniz?")) return;
    const res = await deleteAgreement(id);
    if (!res.success) {
      alert(res.error || "Silme işlemi başarısız.");
    }
  };

  const handleInstallmentsClick = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setActiveModal("installments");
  };

  const handleToggleInstallment = async (instId: string, currentPaid: boolean) => {
    const res = await toggleInstallmentPaid(instId, !currentPaid);
    if (res.success && selectedAgreement) {
      // Update selected agreement installments state locally to reflect instantaneous toggle
      const updatedInsts = selectedAgreement.installments?.map((inst) =>
        inst.id === instId ? { ...inst, paid: !currentPaid } : inst
      );
      setSelectedAgreement({
        ...selectedAgreement,
        installments: updatedInsts,
      });
    } else {
      alert("Durum güncellenemedi.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kiralama Sözleşmeleri</h2>
          <p className="text-slate-500 text-sm">Tüm aktif kiralama sözleşmelerinizi yönetin ve ekleyin.</p>
        </div>
        <button
          onClick={() => setActiveModal("create")}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition text-sm shadow-sm"
        >
          + Yeni Sözleşme Ekle
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm flex items-center">
        <Search size={17} className="text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Müşteri adı, cihaz adı, T.C. numarası veya seri no ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-slate-800 placeholder-slate-400 outline-none text-sm bg-transparent"
        />
      </div>

      {/* Table List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase">
                <th className="p-4">Müşteri Detay</th>
                <th className="p-4">Kiralık Cihaz</th>
                <th className="p-4">Term / Aylık Tutar</th>
                <th className="p-4">Ödeme Durumu</th>
                <th className="p-4">Teslimat</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAgreements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Sözleşme bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAgreements.map((a) => {
                  const statusColors: Record<string, string> = {
                    CURRENT: "bg-green-50 text-green-700 border-green-200",
                    LATE: "bg-red-50 text-red-700 border-red-200",
                    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
                  };

                  const deliveryColors: Record<string, string> = {
                    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
                    DELIVERED: "bg-green-50 text-green-700 border-green-200",
                    RETURNED: "bg-gray-100 text-gray-600 border-gray-300",
                  };

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <b className="text-slate-900 block font-semibold">{a.tenantName}</b>
                        <span className="text-xs text-slate-500 block">T.C: {a.taxOrNationalId}</span>
                        <span className="text-[10px] text-slate-400 block">{a.phone}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-800 font-semibold block">{a.assetName}</span>
                        {a.serialNumber && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                            S/N: {a.serialNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-slate-900 font-bold block">
                          ₺{a.monthlyAmount.toLocaleString("tr-TR")} / ay
                        </span>
                        <span className="text-xs text-slate-500 block">{a.rentalTermMonths} Ay Süre</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                            statusColors[a.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {a.paymentStatus === "CURRENT"
                            ? "Ödeniyor"
                            : a.paymentStatus === "LATE"
                            ? "Gecikmede"
                            : "Tamamlandı"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${
                            deliveryColors[a.deliveryStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {a.deliveryStatus === "PENDING"
                            ? "Beklemede"
                            : a.deliveryStatus === "DELIVERED"
                            ? "Teslim Edildi"
                            : "İade Alındı"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleInstallmentsClick(a)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <CalendarClock size={13} /> Taksitler
                        </button>
                        <button
                          onClick={() => handleEditClick(a)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <Pencil size={13} /> Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create Agreement */}
      {activeModal === "create" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Yeni Sözleşme Ekle</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 grid grid-cols-2 gap-4">
              <h4 className="font-bold text-slate-900 col-span-2 border-b pb-1">Müşteri Bilgileri</h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Müşteri Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={createForm.tenantName}
                  onChange={(e) => setCreateForm({ ...createForm, tenantName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">T.C. / Vergi Numarası</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={createForm.taxOrNationalId}
                  onChange={(e) => setCreateForm({ ...createForm, taxOrNationalId: e.target.value.replace(/[^0-9]/g, "") })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Telefon No</label>
                <input
                  type="text"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+90555..."
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">E-posta</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Teslimat Adresi</label>
                <input
                  type="text"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Şehir</label>
                <input
                  type="text"
                  value={createForm.city}
                  onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <h4 className="font-bold text-slate-900 col-span-2 border-b pb-1 pt-3">Kiralama Detayları</h4>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cihaz / Asset Adı</label>
                <input
                  type="text"
                  required
                  value={createForm.assetName}
                  onChange={(e) => setCreateForm({ ...createForm, assetName: e.target.value })}
                  placeholder="örn: MacBook Air"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cihaz SKU / Kod</label>
                <input
                  type="text"
                  value={createForm.assetSku}
                  onChange={(e) => setCreateForm({ ...createForm, assetSku: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kiralama Süresi (Ay)</label>
                <select
                  value={createForm.rentalTermMonths}
                  onChange={(e) => setCreateForm({ ...createForm, rentalTermMonths: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none bg-white"
                >
                  <option value="1">1 Ay</option>
                  <option value="3">3 Ay</option>
                  <option value="6">6 Ay</option>
                  <option value="9">9 Ay</option>
                  <option value="12">12 Ay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Aylık Taksit Tutarı</label>
                <input
                  type="number"
                  required
                  value={createForm.monthlyAmount}
                  onChange={(e) => setCreateForm({ ...createForm, monthlyAmount: e.target.value })}
                  placeholder="₺0.00"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kiralama Başlangıç</label>
                <input
                  type="date"
                  required
                  value={createForm.rentalStart}
                  onChange={(e) => setCreateForm({ ...createForm, rentalStart: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Seri Numarası</label>
                <input
                  type="text"
                  value={createForm.serialNumber}
                  onChange={(e) => setCreateForm({ ...createForm, serialNumber: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Teslimat Durumu</label>
                <select
                  value={createForm.deliveryStatus}
                  onChange={(e) => setCreateForm({ ...createForm, deliveryStatus: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none bg-white"
                >
                  <option value="PENDING">Kurye / Gönderim Bekliyor</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                  <option value="RETURNED">İade Alındı</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ödeme Günü (Gün)</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={createForm.paymentDueDay}
                  onChange={(e) => setCreateForm({ ...createForm, paymentDueDay: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              {error && (
                <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Sözleşmeyi Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Edit Agreement */}
      {activeModal === "edit" && selectedAgreement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Sözleşme Düzenle</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 grid grid-cols-2 gap-4">
              <h4 className="font-bold text-slate-900 col-span-2 border-b pb-1">Müşteri Bilgileri</h4>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Müşteri Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={editForm.tenantName}
                  onChange={(e) => setEditForm({ ...editForm, tenantName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">T.C. / Vergi Numarası</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={editForm.taxOrNationalId}
                  onChange={(e) => setEditForm({ ...editForm, taxOrNationalId: e.target.value.replace(/[^0-9]/g, "") })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Telefon No</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">E-posta</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Teslimat Adresi</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Şehir</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <h4 className="font-bold text-slate-900 col-span-2 border-b pb-1 pt-3">Kiralama Detayları</h4>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cihaz / Asset Adı</label>
                <input
                  type="text"
                  required
                  value={editForm.assetName}
                  onChange={(e) => setEditForm({ ...editForm, assetName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cihaz SKU / Kod</label>
                <input
                  type="text"
                  value={editForm.assetSku}
                  onChange={(e) => setEditForm({ ...editForm, assetSku: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Seri Numarası</label>
                <input
                  type="text"
                  value={editForm.serialNumber}
                  onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Teslimat Durumu</label>
                <select
                  value={editForm.deliveryStatus}
                  onChange={(e) => setEditForm({ ...editForm, deliveryStatus: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none bg-white"
                >
                  <option value="PENDING">Kurye / Gönderim Bekliyor</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                  <option value="RETURNED">İade Alındı</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ödeme Durumu</label>
                <select
                  value={editForm.paymentStatus}
                  onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none bg-white"
                >
                  <option value="CURRENT">Düzenli Ödeniyor</option>
                  <option value="LATE">Gecikmede</option>
                  <option value="COMPLETED">Tamamlandı</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sözleşme Notları</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none h-20"
                />
              </div>

              {error && (
                <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
              >
                {loading ? "Güncelleniyor..." : "Güncellemeleri Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - View Installments */}
      {activeModal === "installments" && selectedAgreement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">{selectedAgreement.tenantName} - Ödeme Planı</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedAgreement.assetName}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedAgreement.installments?.length === 0 ? (
                <p className="text-center text-slate-400 py-6">Ödeme takvimi bulunmuyor.</p>
              ) : (
                selectedAgreement.installments?.map((inst, index) => (
                  <div
                    key={inst.id}
                    className={`p-4 rounded-xl border flex justify-between items-center transition ${
                      inst.paid
                        ? "bg-green-50/40 border-green-100 text-green-800"
                        : new Date(inst.dueDate) < new Date()
                        ? "bg-red-50/40 border-red-100 text-red-800"
                        : "bg-slate-50/40 border-slate-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₺{inst.amount.toLocaleString("tr-TR")}</span>
                        <span className="text-xs opacity-85">
                          ({inst.description || `${index + 1}. Ay Taksiti`})
                        </span>
                      </div>
                      <span className="text-xs opacity-70 block mt-0.5">
                        Vade: {new Date(inst.dueDate).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleInstallment(inst.id, inst.paid)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition inline-flex items-center gap-1 ${
                          inst.paid
                            ? "bg-green-100 hover:bg-green-200 border-green-300 text-green-800"
                            : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                        }`}
                      >
                        {inst.paid ? (<><Check size={13} /> Ödendi Olarak İşaretli</>) : "Mark as Paid (EFT/Cash)"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
