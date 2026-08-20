import React from "react";
import { prisma } from "@/lib/prisma";
import { PaymentsClient } from "./PaymentsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  // Fetch payment logs
  const payments = await prisma.paymentRecord.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    kind: p.kind,
    payerName: p.payerName,
    payerEmail: p.payerEmail,
    payerPhone: p.payerPhone,
    amount: p.amount,
    description: p.description,
    iyzicoToken: p.iyzicoToken,
    iyzicoPaymentId: p.iyzicoPaymentId,
    status: p.status,
    errorMessage: p.errorMessage,
    createdAt: p.createdAt.toISOString(),
  }));

  // Fetch custom payment links
  const paymentLinks = await prisma.paymentLink.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedLinks = paymentLinks.map((link) => ({
    id: link.id,
    token: link.token,
    payerName: link.payerName,
    payerEmail: link.payerEmail,
    payerPhone: link.payerPhone,
    amount: link.amount,
    description: link.description,
    paid: link.paid,
    installmentId: link.installmentId,
    createdAt: link.createdAt.toISOString(),
  }));

  return (
    <PaymentsClient
      payments={serializedPayments}
      paymentLinks={serializedLinks}
    />
  );
}
