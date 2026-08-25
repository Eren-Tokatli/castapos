import React from "react";
import { prisma } from "@/lib/prisma";
import { CouponsClient } from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const [coupons, redemptions] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    // Her kuponun getirdiği toplam indirim tutarını hesaplamak için — kupon
    // sayısı az olduğundan (kampanya listesi, ürün kataloğu gibi büyümez)
    // tek seferde tüm kayıtları çekip JS'te grupluyoruz.
    prisma.couponRedemption.findMany({ select: { couponId: true, discountAmount: true } }),
  ]);

  const discountByCoupon = new Map<string, number>();
  for (const r of redemptions) {
    discountByCoupon.set(r.couponId, (discountByCoupon.get(r.couponId) || 0) + r.discountAmount);
  }

  const serializedCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    amount: c.amount,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    usageLimit: c.usageLimit,
    usageLimitPerUser: c.usageLimitPerUser,
    minCartTotal: c.minCartTotal,
    usedCount: c.usedCount,
    totalDiscountGiven: discountByCoupon.get(c.id) || 0,
  }));

  return <CouponsClient coupons={serializedCoupons} />;
}
