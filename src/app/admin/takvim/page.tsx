import React from "react";
import { prisma } from "@/lib/prisma";
import { TakvimClient } from "./TakvimClient";

export const dynamic = "force-dynamic";

export default async function AdminTakvimPage() {
  const installments = await prisma.installment.findMany({
    orderBy: { dueDate: "asc" },
  });

  const serialized = await Promise.all(
    installments.map(async (i) => {
      const agreement = await prisma.rentalAgreement.findUnique({
        where: { id: i.rentalAgreementId },
        select: { tenantName: true, assetName: true, phone: true },
      });

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
    })
  );

  return <TakvimClient installments={serialized} />;
}
