"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
  return session;
}

export async function updateUserRole(id: string, role: "ADMIN" | "CUSTOMER" | "SUPPORT" | "SELLER") {
  try {
    const session = await requireAdmin();

    if (session.user.id === id && role !== "ADMIN") {
      return { success: false, error: "Kendi yönetici yetkini kaldıramazsın." };
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { success: false, error: "Kullanıcı bulunamadı." };

    if (target.role === "ADMIN" && role !== "ADMIN") {
      const otherAdmins = await prisma.user.count({ where: { role: "ADMIN", id: { not: id } } });
      if (otherAdmins === 0) {
        return { success: false, error: "Son yönetici hesabının rolünü değiştiremezsin." };
      }
    }

    await prisma.user.update({ where: { id }, data: { role } });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Update User Role Action Error:", error);
    return { success: false, error: error.message || "Rol güncellenemedi." };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await requireAdmin();

    if (session.user.id === id) {
      return { success: false, error: "Kendi hesabını silemezsin." };
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { success: false, error: "Kullanıcı bulunamadı." };

    if (target.role === "ADMIN") {
      const otherAdmins = await prisma.user.count({ where: { role: "ADMIN", id: { not: id } } });
      if (otherAdmins === 0) {
        return { success: false, error: "Son yönetici hesabını silemezsin." };
      }
    }

    // User silindiğinde CustomerProfile, StoreProfile, SupportTicket ve Review
    // kayıtları da otomatik silinir (schema.prisma'da onDelete: Cascade).
    // Order kayıtları KORUNUR — finansal/geçmiş kayıt olarak kalır, sadece
    // sahibi artık bulunamaz.
    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Delete User Action Error:", error);
    return { success: false, error: error.message || "Kullanıcı silinemedi." };
  }
}
