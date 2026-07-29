import React from "react";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  // Load order details from Prisma MongoDB
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
        {/* Header Success Ribbon */}
        <div className="bg-orange-500 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Siparişiniz Alındı!</h1>
          <p className="text-orange-100 mt-2 font-medium">
            Ödemeniz başarıyla tamamlandı. Sipariş detaylarınız aşağıdadır.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-8 space-y-8">
          {/* Telemetry info */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-5">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Sipariş Numarası</span>
              <h2 className="text-lg font-bold text-gray-800 font-mono mt-0.5">{order.orderNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 uppercase">Tarih</span>
              <span className="text-sm font-semibold text-gray-700 block mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
          </div>

          {/* Delivery & Billing Address info */}
          <div className="grid sm:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Teslimat Adresi</h3>
              <b className="text-sm font-bold text-gray-900 block">
                {order.shippingFirstName} {order.shippingLastName}
              </b>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {order.shippingAddressLine1} <br />
                {order.shippingAddressLine2} / {order.shippingCity}
              </p>
              <span className="text-xs text-gray-400 block mt-2">Tel: {order.phone}</span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Fatura Adresi</h3>
              <b className="text-sm font-bold text-gray-900 block">
                {order.billingFirstName} {order.billingLastName}
              </b>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {order.billingAddressLine1} <br />
                {order.billingAddressLine2} / {order.billingCity}
              </p>
              <span className="text-xs text-gray-400 block mt-2">Email: {order.email}</span>
            </div>
          </div>

          {/* Itemized Order list */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Sipariş Edilen Ürünler</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex justify-between items-center text-sm">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <span className="text-xs text-gray-400 font-mono block mt-0.5">SKU: {item.sku}</span>
                    <span className="inline-flex mt-1.5 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                      {item.saleMode === "BUY" ? "Satın Alma" : `${item.rentalTierLabel} Kiralama`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-bold block">
                      ₺{item.lineTotal.toLocaleString("tr-TR")}
                    </span>
                    <span className="text-xs text-gray-500">{item.quantity} Adet</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals panel */}
          <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ara Toplam:</span>
              <span className="text-gray-800 font-semibold">₺{order.subtotal.toLocaleString("tr-TR")}</span>
            </div>
            
            {order.totalLines.find((line) => line.code === "discount") && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>İndirim:</span>
                <span>₺{order.totalLines.find((line) => line.code === "discount")?.value.toLocaleString("tr-TR")}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">KDV (%20 dahil):</span>
              <span className="text-gray-800 font-semibold">₺{order.taxTotal.toLocaleString("tr-TR")}</span>
            </div>

            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-3 text-slate-900">
              <span>Toplam Ödeme:</span>
              <span className="text-lg text-orange-500">₺{order.total.toLocaleString("tr-TR")}</span>
            </div>
          </div>

          {/* Buttons actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/"
              className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center justify-center"
            >
              Alışverişe Devam Et
            </Link>
            <Link
              href="/hesap/panel"
              className="flex-1 h-12 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition flex items-center justify-center"
            >
              Hesabıma Git
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
