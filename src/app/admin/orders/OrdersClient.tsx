"use client";

import React, { useState } from "react";
import { Search, Eye, Mail, User, FileCheck2, X } from "lucide-react";
import { updateOrderStatus } from "./actions";
import { OrderStatus } from "@/generated/prisma";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { useAdminToast } from "../_components/ToastProvider";

interface OrderItem {
  productId: string;
  name: string;
  sku: string | null;
  saleMode: "BUY" | "RENTAL" | string;
  rentalTierLabel: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  billingFirstName: string;
  billingLastName: string;
  billingCompany: string | null;
  billingAddressLine1: string;
  billingAddressLine2: string | null;
  billingCity: string;
  billingPostcode: string;
  email: string;
  phone: string | null;
  items: OrderItem[];
  createdAt: string;
}

export function OrdersClient({
  initialOrders,
  agreementByOrderNumber = {},
}: {
  initialOrders: Order[];
  agreementByOrderNumber?: Record<string, string>;
}) {
  const toast = useAdminToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Status mapping
  const statuses: { value: OrderStatus; label: string; class: string }[] = [
    { value: "PENDING_PAYMENT", label: "Ödeme Bekliyor", class: "bg-orange-50 text-orange-700 border-orange-200" },
    { value: "PROCESSING", label: "Hazırlanıyor", class: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "PAID", label: "Ödendi / Hazır", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { value: "CANCELLED", label: "İptal Edildi", class: "bg-rose-50 text-rose-700 border-rose-200" },
    { value: "REFUNDED", label: "İade Edildi", class: "bg-slate-50 text-slate-700 border-slate-200" },
  ];

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    const res = await updateOrderStatus(orderId, nextStatus);
    if (res.success) {
      const updated = orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
      setOrders(updated);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
      toast("Sipariş durumu güncellendi.");
    } else {
      setAlertMessage(res.error || "Durum güncellenirken hata oluştu.");
    }
  };

  // Filtered orders logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      `${o.billingFirstName} ${o.billingLastName}`.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "ALL" ? true : o.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH & TABLE SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Sipariş no, müşteri ismi veya e-posta ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Status filter selection */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === "ALL" ? "bg-slate-900 text-white" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tümü
            </button>
            {statuses.map((st) => (
              <button
                key={st.value}
                onClick={() => setFilterStatus(st.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === st.value
                    ? "bg-orange-500 text-white"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="p-3">Sipariş No</th>
                <th className="p-3">Müşteri</th>
                <th className="p-3">Ürünler</th>
                <th className="p-3 text-right">Tutar</th>
                <th className="p-3 text-center">Durum</th>
                <th className="p-3 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Eşleşen sipariş kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const currentStatusObj = statuses.find((st) => st.value === o.status) || {
                    label: o.status,
                    class: "bg-slate-50 text-slate-600 border-slate-200",
                  };
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="font-bold text-slate-900 hover:text-orange-500 hover:underline transition"
                        >
                          #{o.orderNumber}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">
                          {o.billingFirstName} {o.billingLastName}
                        </div>
                        <div className="text-[10px] text-slate-400">{o.email}</div>
                      </td>
                      <td className="p-3 truncate max-w-[200px]">
                        {o.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        ₺{o.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border focus:outline-none cursor-pointer ${currentStatusObj.class}`}
                        >
                          {statuses.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition inline-flex items-center gap-1.5"
                          title="Detayları İncele"
                        >
                          <Eye size={14} /> Detay
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

      {/* SELECTED ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">#{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedOrder.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-600">
              {agreementByOrderNumber[selectedOrder.orderNumber] && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3 py-2 font-semibold">
                  <FileCheck2 size={14} />
                  Bu siparişten otomatik bir kiralama sözleşmesi oluşturuldu.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                    <User size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold">MÜŞTERİ</p>
                    <p className="font-bold text-slate-800">
                      {selectedOrder.billingFirstName} {selectedOrder.billingLastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold">İLETİŞİM</p>
                    <p className="font-bold text-slate-800 truncate">{selectedOrder.email}</p>
                    <p className="text-[10px] text-slate-400">{selectedOrder.phone || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block mb-2">TESLİMAT ADRESİ</span>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 leading-normal text-slate-500">
                  <p className="font-bold text-slate-700">
                    {selectedOrder.billingFirstName} {selectedOrder.billingLastName}
                  </p>
                  <p>{selectedOrder.billingAddressLine1}</p>
                  {selectedOrder.billingAddressLine2 && <p>{selectedOrder.billingAddressLine2}</p>}
                  <p className="font-semibold text-slate-600">
                    {selectedOrder.billingPostcode} / {selectedOrder.billingCity}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block mb-2">SİPARİŞ İÇERİĞİ</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold">
                        <th className="p-2.5">Ürün</th>
                        <th className="p-2.5">Plan</th>
                        <th className="p-2.5 text-center">Adet</th>
                        <th className="p-2.5 text-right">Aylık</th>
                        <th className="p-2.5 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-semibold text-slate-800">
                            {item.name}
                            {item.sku && <span className="block text-[10px] text-slate-400 font-normal">{item.sku}</span>}
                          </td>
                          <td className="p-2.5 text-slate-500">{item.rentalTierLabel || "-"}</td>
                          <td className="p-2.5 text-center text-slate-500">{item.quantity}</td>
                          <td className="p-2.5 text-right text-slate-500">
                            ₺{item.unitPrice.toLocaleString("tr-TR")}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-800">
                            ₺{item.lineTotal.toLocaleString("tr-TR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center pt-3 mt-1">
                  <span className="text-slate-500">
                    Ara toplam ₺{selectedOrder.subtotal.toLocaleString("tr-TR")} + KDV ₺
                    {selectedOrder.taxTotal.toLocaleString("tr-TR")}
                  </span>
                  <span className="font-black text-base text-orange-500">
                    Toplam ₺{selectedOrder.total.toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
