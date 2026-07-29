"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "ADMIN") {
    return { success: false, error: "Yetkisiz işlem." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "Sipariş bulunamadı." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/hesap/siparislerim/${orderId}`);
  return { success: true };
}
