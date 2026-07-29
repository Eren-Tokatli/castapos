import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PayLinkClient } from "./PayLinkClient";

export const dynamic = "force-dynamic";

export default async function PaymentLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const paylink = await prisma.paymentLink.findUnique({
    where: { token },
  });

  if (!paylink) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <PayLinkClient paylink={JSON.parse(JSON.stringify(paylink))} />
    </main>
  );
}
