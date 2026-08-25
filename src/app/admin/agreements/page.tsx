import React from "react";
import { prisma } from "@/lib/prisma";
import { AgreementsClient } from "./AgreementsClient";

export const dynamic = "force-dynamic";

export default async function AdminAgreementsPage() {
  // Load agreements along with their installments
  const agreements = await prisma.rentalAgreement.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Eskiden her sözleşme için ayrı ayrı taksit sorgusu atılıyordu (N+1).
  // Tek seferde toplu çekip sözleşme id'sine göre grupluyoruz.
  const allInstallments = await prisma.installment.findMany({
    where: { rentalAgreementId: { in: agreements.map((a) => a.id) } },
    orderBy: { dueDate: "asc" },
  });
  const installmentsByAgreementId = new Map<string, typeof allInstallments>();
  for (const inst of allInstallments) {
    const list = installmentsByAgreementId.get(inst.rentalAgreementId) || [];
    list.push(inst);
    installmentsByAgreementId.set(inst.rentalAgreementId, list);
  }

  const serializedAgreements = agreements.map((a) => {
    const installments = installmentsByAgreementId.get(a.id) || [];

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
  });

  return <AgreementsClient agreements={serializedAgreements} />;
}
