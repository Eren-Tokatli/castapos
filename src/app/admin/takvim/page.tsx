import React from "react";
import { prisma } from "@/lib/prisma";
import { TakvimClient } from "./TakvimClient";

export const dynamic = "force-dynamic";

export default async function AdminTakvimPage() {
  const installments = await prisma.installment.findMany({
    orderBy: { dueDate: "asc" },
  });

  // Eskiden her taksit için ayrı ayrı sözleşme sorgusu atılıyordu (N+1).
  // Tek seferde toplu çekip Map'ten okumak çok daha hızlı.
  const agreementIds = [...new Set(installments.map((i) => i.rentalAgreementId))];
  const agreements = await prisma.rentalAgreement.findMany({
    where: { id: { in: agreementIds } },
    select: { id: true, tenantName: true, assetName: true, phone: true },
  });
  const agreementById = new Map(agreements.map((a) => [a.id, a]));

  const serialized = installments.map((i) => {
    const agreement = agreementById.get(i.rentalAgreementId);
    return {
      id: i.id,
      dueDate: i.dueDate.toISOString(),
      amount: i.amount,
      paid: i.paid,
      description: i.description,
      tenantName: agreement?.tenantName || "Bilinmeyen Müşteri",
      assetName: agreement?.assetName || "Bilinmeyen Cihaz",
      phone: agreement?.phone || "",
    };
  });

  return <TakvimClient installments={serialized} />;
}
