import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductFormClient } from "../ProductFormClient";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <ProductFormClient mode="create" categories={categories} />;
}
