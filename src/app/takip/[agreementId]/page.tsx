import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AgreementDetailClient } from "./AgreementDetailClient";

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ agreementId: string }>;
}) {
  const { agreementId } = await params;
  const cookieStore = await cookies();
  const takipTc = cookieStore.get("takip_tc")?.value;

  if (!takipTc) {
    redirect("/takip");
  }

  // Load agreement
  const agreement = await prisma.rentalAgreement.findUnique({
    where: { id: agreementId },
  });

  if (!agreement) {
    redirect("/takip");
  }

  // Security check: ensure TC matches
  if (agreement.taxOrNationalId !== takipTc) {
    redirect("/takip");
  }

  // Load installments
  const installments = await prisma.installment.findMany({
    where: { rentalAgreementId: agreementId },
    orderBy: { dueDate: "asc" },
  });

  // Map to matching serialization-friendly structure
  const serializedAgreement = {
    id: agreement.id,
    assetName: agreement.assetName,
    assetSku: agreement.assetSku,
    tenantName: agreement.tenantName,
    rentalTermMonths: agreement.rentalTermMonths,
    monthlyAmount: agreement.monthlyAmount,
    rentalStart: agreement.rentalStart ? agreement.rentalStart.toISOString() : null,
    rentalEnd: agreement.rentalEnd ? agreement.rentalEnd.toISOString() : null,
    deliveryStatus: agreement.deliveryStatus,
    paymentStatus: agreement.paymentStatus,
    serialNumber: agreement.serialNumber,
    phone: agreement.phone,
    email: agreement.email,
    address: agreement.address,
    city: agreement.city,
  };

  const serializedInstallments = installments.map((inst) => ({
    id: inst.id,
    dueDate: inst.dueDate.toISOString(),
    amount: inst.amount,
    paid: inst.paid,
    description: inst.description,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <AgreementDetailClient
          agreement={serializedAgreement}
          installments={serializedInstallments}
        />
      </div>
    </div>
  );
}
