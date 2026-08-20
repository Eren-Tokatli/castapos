import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TaksitPayClient } from "./TaksitPayClient";

export const dynamic = "force-dynamic";

export default async function InstallmentPaymentPage({
  params,
}: {
  params: Promise<{ installmentId: string }>;
}) {
  const { installmentId } = await params;

  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
  });

  if (!installment) {
    notFound();
  }

  const agreement = await prisma.rentalAgreement.findUnique({
    where: { id: installment.rentalAgreementId },
  });

  if (!agreement) {
    notFound();
  }

  const data = {
    id: installment.id,
    amount: installment.amount,
    description: installment.description,
    dueDate: installment.dueDate.toISOString(),
    paid: installment.paid,
    tenantName: agreement.tenantName,
    assetName: agreement.assetName,
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <TaksitPayClient installment={JSON.parse(JSON.stringify(data))} />
    </main>
  );
}
