import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AddressesClient } from "./AddressesClient";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/adreslerim");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  });

  const addresses = user?.customerProfile?.addresses || [];

  return (
    <main className="account-page">
      <section className="account-hero compact-account-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <Link href="/hesap/panel">Hesabım</Link> › <span>Adreslerim</span>
          </nav>
          <h1>Teslimat Adreslerim</h1>
          <p>Kiralama işlemlerinizde kullanmak üzere kayıtlı adreslerinizi buradan yönetin.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AddressesClient initialAddresses={JSON.parse(JSON.stringify(addresses))} />
        </div>
      </section>
    </main>
  );
}
