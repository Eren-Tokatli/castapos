"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function addAddress(form: {
  label?: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  province?: string;
  country: string;
  deliveryPhone?: string;
  directions?: string;
  isDefault: boolean;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  // Basic validation
  if (
    !form.firstName.trim() ||
    !form.lastName.trim() ||
    !form.addressLine1.trim() ||
    !form.province?.trim() ||
    !form.city.trim() ||
    !form.postcode.trim()
  ) {
    return { success: false, error: "Gerekli alanları doldurun." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  });

  if (!user || !user.customerProfile) {
    return { success: false, error: "Profil bulunamadı." };
  }

  const existingAddresses = user.customerProfile.addresses || [];

  // Create new address object matching the Address composite type
  const newAddress = {
    label: form.label?.trim() || null,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    company: form.company?.trim() || null,
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2?.trim() || null,
    city: form.city.trim(),
    postcode: form.postcode.trim(),
    province: form.province?.trim() || null,
    country: form.country || "Türkiye",
    deliveryPhone: form.deliveryPhone?.trim() || null,
    directions: form.directions?.trim() || null,
    isDefault: form.isDefault,
  };

  let updatedAddresses = [...existingAddresses];

  // If this is set to default, set all others to false
  if (form.isDefault) {
    updatedAddresses = updatedAddresses.map((addr) => ({
      ...addr,
      isDefault: false,
    }));
  }

  // If this is the first address, force it to be default
  if (updatedAddresses.length === 0) {
    newAddress.isDefault = true;
  }

  updatedAddresses.push(newAddress);

  await prisma.customerProfile.update({
    where: { userId },
    data: {
      addresses: updatedAddresses,
    },
  });

  revalidatePath("/hesap/adreslerim");
  return { success: true };
}

export async function deleteAddress(index: number) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  });

  if (!user || !user.customerProfile) {
    return { success: false, error: "Profil bulunamadı." };
  }

  const existingAddresses = user.customerProfile.addresses || [];
  if (index < 0 || index >= existingAddresses.length) {
    return { success: false, error: "Geçersiz adres dizini." };
  }

  const wasDefault = existingAddresses[index].isDefault;
  const updatedAddresses = existingAddresses.filter((_, i) => i !== index);

  // If we deleted the default address and there are remaining addresses, make the first one default
  if (wasDefault && updatedAddresses.length > 0) {
    updatedAddresses[0].isDefault = true;
  }

  await prisma.customerProfile.update({
    where: { userId },
    data: {
      addresses: updatedAddresses,
    },
  });

  revalidatePath("/hesap/adreslerim");
  return { success: true };
}

export async function setDefaultAddress(index: number) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  });

  if (!user || !user.customerProfile) {
    return { success: false, error: "Profil bulunamadı." };
  }

  const existingAddresses = user.customerProfile.addresses || [];
  if (index < 0 || index >= existingAddresses.length) {
    return { success: false, error: "Geçersiz adres dizini." };
  }

  const updatedAddresses = existingAddresses.map((addr, i) => ({
    ...addr,
    isDefault: i === index,
  }));

  await prisma.customerProfile.update({
    where: { userId },
    data: {
      addresses: updatedAddresses,
    },
  });

  revalidatePath("/hesap/adreslerim");
  return { success: true };
}
