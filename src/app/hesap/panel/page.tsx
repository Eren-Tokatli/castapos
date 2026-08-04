import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountPanelClient } from "./AccountPanelClient";

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/hesap/giris?callbackUrl=/hesap/panel");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }
  if (session.user.role === "SUPPORT") {
    redirect("/destek");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : session.user.name || "Castapos üyesi";

  return (
    <AccountPanelClient
      displayName={displayName}
      email={user?.email || session.user.email || ""}
    />
  );
}
