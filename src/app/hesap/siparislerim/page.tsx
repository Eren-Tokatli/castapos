import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/AccountShell";
import { SiparislerimClient, type OrderRow } from "./SiparislerimClient";

export const dynamic = "force-dynamic";

// Bitiş tarihine bu kadar veya daha az gün kaldıysa "Uzat" butonu gösterilir —
// bkz. hesap/siparislerim/[orderId]/page.tsx (aynı eşik).
const EXTENSION_WINDOW_DAYS = 30;

export default async function OrderHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/siparislerim");
  }

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  // Ödeme tamamlanınca her RENT satırı için otomatik oluşan sözleşme — bitiş
  // tarihi Order'da değil burada tutuluyor (bkz. api/iyzico/callback).
  const rentalAgreements = orders.some((o) => o.items.some((i) => i.saleMode === "RENT"))
    ? await prisma.rentalAgreement.findMany({
        where: { orderReferenceNo: { in: orders.map((o) => o.orderNumber) } },
      })
    : [];
  const now = new Date();

  const productIds = Array.from(
    new Set(orders.flatMap((order) => order.items.map((item) => item.productId)))
  );
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, images: true },
      })
    : [];
  const imageByProductId = new Map(
    products.map((p) => [
      p.id,
      [...p.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url,
    ])
  );

  const orderRows: OrderRow[] = orders.map((order) => {
    const agreement = rentalAgreements.find((a) => a.orderReferenceNo === order.orderNumber);
    const daysLeft = agreement?.rentalEnd
      ? Math.ceil((agreement.rentalEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      total: order.total,
      status: order.status,
      itemsLabel: order.items.map((item) => `${item.name} (${item.quantity} Adet)`).join(", "),
      thumbs: order.items
        .map((item) => imageByProductId.get(item.productId))
        .filter((url): url is string => Boolean(url)),
      extendableRentalAgreementId:
        agreement && daysLeft !== null && daysLeft <= EXTENSION_WINDOW_DAYS ? agreement.id : null,
    };
  });

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : session?.user?.name || "Castapos üyesi";

  return (
    <AccountShell displayName={displayName} email={user?.email || session?.user?.email || ""}>
      <SiparislerimClient orders={orderRows} />
    </AccountShell>
  );
}
