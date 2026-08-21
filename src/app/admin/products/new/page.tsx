import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductFormClient } from "../ProductFormClient";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brandRows] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    }),
  ]);
  const brands = brandRows
    .map((p) => p.brand)
    .filter((b): b is string => !!b)
    .sort((a, b) => a.localeCompare(b, "tr"));

  return <ProductFormClient mode="create" categories={categories} brands={brands} />;
}
