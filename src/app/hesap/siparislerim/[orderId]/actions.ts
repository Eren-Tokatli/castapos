"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function submitReview(input: {
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  rating: number;
  comment: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Giriş yapmalısınız." };

  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Lütfen 1-5 arası bir puan seç." };
  }
  if (!input.comment.trim()) {
    return { success: false, error: "Yorum boş olamaz." };
  }

  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order || order.userId !== userId) {
    return { success: false, error: "Sipariş bulunamadı." };
  }
  if (order.status !== "PAID") {
    return { success: false, error: "Sadece tamamlanmış siparişler değerlendirilebilir." };
  }
  const hasProduct = order.items.some((i) => i.productId === input.productId);
  if (!hasProduct) {
    return { success: false, error: "Ürün bu siparişte bulunamadı." };
  }

  const existing = await prisma.review.findFirst({
    where: { userId, productId: input.productId, orderId: input.orderId },
  });
  if (existing) {
    return { success: false, error: "Bu ürünü bu sipariş için zaten değerlendirdin." };
  }

  await prisma.review.create({
    data: {
      userId,
      productId: input.productId,
      productName: input.productName,
      productImage: input.productImage,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment.trim(),
    },
  });

  revalidatePath(`/hesap/siparislerim/${input.orderId}`);
  revalidatePath("/hesap/degerlendirmelerim");
  revalidatePath("/admin/degerlendirmeler");
  return { success: true };
}
