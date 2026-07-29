import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AgentTicketListClient } from "./AgentTicketListClient";

export const dynamic = "force-dynamic";

export default async function AgentSupportPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // Enforce support or admin role
  if (userRole !== "SUPPORT" && userRole !== "ADMIN") {
    redirect("/");
  }

  // Fetch all tickets in the system including user info
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
        <h2 className="text-2xl font-bold text-slate-800">Müşteri Destek Masası</h2>
        <p className="text-slate-500 text-sm">Gelen yardım ve teknik destek taleplerini yanıtlayın.</p>
      </div>

      <AgentTicketListClient initialTickets={JSON.parse(JSON.stringify(tickets))} />
    </div>
  );
}
