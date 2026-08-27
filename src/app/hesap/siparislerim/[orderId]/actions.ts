"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail, buildReviewThankYouCouponEmail } from "@/lib/email";

const REVIEW_COUPON_PERCENT = 10;
const REVIEW_COUPON_VALID_MONTHS = 6;

/// Değerlendirme gönderildiğinde teşekkür amaçlı, tek kullanımlık, 6 ay
/// geçerli %10 kupon oluşturur ve müşteriye mail atar (best-effort — mail
/// başarısız olsa bile kupon zaten oluşmuştur, review akışını bloklamaz).
/// Kod üretimi çakışırsa (son derece nadir) birkaç kez tekrar dener.
async function grantReviewCoupon(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + REVIEW_COUPON_VALID_MONTHS);

  let coupon = null;
  for (let attempt = 0; attempt < 5 && !coupon; attempt++) {
    const code = `TESEKKUR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    try {
      coupon = await prisma.coupon.create({
        data: {
          code,
          description: `${user.firstName} ${user.lastName} — değerlendirme teşekkür kuponu`.trim(),
          discountType: "PERCENTAGE",
          amount: REVIEW_COUPON_PERCENT,
          active: true,
          expiresAt,
          usageLimit: 1,
          usageLimitPerUser: 1,
        },
      });
    } catch (error: any) {
      if (error.code !== "P2002") throw error;
    }
  }
  if (!coupon) return;

  try {
    const email = buildReviewThankYouCouponEmail({
      customerName: `${user.firstName} ${user.lastName}`.trim(),
      couponCode: coupon.code,
      expiresAt,
    });
    await sendTransactionalEmail({ to: user.email, ...email });
  } catch (error) {
    console.error("Değerlendirme kuponu e-postası gönderilemedi:", error);
  }
}

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

  await grantReviewCoupon(userId);

  return { success: true };
}
