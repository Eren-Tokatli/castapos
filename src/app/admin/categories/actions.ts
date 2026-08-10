"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string; // "" = kök kategori
  sortOrder: string;
  imageUrl: string;
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

function buildCategoryData(data: CategoryFormData) {
  return {
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description.trim() || undefined,
    parentId: data.parentId || undefined,
    sortOrder: parseInt(data.sortOrder, 10) || 0,
    imageUrl: data.imageUrl.trim() || undefined,
  };
}

export async function createCategory(data: CategoryFormData) {
  try {
    await requireAdmin();

    if (!data.name.trim() || !data.slug.trim()) {
      return { success: false, error: "Kategori adı ve slug zorunludur." };
    }

    const category = await prisma.category.create({
      data: buildCategoryData(data),
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true, id: category.id };
  } catch (error: any) {
    console.error("Create Category Action Error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Bu slug zaten kullanılıyor." };
    }
    return { success: false, error: error.message || "Kategori oluşturulamadı." };
  }
}

export async function updateCategory(id: string, data: CategoryFormData) {
  try {
    await requireAdmin();

    if (!data.name.trim() || !data.slug.trim()) {
      return { success: false, error: "Kategori adı ve slug zorunludur." };
    }
    if (data.parentId === id) {
      return { success: false, error: "Bir kategori kendi üst kategorisi olamaz." };
    }

    await prisma.category.update({
      where: { id },
      data: buildCategoryData(data),
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Update Category Action Error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Bu slug zaten kullanılıyor." };
    }
    return { success: false, error: error.message || "Kategori güncellenemedi." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();

    const productCount = await prisma.product.count({
      where: { categoryIds: { has: id } },
    });
    if (productCount > 0) {
      return {
        success: false,
        error: `Bu kategoride ${productCount} ürün var. Önce ürünleri başka kategoriye taşı ya da kaldır.`,
      };
    }

    const childCount = await prisma.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return {
        success: false,
        error: `Bu kategorinin ${childCount} alt kategorisi var. Önce onları sil ya da taşı.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Category Action Error:", error);
    return { success: false, error: error.message || "Kategori silinemedi." };
  }
}
