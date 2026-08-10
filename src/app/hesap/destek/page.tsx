import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/AccountShell";
import { TicketListClient } from "./TicketListClient";
import type { WizardOrder } from "./NewTicketWizard";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/destek");
  }

  const [user, tickets, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.supportTicket.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const productIds = Array.from(new Set(orders.flatMap((o) => o.items.map((i) => i.productId))));
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, images: true } })
    : [];
  const imageByProductId = new Map(
    products.map((p) => [p.id, [...p.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url])
  );

  const wizardOrders: WizardOrder[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }),
    total: order.total,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: imageByProductId.get(item.productId),
    })),
  }));

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : session?.user?.name || "Castapos üyesi";

  return (
    <AccountShell displayName={displayName} email={user?.email || session?.user?.email || ""}>
      <TicketListClient initialTickets={JSON.parse(JSON.stringify(tickets))} orders={wizardOrders} />
    </AccountShell>
  );
}
