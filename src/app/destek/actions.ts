"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
