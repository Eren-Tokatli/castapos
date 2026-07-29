import React from "react";
import { prisma } from "@/lib/prisma";
import { AgreementsClient } from "./AgreementsClient";

export const dynamic = "force-dynamic";

export default async function AdminAgreementsPage() {
  // Load agreements along with their installments
  const agreements = await prisma.rentalAgreement.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedAgreements = await Promise.all(
    agreements.map(async (a) => {
      const installments = await prisma.installment.findMany({
        where: { rentalAgreementId: a.id },
        orderBy: { dueDate: "asc" },
      });

      return {
        id: a.id,
        assetName: a.assetName,
        assetSku: a.assetSku,
        tenantName: a.tenantName,
        taxOrNationalId: a.taxOrNationalId,
        rentalTermMonths: a.rentalTermMonths,
        monthlyAmount: a.monthlyAmount,
        rentalStart: a.rentalStart ? a.rentalStart.toISOString() : null,
        rentalEnd: a.rentalEnd ? a.rentalEnd.toISOString() : null,
        deliveryStatus: a.deliveryStatus,
        paymentStatus: a.paymentStatus,
        serialNumber: a.serialNumber,
        phone: a.phone,
        email: a.email,
        address: a.address,
        city: a.city,
        notes: a.notes,
        paymentDueDay: a.paymentDueDay,
        installments: installments.map((i) => ({
          id: i.id,
          dueDate: i.dueDate.toISOString(),
          amount: i.amount,
          paid: i.paid,
          description: i.description,
        })),
      };
    })
  );

  return <AgreementsClient agreements={serializedAgreements} />;
}
