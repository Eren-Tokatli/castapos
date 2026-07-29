import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Heart, MapPin, Award, LifeBuoy } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DASHBOARD_TILES = [
  { href: "/hesap/siparislerim", icon: Package, title: "Siparişlerim", desc: "Geçmiş ve devam eden siparişlerini görüntüle." },
  { href: "/hesap/favorilerim", icon: Heart, title: "Favorilerim", desc: "Beğendiğin ürünlere hızlıca ulaş." },
  { href: "/hesap/adreslerim", icon: MapPin, title: "Adreslerim", desc: "Teslimat adreslerini yönet." },
  { href: "/hesap/puanlarim", icon: Award, title: "Puanlarım", desc: "Kazandığın puanları takip et." },
  { href: "/hesap/destek", icon: LifeBuoy, title: "Destek Taleplerim", desc: "Destek talebi oluşturun veya yanıtları okuyun." },
];

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

  return (
    <main className="account-page">
      <section className="account-hero">
        <div className="container">
          <span className="section-kicker">Hesabım</span>
          <h1>Merhaba, {user?.firstName || session.user.name}</h1>
          <p>Siparişlerini, favorilerini ve üyelik durumunu buradan yönetebilirsin.</p>
        </div>
      </section>

      <section className="section compact-section">
        <div className="container">
          <div className="account-dashboard">
            {DASHBOARD_TILES.map(({ href, icon: Icon, title, desc }) => (
              <Link key={href} href={href} className="account-dashboard-tile">
                <span className="account-dashboard-icon"><Icon size={19} /></span>
                <span>
                  <b>{title}</b>
                  <span>{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
