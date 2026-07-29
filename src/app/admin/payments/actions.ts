"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createPaymentLink(form: {
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  amount: number;
  description: string;
}) {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "ADMIN") {
    return { success: false, error: "Yetkisiz işlem." };
  }

  if (!form.payerName.trim() || !form.payerEmail.trim() || !form.description.trim() || form.amount <= 0) {
    return { success: false, error: "Lütfen tüm gerekli alanları eksiksiz ve geçerli doldurun." };
  }

  // Generate unique secure token
  const token = crypto.randomBytes(16).toString("hex");

  await prisma.paymentLink.create({
    data: {
      token,
      payerName: form.payerName.trim(),
      payerEmail: form.payerEmail.trim(),
      payerPhone: form.payerPhone?.trim() || null,
      amount: form.amount,
      description: form.description.trim(),
      paid: false,
    },
  });

  revalidatePath("/admin/payments");
  return { success: true, token };
}

export async function deletePaymentLink(id: string) {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "ADMIN") {
    return { success: false, error: "Yetkisiz işlem." };
  }

  await prisma.paymentLink.delete({
    where: { id },
  });

  revalidatePath("/admin/payments");
  return { success: true };
}
