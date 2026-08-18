"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGuestSession } from "@/lib/guest-session";

export async function createTicket(
  subject: string,
  description: string,
  context?: {
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    productName?: string;
    reasonCode?: string;
    reasonLabel?: string;
  }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  if (!subject.trim() || !description.trim()) {
    return { success: false, error: "Konu ve açıklama gereklidir." };
  }

  // Verify the referenced order actually belongs to this user before trusting
  // the client-supplied context.
  let verifiedOrderId: string | undefined;
  let verifiedOrderNumber: string | undefined;
  if (context?.orderId) {
    const order = await prisma.order.findUnique({ where: { id: context.orderId } });
    if (order && order.userId === userId) {
      verifiedOrderId = order.id;
      verifiedOrderNumber = order.orderNumber;
    }
  }

  await prisma.supportTicket.create({
    data: {
      userId,
      subject: subject.trim(),
      description: description.trim(),
      status: "OPEN",
      orderId: verifiedOrderId,
      orderNumber: verifiedOrderNumber,
      productId: context?.productId,
      productName: context?.productName,
      reasonCode: context?.reasonCode,
      reasonLabel: context?.reasonLabel,
    },
  });

  revalidatePath("/hesap/destek");
  return { success: true };
}

export async function addMessageToTicket(ticketId: string, message: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const userName = session?.user?.name || "Müşteri";
  const isAgent = session?.user?.role === "SUPPORT" || session?.user?.role === "ADMIN";

  if (!message.trim()) {
    return { success: false, error: "Mesaj boş olamaz." };
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: "Destek talebi bulunamadı." };
  }

  // Giriş yapmış kullanıcı/temsilci mi, yoksa aynı tarayıcıdaki misafir mi?
  let senderId: string;
  let senderName: string;
  let senderRole: "CUSTOMER" | "GUEST" | "AGENT";

  if (userId) {
    if (ticket.userId !== userId && !isAgent) {
      return { success: false, error: "Yetkisiz işlem." };
    }
    senderId = userId;
    senderName = userName;
    senderRole = isAgent ? "AGENT" : "CUSTOMER";
  } else {
    // Giriş yapmamış — sadece kendi misafir sohbetine yazabilir.
    const guestSession = await getGuestSession();
    if (!guestSession.guestId || ticket.guestSessionId !== guestSession.guestId) {
      return { success: false, error: "Giriş yapmalısınız." };
    }
    senderId = guestSession.guestId;
    senderName = guestSession.guestName || ticket.guestName || "Ziyaretçi";
    senderRole = "GUEST";
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: isAgent ? "IN_PROGRESS" : "OPEN", // Mark status appropriately
      messages: {
        push: {
          senderId,
          senderName,
          senderRole,
          message: message.trim(),
          createdAt: new Date(),
        },
      },
    },
  });

  revalidatePath("/hesap/destek");
  revalidatePath("/destek");
  revalidatePath("/admin/canli-destek");
  return { success: true };
}

// ---------- Canlı destek (widget) — giriş şart değil ----------

/** Mevcut kullanıcının/ziyaretçinin açık "canlı destek" görüşmesini döner (varsa). */
export async function getMyLiveTicket() {
  const session = await auth();
  const userId = session?.user?.id;

  let ticket;
  if (userId) {
    ticket = await prisma.supportTicket.findFirst({
      where: { userId, reasonCode: "CANLI_DESTEK", status: { not: "CLOSED" } },
      orderBy: { createdAt: "desc" },
    });
  } else {
    const guestSession = await getGuestSession();
    if (!guestSession.guestId) return null;
    ticket = await prisma.supportTicket.findFirst({
      where: { guestSessionId: guestSession.guestId, reasonCode: "CANLI_DESTEK", status: { not: "CLOSED" } },
      orderBy: { createdAt: "desc" },
    });
  }

  return ticket ? JSON.parse(JSON.stringify(ticket)) : null;
}

/** Widget'tan ilk mesaj gönderildiğinde yeni bir canlı destek talebi açar. */
export async function startLiveChat(message: string, guestName?: string) {
  if (!message.trim()) {
    return { success: false, error: "Mesaj boş olamaz." };
  }

  const session = await auth();
  const userId = session?.user?.id;

  const base = {
    subject: "Canlı Destek",
    description: message.trim(),
    status: "OPEN",
    reasonCode: "CANLI_DESTEK",
    reasonLabel: "Canlı Destek (Genel Soru)",
  };

  const ticket = userId
    ? await prisma.supportTicket.create({ data: { ...base, userId } })
    : await (async () => {
        // Tek bir session nesnesi üzerinden hem guestId hem guestName
        // ayarlanmalı — ayrı ayrı getGuestSession() çağrıları farklı
        // nesneler döner ve ikinci save() ilkinin yazdığı guestId'yi
        // çerezden siler.
        const guestSession = await getGuestSession();
        if (!guestSession.guestId) {
          guestSession.guestId = crypto.randomUUID();
        }
        const guestId = guestSession.guestId;
        const displayName = guestName?.trim() || "Ziyaretçi";
        guestSession.guestName = displayName;
        await guestSession.save();
        return prisma.supportTicket.create({
          data: { ...base, userId: null, guestSessionId: guestId, guestName: displayName },
        });
      })();

  revalidatePath("/destek");
  revalidatePath("/admin/canli-destek");
  return { success: true, ticket: JSON.parse(JSON.stringify(ticket)) };
}

/** Polling için: tek bir talebin güncel halini (mesajlar dahil) döner. */
export async function getLiveTicket(ticketId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const isAgent = session?.user?.role === "SUPPORT" || session?.user?.role === "ADMIN";

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return null;

  if (!isAgent) {
    if (userId) {
      if (ticket.userId !== userId) return null;
    } else {
      const guestSession = await getGuestSession();
      if (!guestSession.guestId || ticket.guestSessionId !== guestSession.guestId) return null;
    }
  }

  return JSON.parse(JSON.stringify(ticket));
}
