import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, Activity, TrendingUp, Package, PieChart, Undo2 } from "lucide-react";
import { CartesianBarChart } from "./_components/CartesianBarChart";
import { CartesianLineChart } from "./_components/CartesianLineChart";
import { bucketByDay, bucketByMonth, daysAgo, monthsAgoStart } from "./_components/chart-data";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Ödeme Bekliyor",
  PROCESSING: "İşleniyor",
  PAID: "Ödendi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // İadesi yaklaşan sözleşmeler için pencere — süresi geçmişler dahil
  // (henüz iade edilmemişse en acil olanlar onlar), en yakın bitiş en üstte.
  const now = new Date();
  const upcomingReturnCutoff = new Date(now);
  upcomingReturnCutoff.setDate(upcomingReturnCutoff.getDate() + 7);

  // Bu sayfadaki ~13 sorgunun hiçbiri birbirinin sonucuna bağlı değil, ama
  // hepsi ayrı ayrı `await` ediliyordu — yani her biri bir öncekinin bitmesini
  // bekliyordu (Mongo Atlas'a gidip gelen her istek üst üste toplanıyordu,
  // sayfa gözle görülür yavaş açılıyordu). Tek bir Promise.all ile hepsini
  // aynı anda başlatıyoruz; toplam süre artık en yavaş tek sorgu kadar.
  const [
    totalAgreements,
    activeRevenueAggregate,
    overdueInstallments,
    successfulPaymentsSum,
    recentUsers,
    recentOrders,
    recentTickets,
    recentPaymentLogs,
    recentSuccessfulPayments,
    paidOrdersForProducts,
    orderStatusCounts,
    paidOrdersLast14Days,
    upcomingReturns,
  ] = await Promise.all([
    prisma.rentalAgreement.count(),
    prisma.rentalAgreement.aggregate({
      _sum: { monthlyAmount: true },
      where: { deliveryStatus: { in: ["PENDING", "DELIVERED"] } },
    }),
    prisma.installment.count({ where: { paid: false, dueDate: { lt: new Date() } } }),
    prisma.paymentRecord.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    prisma.user.findMany({ where: { role: "CUSTOMER" }, take: 5, orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.supportTicket.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true } }),
    prisma.paymentRecord.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    // Aylık ciro trendi (son 6 ay) için ham veri — Mongo'da groupBy ile tarih
    // kırpma (date truncation) Prisma tarafında desteklenmiyor, aya göre
    // toplamayı JS tarafında yapıyoruz (bkz. bucketByMonth).
    prisma.paymentRecord.findMany({
      where: { status: "SUCCESS", createdAt: { gte: monthsAgoStart(6) } },
      select: { amount: true, createdAt: true },
    }),
    // En çok kiralanan/satılan ürünler (top 5, ödenmiş siparişlerden adet bazlı).
    prisma.order.findMany({ where: { status: "PAID" }, select: { items: true } }),
    // Sipariş durumu dağılımı (iptal/iade oranını da içerir).
    Promise.all(
      (["PENDING_PAYMENT", "PROCESSING", "PAID", "CANCELLED", "REFUNDED"] as const).map(async (status) => ({
        label: ORDER_STATUS_LABELS[status],
        value: await prisma.order.count({ where: { status } }),
      }))
    ),
    // Günlük satılan ürün adedi (son 14 gün) — borsa tarzı trend grafiği için.
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: daysAgo(14) } },
      select: { items: true, createdAt: true },
    }),
    // İadesi yaklaşan (veya süresi çoktan geçmiş) kiralamalar — satın
    // alınmış (boughtOut) veya erken iade edilmiş (earlyReturn) ya da zaten
    // teslim alınmış (RETURNED) sözleşmeler burada anlamsız, hariç tutulur.
    prisma.rentalAgreement.findMany({
      where: {
        rentalEnd: { lte: upcomingReturnCutoff },
        deliveryStatus: { not: "RETURNED" },
        boughtOut: false,
        earlyReturn: false,
      },
      orderBy: { rentalEnd: "asc" },
      take: 8,
    }),
  ]);

  const monthlyRevenue = activeRevenueAggregate._sum.monthlyAmount || 0;
  const totalReceivedFunds = successfulPaymentsSum._sum.amount || 0;
  // "Son Ödeme İşlemleri" kartı da aynı son-5-ödeme verisini kullanıyor —
  // eskiden bu sorgu (recentPayments adıyla) ikinci kez ayrıca çekiliyordu.
  const recentPayments = recentPaymentLogs;

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

  // --- Raporlama / Grafikler --- (ham veriler yukarıdaki Promise.all'da
  // zaten çekildi, burada sadece grafik için işleniyor)
  const monthlyRevenueTrend = bucketByMonth(recentSuccessfulPayments, (p) => p.createdAt, (p) => p.amount, 6);

  const productQuantities = new Map<string, number>();
  for (const order of paidOrdersForProducts) {
    for (const item of order.items) {
      productQuantities.set(item.name, (productQuantities.get(item.name) || 0) + item.quantity);
    }
  }
  const topProducts = [...productQuantities.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({
      label: name.length > 14 ? `${name.slice(0, 13)}…` : name,
      value: qty,
    }));

  const dailyUnitsSold = bucketByDay(
    paidOrdersLast14Days,
    (o) => o.createdAt,
    (o) => o.items.reduce((sum, i) => sum + i.quantity, 0),
    14
  );

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

      {/* İadesi yaklaşan/gecikmiş kiralamalar — kurye/lojistik ekibinin
          "bugün kimden ürün almam lazım" sorusuna hızlı cevap. KPI'ların
          hemen altında, grafiklerden önce — günlük operasyon, analitikten
          öncelikli. */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Undo2 size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">İadesi Yaklaşan Ürünler</h3>
          </div>
          <Link href="/admin/agreements" className="text-xs text-orange-500 font-bold hover:underline">
            Tümünü Gör →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {upcomingReturns.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Önümüzdeki 7 gün içinde iadesi gelen ürün yok.</p>
          ) : (
            upcomingReturns.map((a) => {
              const daysLeft = a.rentalEnd
                ? Math.ceil((a.rentalEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;
              const overdue = daysLeft !== null && daysLeft < 0;

              return (
                <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">{a.assetName}</h4>
                    <p className="text-xs text-slate-500 truncate">
                      {a.tenantName} · T.C. {a.taxOrNationalId}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700 block">
                      {a.rentalEnd?.toLocaleDateString("tr-TR")}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        overdue
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-orange-50 text-orange-700 border-orange-100"
                      }`}
                    >
                      {daysLeft === null
                        ? "-"
                        : overdue
                        ? `${Math.abs(daysLeft)} gün gecikti`
                        : daysLeft === 0
                        ? "Bugün"
                        : `${daysLeft} gün kaldı`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Raporlama / Grafikler — genel bakış. Aynı grafiklerin ilgili sayfa
          bazlı ("özel") versiyonlarını Siparişler, Ürünler ve Ödeme
          Kayıtları sayfalarında da bulabilirsin. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Aylık Ciro Trendi (Son 6 Ay)</h3>
          </div>
          <CartesianLineChart data={monthlyRevenueTrend} formatValue={(v) => `₺${v.toLocaleString("tr-TR")}`} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-orange-500" />
            <h3 className="font-bold text-slate-800 text-sm">Günlük Satılan Ürün Adedi (Son 14 Gün)</h3>
          </div>
          <CartesianLineChart data={dailyUnitsSold} formatValue={(v) => `${v}`} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-orange-500" />
            <h3 className="font-bold text-slate-800 text-sm">En Çok Kiralanan Ürünler (Adet)</h3>
          </div>
          <CartesianBarChart data={topProducts} barColor="#f97316" formatValue={(v) => `${v}`} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={16} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">Sipariş Durumu Dağılımı</h3>
          </div>
          <CartesianBarChart data={orderStatusCounts} barColor="#64748b" formatValue={(v) => `${v}`} height={200} />
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
                          : "bg-orange-50 text-orange-700 border-orange-100"
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
