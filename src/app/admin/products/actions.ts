"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface ProductFormData {
  name: string;
  sku: string;
  slug: string;
  brand: string;
  description: string;
  quantity: string;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  status: "ACTIVE" | "INACTIVE";
  categoryIds: string[];
  images: { url: string; alt: string }[];
  specs: { label: string; value: string }[];
  metaTitle: string;
  metaDescription: string;
  rentalTiers: { label: string; durationMonths: string; price: string; originalPrice: string }[];
  options: {
    name: string;
    type: "SELECT" | "RADIO" | "CHECKBOX" | "TEXT";
    required: boolean;
    values: { label: string; priceModifier: string; priceModifierType: "FIXED" | "PERCENT"; colorHex: string; imageUrl: string }[];
  }[];
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

function buildProductData(data: ProductFormData) {
  return {
    name: data.name.trim(),
    sku: data.sku.trim(),
    slug: data.slug.trim(),
    description: data.description.trim() || undefined,
    brand: data.brand.trim() || undefined,
    metaTitle: data.metaTitle.trim() || undefined,
    metaDescription: data.metaDescription.trim() || undefined,
    saleMode: "RENT" as const,
    buyPrice: null,
    buySpecialPrice: null,
    quantity: parseInt(data.quantity, 10) || 0,
    stockStatus: data.stockStatus,
    status: data.status === "ACTIVE",
    categoryIds: data.categoryIds,
    // Admin panelde artık alt metin girilmiyor (kaldırıldı) — erişilebilirlik
    // için tamamen boş kalmasın diye ürün adıyla otomatik dolduruluyor.
    images: data.images
      .filter((img) => img.url.trim())
      .map((img, i) => ({ url: img.url.trim(), alt: img.alt.trim() || data.name.trim() || undefined, sortOrder: i })),
    specs: data.specs
      .filter((s) => s.label.trim())
      .map((s, i) => ({ label: s.label.trim(), value: s.value.trim(), sortOrder: i })),
    rentalTiers: data.rentalTiers
      .filter((t) => t.label.trim())
      .map((t, i) => ({
        label: t.label.trim(),
        durationMonths: parseInt(t.durationMonths, 10) || 0,
        price: parseFloat(t.price) || 0,
        originalPrice: t.originalPrice ? parseFloat(t.originalPrice) : null,
        sortOrder: i,
      })),
    options: data.options
      .filter((o) => o.name.trim())
      .map((o, i) => ({
        name: o.name.trim(),
        type: o.type,
        required: o.required,
        sortOrder: i,
        values: o.values
          .filter((v) => v.label.trim())
          .map((v, j) => ({
            label: v.label.trim(),
            priceModifier: parseFloat(v.priceModifier) || 0,
            priceModifierType: v.priceModifierType,
            colorHex: v.colorHex.trim() || undefined,
            imageUrl: v.imageUrl.trim() || undefined,
            sortOrder: j,
          })),
      })),
  };
}

export async function createProduct(data: ProductFormData) {
  try {
    await requireAdmin();

    const product = await prisma.product.create({
      data: buildProductData(data),
    });

    revalidatePath("/admin/products");
    return { success: true, id: product.id };
  } catch (error: any) {
    console.error("Create Product Action Error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Bu SKU veya slug zaten kullanılıyor." };
    }
    return { success: false, error: error.message || "Ürün oluşturulamadı." };
  }
}

export async function updateFullProduct(id: string, data: ProductFormData) {
  try {
    await requireAdmin();

    await prisma.product.update({
      where: { id },
      data: buildProductData(data),
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update Full Product Action Error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Bu SKU veya slug zaten kullanılıyor." };
    }
    return { success: false, error: error.message || "Ürün güncellenemedi." };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    await requireAdmin();
    const { quantity, stockStatus, status } = data;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        quantity: parseInt(quantity) || 0,
        stockStatus,
        status: status === "ACTIVE",
      },
    });

    revalidatePath("/admin/products");
    return { success: true, product: updated };
  } catch (error: any) {
    console.error("Update Product Action Error:", error);
    return { success: false, error: error.message || "Güncelleme hatası oluştu." };
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
