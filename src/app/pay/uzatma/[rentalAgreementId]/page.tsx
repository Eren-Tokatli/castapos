import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UzatmaPayClient } from "./UzatmaPayClient";

export const dynamic = "force-dynamic";

export default async function ExtendRentalPaymentPage({
  params,
}: {
  params: Promise<{ rentalAgreementId: string }>;
}) {
  const { rentalAgreementId } = await params;

  const agreement = await prisma.rentalAgreement.findUnique({
    where: { id: rentalAgreementId },
  });

  if (!agreement) {
    notFound();
  }

  const product = agreement.assetSku
    ? await prisma.product.findUnique({ where: { sku: agreement.assetSku } })
    : null;

  const tiers = (product?.rentalTiers || [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => ({
      label: t.label,
      durationMonths: t.durationMonths,
      price: t.price,
    }));

  const data = {
    rentalAgreementId: agreement.id,
    tenantName: agreement.tenantName,
    assetName: agreement.assetName,
    rentalEnd: agreement.rentalEnd ? agreement.rentalEnd.toISOString() : null,
    tiers,
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <UzatmaPayClient agreement={JSON.parse(JSON.stringify(data))} />
    </main>
  );
}
