import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Query statistics from Prisma MongoDB
  const totalAgreements = await prisma.rentalAgreement.count();
  
  const activeRevenueAggregate = await prisma.rentalAgreement.aggregate({
    _sum: {
      monthlyAmount: true,
    },
    where: {
      deliveryStatus: {
        in: ["PENDING", "DELIVERED"],
      },
    },
  });
  const monthlyRevenue = activeRevenueAggregate._sum.monthlyAmount || 0;

  const overdueInstallments = await prisma.installment.count({
    where: {
      paid: false,
      dueDate: {
        lt: new Date(),
      },
    },
  });

  const totalPaymentsCount = await prisma.paymentRecord.count();
  const successfulPaymentsSum = await prisma.paymentRecord.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: "SUCCESS",
    },
  });
  const totalReceivedFunds = successfulPaymentsSum._sum.amount || 0;

  // Recent data for Son Etkinlikler
  const recentUsers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const recentTickets = await prisma.supportTicket.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const recentPaymentLogs = await prisma.paymentRecord.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  interface ActivityItem {
    id: string;
    text: string;
    dateText: string;
    createdAt: Date;
  }

  const activities: ActivityItem[] = [];

  recentUsers.forEach((u) => {
    activities.push({
      id: `user-${u.id}`,
      text: `${u.firstName} ${u.lastName} adında yeni müşteri kayıt oldu.`,
      dateText: u.createdAt.toLocaleString("tr-TR"),
      createdAt: u.createdAt,
    });
  });

  recentOrders.forEach((o) => {
    activities.push({
      id: `order-${o.id}`,
      text: `${o.billingFirstName} ${o.billingLastName} adlı müşteri yeni sipariş (No: ${o.orderNumber}) oluşturdu.`,
      dateText: o.createdAt.toLocaleString("tr-TR"),
      createdAt: o.createdAt,
    });
  });

  recentTickets.forEach((t) => {
    activities.push({
      id: `ticket-${t.id}`,
      text: `${t.user?.firstName || "Müşteri"} ${t.user?.lastName || ""} adlı müşteri "${t.subject}" konulu destek talebi başlattı.`,
      dateText: t.createdAt.toLocaleString("tr-TR"),
      createdAt: t.createdAt,
    });
  });

  recentPaymentLogs.forEach((p) => {
    if (p.status === "SUCCESS") {
      activities.push({
        id: `payment-${p.id}`,
        text: `${p.payerName} adlı müşteri ₺${p.amount.toLocaleString("tr-TR")} tutarında ödeme yaptı.`,
        dateText: p.createdAt.toLocaleString("tr-TR"),
        createdAt: p.createdAt,
      });
    }
  });

  // Sort and take top 5
  const sortedActivities = activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const recentPayments = await prisma.paymentRecord.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Genel Bakış</h2>
        <p className="text-slate-500 text-sm">Finansal ve operasyonel verilerinizin özeti.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Toplam Sözleşme</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-slate-900">{totalAgreements}</span>
            <span className="text-xs text-slate-400">Adet</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Aylık Aktif Gelir</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-slate-900">₺{monthlyRevenue.toLocaleString("tr-TR")}</span>
            <span className="text-xs text-emerald-500 font-bold">/ Ay</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Geciken Taksit</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-red-600">{overdueInstallments}</span>
            <span className="text-xs text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded">Gecikmede</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Toplam Ciro (Başarılı)</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-emerald-600">₺{totalReceivedFunds.toLocaleString("tr-TR")}</span>
            <span className="text-xs text-slate-400">Kasa Toplam</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Etkinlikler (Recent Activities) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Activity size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">Son Etkinlikler</h3>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {sortedActivities.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">Henüz bir etkinlik kaydı bulunmuyor.</p>
            ) : (
              sortedActivities.map((act) => (
                <div key={act.id} className="p-4 hover:bg-slate-50/40 transition space-y-1.5">
                  <p className="text-xs font-medium text-slate-700 leading-normal">
                    {act.text}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock size={11} /> {act.dateText}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Son Ödeme İşlemleri</h3>
            <Link href="/admin/payments" className="text-xs text-orange-500 font-bold hover:underline">
              Tümünü Gör →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">İşlem kaydı bulunmuyor.</p>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{p.payerName}</h4>
                    <p className="text-xs text-slate-500">{p.description || "Ödeme"}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900">₺{p.amount.toLocaleString("tr-TR")}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.25 rounded-md border ${
                        p.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : p.status === "FAILED"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-yellow-50 text-yellow-700 border-yellow-100"
                      }`}
                    >
                      {p.status === "SUCCESS" ? "Başarılı" : p.status === "FAILED" ? "Başarısız" : "Beklemede"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
