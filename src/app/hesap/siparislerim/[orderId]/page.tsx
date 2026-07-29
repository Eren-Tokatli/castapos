import React from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ShoppingBag, ArrowLeft, Calendar, FileText, CreditCard } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return { text: "Ödeme Bekliyor", class: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    case "PROCESSING":
      return { text: "Hazırlanıyor", class: "bg-blue-50 text-blue-700 border-blue-200" };
    case "PAID":
      return { text: "Ödendi / Tamamlandı", class: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "CANCELLED":
      return { text: "İptal Edildi", class: "bg-rose-50 text-rose-700 border-rose-200" };
    case "REFUNDED":
      return { text: "İade Edildi", class: "bg-slate-50 text-slate-700 border-slate-200" };
    default:
      return { text: status, class: "bg-slate-50 text-slate-600 border-slate-200" };
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect(`/hesap/giris?callbackUrl=/hesap/siparislerim/${orderId}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  // Verify order exists and belongs to logged-in user
  if (!order || order.userId !== userId) {
    notFound();
  }

  const status = getStatusLabel(order.status);

  return (
    <main className="account-page">
      <section className="account-hero compact-account-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <Link href="/hesap/panel">Hesabım</Link> › <Link href="/hesap/siparislerim">Siparişlerim</Link> › <span>Sipariş #{order.orderNumber}</span>
          </nav>
          <div className="flex items-center gap-3 mt-2">
            <Link
              href="/hesap/siparislerim"
              className="w-10 h-10 border border-slate-200 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 transition"
              title="Geri Dön"
            >
              <ArrowLeft size={16} />
            </Link>
            <h1>Sipariş Detayı</h1>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container space-y-6">
          {/* Order Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-surface p-5 flex items-center gap-3">
              <span className="account-dashboard-icon">
                <FileText size={18} />
              </span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">SİPARİŞ NO</span>
                <span className="text-sm font-bold text-slate-800">#{order.orderNumber}</span>
              </div>
            </div>

            <div className="premium-surface p-5 flex items-center gap-3">
              <span className="account-dashboard-icon">
                <Calendar size={18} />
              </span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">SİPARİŞ TARİHİ</span>
                <span className="text-sm font-bold text-slate-800">{order.createdAt.toLocaleDateString("tr-TR")}</span>
              </div>
            </div>

            <div className="premium-surface p-5 flex items-center gap-3">
              <span className="account-dashboard-icon">
                <CreditCard size={18} />
              </span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">DURUM</span>
                <span className={`status-pill inline-flex px-2 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${status.class}`}>
                  {status.text}
                </span>
              </div>
            </div>
          </div>

          {/* Billing & Shipping split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="premium-surface p-6 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Fatura Bilgileri</h3>
              <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                <p className="font-bold text-slate-800">{order.billingFirstName} {order.billingLastName}</p>
                {order.billingCompany && <p className="font-medium text-slate-500">{order.billingCompany}</p>}
                <p>{order.billingAddressLine1}</p>
                {order.billingAddressLine2 && <p>{order.billingAddressLine2}</p>}
                <p>{order.billingPostcode} / {order.billingCity} / {order.billingCountry}</p>
                <p className="pt-2"><b>Telefon:</b> {order.phone || "-"}</p>
                <p><b>E-posta:</b> {order.email}</p>
              </div>
            </div>

            <div className="premium-surface p-6 space-y-3">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Teslimat Adresi</h3>
              <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                <p className="font-bold text-slate-800">{order.shippingFirstName} {order.shippingLastName}</p>
                {order.shippingCompany && <p className="font-medium text-slate-500">{order.shippingCompany}</p>}
                <p>{order.shippingAddressLine1}</p>
                {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
                <p>{order.shippingPostcode} / {order.shippingCity} / {order.shippingCountry}</p>
              </div>
            </div>
          </div>

          {/* Products List & Summary Card */}
          <div className="premium-surface p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Sipariş Edilen Ürünler</h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex justify-between items-center gap-4 text-xs">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                    <div className="flex gap-4 text-slate-400 mt-1 font-semibold">
                      {item.sku && <span>SKU: {item.sku}</span>}
                      <span>Tür: {(item.saleMode as string) === "RENTAL" ? `Kiralama (${item.rentalTierLabel || "Plan"})` : "Satın Alma"}</span>
                      <span>Adet: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Birim Fiyat: ₺{item.unitPrice.toLocaleString("tr-TR")}</span>
                    <span className="font-black text-slate-900 block mt-0.5 text-sm">₺{item.lineTotal.toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-200 pt-4 flex flex-col md:items-end">
              <div className="w-full md:w-80 text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span className="font-bold text-slate-800">₺{order.subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo Ücreti:</span>
                  <span className="font-bold text-slate-800">
                    {order.shippingTotal === 0 ? "Ücretsiz" : `₺${order.shippingTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
                {order.taxTotal > 0 && (
                  <div className="flex justify-between">
                    <span>KDV Vergisi:</span>
                    <span className="font-bold text-slate-800">₺{order.taxTotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {order.totalLines.map((line, lIdx) => {
                  if (line.code === "subtotal" || line.code === "total" || line.code === "shipping") return null;
                  return (
                    <div key={lIdx} className="flex justify-between text-[var(--gold-dark)] font-bold">
                      <span>{line.title}:</span>
                      <span>-₺{line.value.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between border-t border-slate-100 pt-2 text-sm">
                  <span className="font-bold text-slate-800">Genel Toplam:</span>
                  <span className="font-black text-[var(--gold-dark)] text-lg">₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
