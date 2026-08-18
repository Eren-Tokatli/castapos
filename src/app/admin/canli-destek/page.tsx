import React from "react";
import { prisma } from "@/lib/prisma";
import { AgentTicketListClient } from "../../destek/AgentTicketListClient";

export const dynamic = "force-dynamic";

// Yetki kontrolü /admin altındaki her sayfa için middleware.ts'de zaten
// yapılıyor (sadece ADMIN rolü buraya girebiliyor) — burada tekrar
// kontrol etmeye gerek yok.
export default async function AdminCanliDestekPage() {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Canlı Destek</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Sitedeki canlı destek widget'ından ve müşteri destek taleplerinden gelen tüm görüşmeler.
        </p>
      </div>

      <AgentTicketListClient initialTickets={JSON.parse(JSON.stringify(tickets))} />
    </div>
  );
}
