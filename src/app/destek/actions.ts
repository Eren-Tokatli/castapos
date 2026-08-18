"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Temsilci ekranındaki ~5sn'lik otomatik yenileme için: tüm talepleri döner. */
export async function getAllTickets() {
  const session = await auth();
  const userRole = session?.user?.role;
  if (userRole !== "SUPPORT" && userRole !== "ADMIN") {
    return [];
  }

  const tickets = await prisma.supportTicket.findMany({
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return JSON.parse(JSON.stringify(tickets));
}

export async function closeTicket(ticketId: string) {
  const session = await auth();
  const userRole = session?.user?.role;

  if (userRole !== "SUPPORT" && userRole !== "ADMIN") {
    return { success: false, error: "Yetkisiz işlem." };
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: "Destek talebi bulunamadı." };
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: "CLOSED",
    },
  });

  revalidatePath("/destek");
  revalidatePath("/hesap/destek");
  return { success: true };
}
