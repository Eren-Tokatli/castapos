"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(form: {
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  if (!form.firstName.trim() || !form.lastName.trim()) {
    return { success: false, error: "Ad ve soyad boş bırakılamaz." };
  }

  if (form.phone && form.phone.length !== 10) {
    return { success: false, error: "Telefon numarası 10 hane olmalıdır (Örn: 5051234567)." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || null,
    },
  });

  revalidatePath("/hesap/kullanici-bilgilerim");
  return { success: true };
}

export async function changePassword(form: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  if (form.newPassword.length < 8) {
    return { success: false, error: "Yeni şifre en az 8 karakter olmalıdır." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: "Kullanıcı bulunamadı." };
  }

  const valid = await bcrypt.compare(form.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Mevcut şifre yanlış." };
  }

  const passwordHash = await bcrypt.hash(form.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { success: true };
}
