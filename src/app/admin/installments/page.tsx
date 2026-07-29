import React from "react";
import { prisma } from "@/lib/prisma";
import { InstallmentsClient } from "./InstallmentsClient";

export const dynamic = "force-dynamic";

export default async function AdminInstallmentsPage() {
  // Load unpaid installments and fetch linked agreements
  const installments = await prisma.installment.findMany({
    orderBy: { dueDate: "asc" },
  });

  const serializedInstallments = await Promise.all(
    installments.map(async (i) => {
      const agreement = await prisma.rentalAgreement.findUnique({
        where: { id: i.rentalAgreementId },
        select: {
          tenantName: true,
          assetName: true,
        },
      });

      return {
        id: i.id,
        dueDate: i.dueDate.toISOString(),
        amount: i.amount,
        paid: i.paid,
        description: i.description,
        agreementId: i.rentalAgreementId,
        tenantName: agreement?.tenantName || "Bilinmeyen Müşteri",
        assetName: agreement?.assetName || "Bilinmeyen Cihaz",
      };
    })
  );

  return <InstallmentsClient initialInstallments={serializedInstallments} />;
}
