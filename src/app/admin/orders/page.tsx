import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./OrdersClient";
import { CartesianBarChart } from "../_components/CartesianBarChart";
import { CartesianLineChart } from "../_components/CartesianLineChart";
import { bucketByDay, daysAgo } from "../_components/chart-data";
import { PieChart, TrendingUp } from "lucide-react";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Ödeme Bekliyor",
  PROCESSING: "İşleniyor",
  PAID: "Ödendi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};
const ORDER_STATUSES = ["PENDING_PAYMENT", "PROCESSING", "PAID", "CANCELLED", "REFUNDED"] as const;

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "ADMIN") {
    redirect("/");
  }

  // orderStatusCounts ve ordersLast14Days, orders/agreements'a bağlı değil —
  // sıralı await yerine hepsini aynı anda başlatıyoruz (bkz. Dashboard'daki
  // aynı düzeltme). agreements, orders'ın sonucuna (orderNumber listesine)
  // ihtiyaç duyduğundan o zincir kendi içinde sıralı kalmak zorunda.
  const [orders, orderStatusCounts, ordersLast14Days] = await Promise.all([
    // Ödemesi tamamlanmamış siparişler (checkout başlatılıp yarım bırakılmış
    // olabilir) yönetim listesinde görünmesin — Iyzico entegrasyonu için
    // Order kaydı ödemeden önce oluşmak zorunda, o yüzden burada filtreliyoruz.
    prisma.order.findMany({ where: { paymentStatus: "SUCCESS" }, orderBy: { createdAt: "desc" } }),
    // Sipariş durumu dağılımı (iptal/iade oranını da içerir).
    Promise.all(
      ORDER_STATUSES.map(async (status) => ({
        label: ORDER_STATUS_LABELS[status],
        value: await prisma.order.count({ where: { status } }),
      }))
    ),
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: daysAgo(14) } },
      select: { createdAt: true },
    }),
  ]);

  // Which orders already turned into a rental agreement (auto-created on
  // successful payment) — shown in the order detail modal so admins can
  // jump straight from a sale to its contract.
  const agreements = await prisma.rentalAgreement.findMany({
    where: { orderReferenceNo: { in: orders.map((o) => o.orderNumber) } },
    select: { id: true, orderReferenceNo: true },
  });
  const agreementByOrderNumber: Record<string, string> = {};
  agreements.forEach((a) => {
    if (a.orderReferenceNo) agreementByOrderNumber[a.orderReferenceNo] = a.id;
  });

  const dailyOrderCount = bucketByDay(ordersLast14Days, (o) => o.createdAt, () => 1, 14);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Sipariş Yönetimi</h2>
        <p className="text-slate-500 text-sm">Mağazadan gelen siparişleri ve durumlarını takip edin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">Sipariş Durumu Dağılımı</h3>
          </div>
          <CartesianBarChart data={orderStatusCounts} barColor="#64748b" formatValue={(v) => `${v}`} height={200} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Günlük Sipariş Sayısı (Son 14 Gün)</h3>
          </div>
          <CartesianLineChart data={dailyOrderCount} formatValue={(v) => `${v}`} height={200} />
        </div>
      </div>

      <OrdersClient
        initialOrders={JSON.parse(JSON.stringify(orders))}
        agreementByOrderNumber={agreementByOrderNumber}
      />
    </div>
  );
}
