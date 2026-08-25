import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./ProductsClient";
import { CartesianBarChart } from "../_components/CartesianBarChart";
import { CartesianLineChart } from "../_components/CartesianLineChart";
import { bucketByDay, daysAgo } from "../_components/chart-data";
import { Package, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Üç sorgu da birbirinden bağımsız — sıralı await yerine paralel (bkz.
  // Dashboard/Siparişler'deki aynı düzeltme).
  const [products, paidOrdersForProducts, paidOrdersLast14Days] = await Promise.all([
    // Liste sadece birkaç alanı gösteriyor (bkz. serializedProducts) ama
    // select vermeden sorgulanınca 103 ürünün TÜMÜ (görseller, özellikler,
    // seçenekler dahil) çekiliyordu — bu sayfayı diğerlerinden gözle görülür
    // yavaş yapan asıl sebep buydu. Sadece kullanılan alanları çekiyoruz.
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        sku: true,
        name: true,
        quantity: true,
        stockStatus: true,
        status: true,
        rentalTiers: { select: { label: true, price: true } },
      },
    }),
    // En çok kiralanan ürünler için: tüm zamanların ödenmiş siparişleri.
    prisma.order.findMany({ where: { status: "PAID" }, select: { items: true } }),
    // Günlük satış adedi için: son 14 günün ödenmiş siparişleri.
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: daysAgo(14) } },
      select: { items: true, createdAt: true },
    }),
  ]);

  const serializedProducts = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    quantity: p.quantity,
    stockStatus: p.stockStatus,
    status: p.status,
    rentalTiers: p.rentalTiers.map((tier) => ({
      label: tier.label,
      price: tier.price,
    })),
  }));

  const productQuantities = new Map<string, number>();
  for (const order of paidOrdersForProducts) {
    for (const item of order.items) {
      productQuantities.set(item.name, (productQuantities.get(item.name) || 0) + item.quantity);
    }
  }
  const topProducts = [...productQuantities.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({
      label: name.length > 14 ? `${name.slice(0, 13)}…` : name,
      value: qty,
    }));

  const dailyUnitsSold = bucketByDay(
    paidOrdersLast14Days,
    (o) => o.createdAt,
    (o) => o.items.reduce((sum, i) => sum + i.quantity, 0),
    14
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-orange-500" />
            <h3 className="font-bold text-slate-800 text-sm">En Çok Kiralanan Ürünler (Adet)</h3>
          </div>
          <CartesianBarChart data={topProducts} barColor="#f97316" formatValue={(v) => `${v}`} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Günlük Satılan Ürün Adedi (Son 14 Gün)</h3>
          </div>
          <CartesianLineChart data={dailyUnitsSold} formatValue={(v) => `${v}`} height={200} />
        </div>
      </div>

      <ProductsClient products={serializedProducts} />
    </div>
  );
}
