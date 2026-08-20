import React from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Calendar, FileText, CreditCard } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/AccountShell";
import { OrderItemsClient, type ReviewableItem } from "./OrderItemsClient";

export const dynamic = "force-dynamic";

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return { text: "Ödeme Bekliyor", class: "bg-orange-50 text-orange-700 border-orange-200" };
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

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.userId !== userId) {
    notFound();
  }

  const [user, products, reviews] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.product.findMany({
      where: { id: { in: order.items.map((i) => i.productId) } },
      select: { id: true, images: true },
    }),
    prisma.review.findMany({ where: { userId, orderId: order.id }, select: { productId: true } }),
  ]);

  const imageByProductId = new Map(
    products.map((p) => [p.id, [...p.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url])
  );
  const reviewedProductIds = reviews.map((r) => r.productId);

  const reviewableItems: ReviewableItem[] = order.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    saleMode: item.saleMode,
    rentalTierLabel: item.rentalTierLabel,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
    image: imageByProductId.get(item.productId),
  }));

  const status = getStatusLabel(order.status);
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : session?.user?.name || "Castapos üyesi";

  return (
    <AccountShell displayName={displayName} email={user?.email || session?.user?.email || ""}>
      <div className="account-panel-hero" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/hesap/siparislerim"
          className="w-10 h-10 border border-slate-200 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-600 transition shrink-0"
          title="Geri Dön"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: 32 }}>Sipariş #{order.orderNumber}</h1>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-surface p-5 flex items-center gap-3">
            <span className="account-dashboard-icon"><FileText size={18} /></span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">SİPARİŞ NO</span>
              <span className="text-sm font-bold text-slate-800">#{order.orderNumber}</span>
            </div>
          </div>

          <div className="premium-surface p-5 flex items-center gap-3">
            <span className="account-dashboard-icon"><Calendar size={18} /></span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">SİPARİŞ TARİHİ</span>
              <span className="text-sm font-bold text-slate-800">{order.createdAt.toLocaleDateString("tr-TR")}</span>
            </div>
          </div>

          <div className="premium-surface p-5 flex items-center gap-3">
            <span className="account-dashboard-icon"><CreditCard size={18} /></span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">DURUM</span>
              <span className={`status-pill inline-flex px-2 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${status.class}`}>
                {status.text}
              </span>
            </div>
          </div>
        </div>

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

        <div className="premium-surface p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Sipariş Edilen Ürünler</h3>
          <OrderItemsClient
            orderId={order.id}
            items={reviewableItems}
            canReview={order.status === "PAID"}
            reviewedProductIds={reviewedProductIds}
          />

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
    </AccountShell>
  );
}
