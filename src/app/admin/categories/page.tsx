import React from "react";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.product.findMany({ select: { categoryIds: true } }),
  ]);

  // Kategori başına ürün sayısını tek sorguda topla (N+1'den kaçınmak için).
  const productCountByCategory = new Map<string, number>();
  for (const product of products) {
    for (const categoryId of product.categoryIds) {
      productCountByCategory.set(categoryId, (productCountByCategory.get(categoryId) || 0) + 1);
    }
  }

  const serialized = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    parentId: c.parentId,
    sortOrder: c.sortOrder,
    imageUrl: c.imageUrl,
    productCount: productCountByCategory.get(c.id) || 0,
  }));

  return <CategoriesClient categories={serialized} />;
}
