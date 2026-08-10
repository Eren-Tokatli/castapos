import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/AccountShell";
import { KullaniciBilgilerimClient } from "./KullaniciBilgilerimClient";

export const dynamic = "force-dynamic";

export default async function KullaniciBilgilerimPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/kullanici-bilgilerim");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  });

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : session?.user?.name || "Castapos üyesi";

  return (
    <AccountShell displayName={displayName} email={user?.email || session?.user?.email || ""}>
      <KullaniciBilgilerimClient
        initialFirstName={user?.firstName || ""}
        initialLastName={user?.lastName || ""}
        initialEmail={user?.email || session?.user?.email || ""}
        initialPhone={user?.phone || ""}
        initialAddresses={JSON.parse(JSON.stringify(user?.customerProfile?.addresses || []))}
      />
    </AccountShell>
  );
}
