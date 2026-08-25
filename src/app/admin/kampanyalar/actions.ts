"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface CouponFormData {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  amount: string;
  active: boolean;
  expiresAt: string; // "" = süresiz, yyyy-mm-dd
  usageLimit: string; // "" = sınırsız
  usageLimitPerUser: string; // "" = sınırsız
  minCartTotal: string; // "" = şart yok
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

function buildCouponData(data: CouponFormData) {
  const amount = parseFloat(data.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Geçerli bir indirim tutarı gir.");
  }
  if (data.discountType === "PERCENTAGE" && amount > 100) {
    throw new Error("Yüzde indirim 100'den büyük olamaz.");
  }

  return {
    code: data.code.trim().toUpperCase(),
    description: data.description.trim() || undefined,
    discountType: data.discountType,
    amount,
    active: data.active,
    expiresAt: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59`) : undefined,
    usageLimit: data.usageLimit.trim() ? parseInt(data.usageLimit, 10) : undefined,
    usageLimitPerUser: data.usageLimitPerUser.trim() ? parseInt(data.usageLimitPerUser, 10) : undefined,
    minCartTotal: data.minCartTotal.trim() ? parseFloat(data.minCartTotal) : undefined,
  };
}

export async function createCoupon(data: CouponFormData) {
  try {
    await requireAdmin();

    if (!data.code.trim()) {
      return { success: false, error: "Kupon kodu zorunludur." };
    }

    const coupon = await prisma.coupon.create({ data: buildCouponData(data) });

    revalidatePath("/admin/kampanyalar");
    return { success: true, id: coupon.id };
  } catch (error: any) {
    console.error("Create Coupon Action Error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Bu kupon kodu zaten kullanılıyor." };
    }
    return { success: false, error: error.message || "Kupon oluşturulamadı." };
  }
}

export async function updateCoupon(id: string, data: CouponFormData) {
  try {
    await requireAdmin();

    if (!data.code.trim()) {
      return { success: false, error: "Kupon kodu zorunludur." };
    }

    await prisma.coupon.update({ where: { id }, data: buildCouponData(data) });

    revalidatePath("/admin/kampanyalar");
    return { success: true };
  } catch (error: any) {
    console.error("Update Coupon Action Error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Bu kupon kodu zaten kullanılıyor." };
    }
    return { success: false, error: error.message || "Kupon güncellenemedi." };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await requireAdmin();

    await prisma.coupon.delete({ where: { id } });
    // Geçmiş kullanım kayıtları (CouponRedemption) kasıtlı olarak silinmiyor —
    // kupon kaldırılsa bile "bu kod ne kadar ciro getirmişti" raporu kalıcı.

    revalidatePath("/admin/kampanyalar");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Coupon Action Error:", error);
    return { success: false, error: error.message || "Kupon silinemedi." };
  }
}
