import React from "react";
import { prisma } from "@/lib/prisma";
import { PaymentsClient } from "./PaymentsClient";
import { CartesianLineChart } from "../_components/CartesianLineChart";
import { bucketByDay, bucketByMonth, daysAgo, monthsAgoStart } from "../_components/chart-data";
import { TrendingUp, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  // Dört sorgu da birbirinden bağımsız — sıralı await yerine paralel (bkz.
  // Dashboard/Siparişler/Ürünler'deki aynı düzeltme).
  const [payments, paymentLinks, successfulPaymentsLast6Months, successfulPaymentsLast14Days] = await Promise.all([
    prisma.paymentRecord.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.paymentLink.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.paymentRecord.findMany({
      where: { status: "SUCCESS", createdAt: { gte: monthsAgoStart(6) } },
      select: { amount: true, createdAt: true },
    }),
    prisma.paymentRecord.findMany({
      where: { status: "SUCCESS", createdAt: { gte: daysAgo(14) } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    kind: p.kind,
    payerName: p.payerName,
    payerEmail: p.payerEmail,
    payerPhone: p.payerPhone,
    amount: p.amount,
    description: p.description,
    iyzicoToken: p.iyzicoToken,
    iyzicoPaymentId: p.iyzicoPaymentId,
    status: p.status,
    errorMessage: p.errorMessage,
    createdAt: p.createdAt.toISOString(),
  }));

  const serializedLinks = paymentLinks.map((link) => ({
    id: link.id,
    token: link.token,
    payerName: link.payerName,
    payerEmail: link.payerEmail,
    payerPhone: link.payerPhone,
    amount: link.amount,
    description: link.description,
    paid: link.paid,
    installmentId: link.installmentId,
    createdAt: link.createdAt.toISOString(),
  }));

  const monthlyRevenueTrend = bucketByMonth(successfulPaymentsLast6Months, (p) => p.createdAt, (p) => p.amount, 6);
  const dailyRevenue = bucketByDay(
    successfulPaymentsLast14Days,
    (p) => p.createdAt,
    (p) => p.amount,
    14
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={16} className="text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Aylık Ciro Trendi (Son 6 Ay)</h3>
          </div>
          <CartesianLineChart data={monthlyRevenueTrend} formatValue={(v) => `₺${v.toLocaleString("tr-TR")}`} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Günlük Ciro (Son 14 Gün)</h3>
          </div>
          <CartesianLineChart data={dailyRevenue} formatValue={(v) => `₺${v.toLocaleString("tr-TR")}`} height={200} />
        </div>
      </div>

      <PaymentsClient
        payments={serializedPayments}
        paymentLinks={serializedLinks}
      />
    </div>
  );
}
