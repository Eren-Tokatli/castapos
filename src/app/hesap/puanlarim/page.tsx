import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RewardPointsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/puanlarim");
  }

  const transactions = await prisma.rewardTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total balance
  const balance = transactions.reduce((acc, tx) => acc + tx.points, 0);

  return (
    <main className="account-page">
      <section className="account-hero compact-account-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <Link href="/hesap/panel">Hesabım</Link> › <span>Puanlarım</span>
          </nav>
          <h1>Castapos Puanlarım</h1>
          <p>Kiralama ve alışverişlerinizden kazandığınız Castapos puanlarını takip edin.</p>
        </div>
      </section>

      <section className="section">
        <div className="container space-y-6">
          {/* Points Balance Card */}
          <div className="membership-card">
            <div className="flex items-center gap-4">
              <span className="points-coin-badge">
                <Award size={26} />
              </span>
              <div>
                <span className="membership-kicker">Toplam Bakiye</span>
                <b>{balance} Puan</b>
                <span className="membership-sub">
                  Her alışverişinizde puan kazanabilir, biriken puanlarınızı kiralama siparişlerinizde indirim kuponuna dönüştürebilirsiniz.
                </span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="premium-surface p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Puan Geçmişi</h3>

            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Clock size={32} className="mx-auto mb-2 opacity-30" />
                Henüz puan kazanımı veya harcaması gerçekleştirmediniz.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#fffaf0] border-b border-[#ece2c8] text-[#8a7a52] font-bold uppercase tracking-wide">
                      <th className="p-3">İşlem Türü</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3">Tarih</th>
                      <th className="p-3 text-right">Puan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ead8] text-slate-700">
                    {transactions.map((tx) => {
                      const isPositive = tx.points >= 0;
                      return (
                        <tr key={tx.id} className="hover:bg-[#fffaf0]/60 transition-colors">
                          <td className="p-3">
                            <span className={`status-pill inline-flex items-center gap-1 font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                              {isPositive ? (
                                <><TrendingUp size={13} /> Kazanım</>
                              ) : (
                                <><TrendingDown size={13} /> Harcama</>
                              )}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{tx.description}</td>
                          <td className="p-3">{tx.createdAt.toLocaleDateString("tr-TR")}</td>
                          <td className={`p-3 text-right font-black text-sm ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                            {isPositive ? `+${tx.points}` : tx.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
