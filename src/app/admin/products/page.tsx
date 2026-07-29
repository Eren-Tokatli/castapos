import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedProducts = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    saleMode: p.saleMode,
    buyPrice: p.buyPrice,
    buySpecialPrice: p.buySpecialPrice,
    quantity: p.quantity,
    stockStatus: p.stockStatus,
    status: p.status,
    rentalTiers: p.rentalTiers.map((tier) => ({
      label: tier.label,
      price: tier.price,
    })),
  }));

  return <ProductsClient products={serializedProducts} />;
}
