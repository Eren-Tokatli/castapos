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

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Sipariş Yönetimi</h2>
        <p className="text-slate-500 text-sm">Mağazadan gelen siparişleri ve durumlarını takip edin.</p>
      </div>

      <OrdersClient initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
