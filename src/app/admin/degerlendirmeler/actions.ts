"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

export async function deleteReview(id: string) {
  try {
    await requireAdmin();

    await prisma.review.delete({ where: { id } });

    revalidatePath("/admin/degerlendirmeler");
    revalidatePath("/hesap/degerlendirmelerim");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Review Action Error:", error);
    return { success: false, error: error.message || "Değerlendirme silinemedi." };
  }
}

async function setReviewStatus(id: string, status: "PENDING" | "APPROVED" | "REJECTED") {
  try {
    await requireAdmin();

    await prisma.review.update({ where: { id }, data: { status } });

    revalidatePath("/admin/degerlendirmeler");
    revalidatePath("/hesap/degerlendirmelerim");
    return { success: true };
  } catch (error: any) {
    console.error("Set Review Status Action Error:", error);
    return { success: false, error: error.message || "Durum güncellenemedi." };
  }
}

export async function approveReview(id: string) {
  return setReviewStatus(id, "APPROVED");
}

export async function rejectReview(id: string) {
  return setReviewStatus(id, "REJECTED");
}
