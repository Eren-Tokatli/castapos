import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "ADMIN") {
    redirect("/");
  }

  // Ödemesi tamamlanmamış siparişler (checkout başlatılıp yarım bırakılmış
  // olabilir) yönetim listesinde görünmesin — Iyzico entegrasyonu için Order
  // kaydı ödemeden önce oluşmak zorunda, o yüzden burada filtreliyoruz.
  const orders = await prisma.order.findMany({
    where: { paymentStatus: "SUCCESS" },
    orderBy: { createdAt: "desc" },
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Sipariş Yönetimi</h2>
        <p className="text-slate-500 text-sm">Mağazadan gelen siparişleri ve durumlarını takip edin.</p>
      </div>

      <OrdersClient
        initialOrders={JSON.parse(JSON.stringify(orders))}
        agreementByOrderNumber={agreementByOrderNumber}
      />
    </div>
  );
}
