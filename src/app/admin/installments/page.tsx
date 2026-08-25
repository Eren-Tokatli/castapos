import React from "react";
import { prisma } from "@/lib/prisma";
import { InstallmentsClient } from "./InstallmentsClient";

export const dynamic = "force-dynamic";

export default async function AdminInstallmentsPage() {
  // Load unpaid installments and fetch linked agreements
  const installments = await prisma.installment.findMany({
    orderBy: { dueDate: "asc" },
  });

  // Eskiden her taksit için ayrı ayrı sözleşme sorgusu atılıyordu (N+1 —
  // 50 taksit varsa 50 ek sorgu, Promise.all ile paralel olsa da hepsi
  // Mongo Atlas'a ayrı ayrı gidip geliyordu). Tek seferde toplu çekip
  // Map'ten okumak çok daha hızlı.
  const agreementIds = [...new Set(installments.map((i) => i.rentalAgreementId))];
  const agreements = await prisma.rentalAgreement.findMany({
    where: { id: { in: agreementIds } },
    select: { id: true, tenantName: true, assetName: true, phone: true },
  });
  const agreementById = new Map(agreements.map((a) => [a.id, a]));

  const serializedInstallments = installments.map((i) => {
    const agreement = agreementById.get(i.rentalAgreementId);
    return {
      id: i.id,
      dueDate: i.dueDate.toISOString(),
      amount: i.amount,
      paid: i.paid,
      description: i.description,
      agreementId: i.rentalAgreementId,
      tenantName: agreement?.tenantName || "Bilinmeyen Müşteri",
      assetName: agreement?.assetName || "Bilinmeyen Cihaz",
      phone: agreement?.phone || "",
    };
  });

  return <InstallmentsClient initialInstallments={serializedInstallments} />;
}
