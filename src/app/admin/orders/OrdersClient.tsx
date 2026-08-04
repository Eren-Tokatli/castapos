"use client";

import React, { useState } from "react";
import { Search, Eye, Filter, Calendar, Mail, User } from "lucide-react";
import { updateOrderStatus } from "./actions";
import { OrderStatus } from "@/generated/prisma";

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

export function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
    } else {
      alert(res.error || "Durum güncellenirken hata oluştu.");
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* FILTER & SEARCH & TABLE SECTION */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
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
                      <td className="p-3 font-bold text-slate-900">#{o.orderNumber}</td>
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

      {/* SELECTED ORDER SIDEBAR DETAILS SECTION */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
          Sipariş Kartı
        </h3>
        {selectedOrder ? (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                <User size={14} />
              </span>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">MÜŞTERİ</p>
                <p className="font-bold text-slate-800">
                  {selectedOrder.billingFirstName} {selectedOrder.billingLastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                <Mail size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold">İLETİŞİM</p>
                <p className="font-bold text-slate-800 truncate">{selectedOrder.email}</p>
                <p className="text-[10px] text-slate-400">{selectedOrder.phone || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                <Calendar size={14} />
              </span>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">SİPARİŞ TARİHİ</p>
                <p className="font-bold text-slate-800">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("tr-TR")}
                </p>
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
              <span className="text-[10px] font-bold text-slate-400 block mb-2">SİPARİŞ ÖZETİ</span>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] text-slate-700">
                    <span className="truncate max-w-[120px] font-semibold">{item.name}</span>
                    <span className="font-bold text-slate-400">x{item.quantity}</span>
                    <span className="font-black text-slate-800">₺{item.lineTotal.toLocaleString("tr-TR")}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-orange-500">
                  <span>Toplam:</span>
                  <span>₺{selectedOrder.total.toLocaleString("tr-TR")}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400">
            Sipariş detaylarını görüntülemek için tabloda "Detay" düğmesine tıklayın.
          </div>
        )}
      </div>
    </div>
  );
}
