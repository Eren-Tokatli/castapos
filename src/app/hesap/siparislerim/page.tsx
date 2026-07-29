import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, Eye } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return { text: "Ödeme Bekliyor", class: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    case "PROCESSING":
      return { text: "Hazırlanıyor", class: "bg-blue-50 text-blue-700 border-blue-200" };
    case "PAID":
      return { text: "Ödendi / Tamamlandı", class: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "CANCELLED":
      return { text: "İptal Edildi", class: "bg-rose-50 text-rose-700 border-rose-200" };
    case "REFUNDED":
      return { text: "İade Edildi", class: "bg-slate-50 text-slate-700 border-slate-200" };
    default:
      return { text: status, class: "bg-slate-50 text-slate-600 border-slate-200" };
  }
}

export default async function OrderHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/siparislerim");
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="account-page">
      <section className="account-hero compact-account-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Ana Sayfa</Link> › <Link href="/hesap/panel">Hesabım</Link> › <span>Siparişlerim</span>
          </nav>
          <h1>Siparişlerim</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {orders.length === 0 ? (
            <div className="empty-account-state">
              <span><ShoppingBag size={30} /></span>
              <h2>Henüz bir siparişiniz yok</h2>
              <p>Kiralık veya satılık ürünlerimize göz atarak hemen ilk siparişinizi verebilirsiniz.</p>
              <Link className="premium-btn" href="/kategori">
                Ürünleri İncele
              </Link>
            </div>
          ) : (
            <div className="premium-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#fffaf0] border-b border-[#ece2c8] text-[#8a7a52] font-bold uppercase tracking-wide text-xs">
                      <th className="p-4">Sipariş No</th>
                      <th className="p-4">Tarih</th>
                      <th className="p-4">Ürünler</th>
                      <th className="p-4 text-right">Tutar</th>
                      <th className="p-4 text-center">Durum</th>
                      <th className="p-4 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ead8] text-slate-700">
                    {orders.map((order) => {
                      const status = getStatusLabel(order.status);

                      return (
                        <tr key={order.id} className="hover:bg-[#fffaf0]/60 transition-colors">
                          <td className="p-4 font-bold text-slate-900">#{order.orderNumber}</td>
                          <td className="p-4">{order.createdAt.toLocaleDateString("tr-TR")}</td>
                          <td className="p-4 truncate max-w-[280px]">
                            {order.items.map((item) => `${item.name} (${item.quantity} Adet)`).join(", ")}
                          </td>
                          <td className="p-4 text-right font-black text-slate-900">
                            ₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`status-pill inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.class}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Link
                              href={`/hesap/siparislerim/${order.id}`}
                              className="premium-btn-ghost"
                            >
                              <Eye size={12} /> Detay
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
