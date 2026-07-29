import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TicketListClient } from "./TicketListClient";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/destek");
  }

  // Fetch all tickets for this user
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="account-page">
      <section className="account-hero compact-account-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <Link href="/hesap/panel">Hesabım</Link> › <span>Destek Taleplerim</span>
          </nav>
          <h1>Destek Taleplerim</h1>
          <p>Bizimle iletişime geçin, sorularınızı ve teknik taleplerinizi buradan takip edin.</p>
        </div>
      </section>

      <section className="section compact-section">
        <div className="container">
          <TicketListClient initialTickets={JSON.parse(JSON.stringify(tickets))} />
        </div>
      </section>
    </main>
  );
}
