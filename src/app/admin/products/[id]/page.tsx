import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductFormClient } from "../ProductFormClient";
import type { ProductFormData } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  const initialData: ProductFormData = {
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description ?? "",
    quantity: product.quantity.toString(),
    stockStatus: product.stockStatus,
    status: product.status ? "ACTIVE" : "INACTIVE",
    categoryIds: product.categoryIds,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
    rentalTiers: product.rentalTiers.map((t) => ({
      label: t.label,
      durationMonths: t.durationMonths.toString(),
      price: t.price.toString(),
      originalPrice: t.originalPrice?.toString() ?? "",
    })),
    options: product.options.map((o) => ({
      name: o.name,
      type: o.type,
      required: o.required,
      values: o.values.map((v) => ({
        label: v.label,
        priceModifier: v.priceModifier.toString(),
        priceModifierType: v.priceModifierType,
        colorHex: v.colorHex ?? "",
        imageUrl: v.imageUrl ?? "",
      })),
    })),
  };

  return <ProductFormClient mode="edit" productId={product.id} categories={categories} initialData={initialData} />;
}
