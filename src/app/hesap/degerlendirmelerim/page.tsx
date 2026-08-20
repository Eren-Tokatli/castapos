import { redirect } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/AccountShell";

export const dynamic = "force-dynamic";

export default async function DegerlendirmelerimPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/degerlendirmelerim");
  }

  const [user, reviews] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.review.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : session?.user?.name || "Castapos üyesi";

  return (
    <AccountShell displayName={displayName} email={user?.email || session?.user?.email || ""}>
      <div className="account-panel-hero">
        <h1>Değerlendirmelerim</h1>
        <p>Kiraladığın veya satın aldığın ürünler için yaptığın değerlendirmeler burada listelenir.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-account-state">
          <span><Star size={30} /></span>
          <h2>Henüz bir değerlendirmen yok</h2>
          <p>Siparişin tamamlandıktan sonra ürünü değerlendirip diğer kullanıcılara yardımcı olabilirsin.</p>
          <Link className="premium-btn" href="/hesap/siparislerim">
            Siparişlerimi Görüntüle
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {reviews.map((review) => (
            <div key={review.id} className="order-row" style={{ cursor: "default" }}>
              <div className="order-row-thumbs">
                {review.productImage ? (
                  <img src={review.productImage} alt="" />
                ) : (
                  <span className="order-row-thumb-fallback"><Star size={18} /></span>
                )}
              </div>
              <div className="order-row-main">
                <span className="order-row-number"><b>{review.productName}</b></span>
                <div style={{ display: "flex", gap: 2, color: "var(--brand)" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 1.5} />
                  ))}
                </div>
                <span style={{ color: "#667085", fontSize: 13 }}>{review.comment}</span>
              </div>
              <div className="order-row-end">
                <span className="order-row-date">
                  {review.createdAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
