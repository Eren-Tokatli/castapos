"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createTicket(subject: string, description: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  if (!subject.trim() || !description.trim()) {
    return { success: false, error: "Konu ve açıklama gereklidir." };
  }

  await prisma.supportTicket.create({
    data: {
      userId,
      subject: subject.trim(),
      description: description.trim(),
      status: "OPEN",
    },
  });

  revalidatePath("/hesap/destek");
  return { success: true };
}

export async function addMessageToTicket(ticketId: string, message: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const userName = session?.user?.name || "Müşteri";

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  if (!message.trim()) {
    return { success: false, error: "Mesaj boş olamaz." };
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: "Destek talebi bulunamadı." };
  }

  // Ensure user owns the ticket OR is support/admin
  const isAgent = session?.user?.role === "SUPPORT" || session?.user?.role === "ADMIN";
  if (ticket.userId !== userId && !isAgent) {
    return { success: false, error: "Yetkisiz işlem." };
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: isAgent ? "IN_PROGRESS" : "OPEN", // Mark status appropriately
      messages: {
        push: {
          senderId: userId,
          senderName: userName,
          message: message.trim(),
          createdAt: new Date(),
        },
      },
    },
  });

  revalidatePath("/hesap/destek");
  revalidatePath(`/destek/${ticketId}`);
  return { success: true };
}
