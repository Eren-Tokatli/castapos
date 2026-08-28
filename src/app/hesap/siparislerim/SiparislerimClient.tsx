"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, RefreshCw, Search, ShoppingBag } from "lucide-react";
import { isR2Hosted } from "@/lib/r2-client";

export type OrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  itemsLabel: string;
  thumbs: string[];
  // Kiralama süresi 30 güne kadar kaldıysa dolu — kartta doğrudan "Uzat" butonu göstermek için.
  extendableRentalAgreementId: string | null;
};

const STATUS_META: Record<string, { text: string; tone: "wait" | "progress" | "done" | "cancel" }> = {
  PENDING_PAYMENT: { text: "Ödeme Bekliyor", tone: "wait" },
  PROCESSING: { text: "Hazırlanıyor", tone: "progress" },
  PAID: { text: "Sipariş Tamamlandı", tone: "done" },
  CANCELLED: { text: "İptal Edildi", tone: "cancel" },
  REFUNDED: { text: "İade Edildi", tone: "cancel" },
};

const FILTERS: { key: string; label: string; statuses: string[] | null }[] = [
  { key: "all", label: "Tümü", statuses: null },
  { key: "progress", label: "Devam Edenler", statuses: ["PENDING_PAYMENT", "PROCESSING"] },
  { key: "done", label: "Tamamlananlar", statuses: ["PAID"] },
  { key: "cancel", label: "İptal / İade", statuses: ["CANCELLED", "REFUNDED"] },
];

export function SiparislerimClient({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const filterDef = FILTERS.find((f) => f.key === activeFilter);
    const q = query.trim().toLocaleLowerCase("tr-TR");

    return orders.filter((order) => {
      const matchesStatus = !filterDef?.statuses || filterDef.statuses.includes(order.status);
      const matchesQuery =
        !q ||
        order.orderNumber.toLocaleLowerCase("tr-TR").includes(q) ||
        order.itemsLabel.toLocaleLowerCase("tr-TR").includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, activeFilter, query]);

  return (
    <>
      <div className="account-panel-hero">
        <h1>Siparişlerim</h1>
        <p>Geçmiş ve devam eden kiralama siparişlerini buradan takip edebilirsin.</p>
      </div>

      <div className="order-toolbar">
        <div className="order-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Siparişlerimde ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="order-filter-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`order-filter-chip ${activeFilter === f.key ? "active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-account-state">
          <span><ShoppingBag size={30} /></span>
          <h2>Henüz bir siparişiniz yok</h2>
          <p>Kiralık veya satılık ürünlerimize göz atarak hemen ilk siparişinizi verebilirsiniz.</p>
          <Link className="premium-btn" href="/kategori">
            Ürünleri İncele
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-account-state">
          <span><ShoppingBag size={30} /></span>
          <h2>Bu filtreye uyan sipariş yok</h2>
          <p>Farklı bir filtre seçmeyi veya aramanı temizlemeyi deneyebilirsin.</p>
        </div>
      ) : (
        <div className="order-list">
          {filtered.map((order) => {
            const meta = STATUS_META[order.status] || { text: order.status, tone: "wait" as const };
            return (
              <Link key={order.id} href={`/hesap/siparislerim/${order.id}`} className="order-row">
                <div className="order-row-thumbs">
                  {order.thumbs.slice(0, 2).map((src, idx) => (
                    <Image key={idx} src={src} alt="" width={48} height={48} loading="lazy" unoptimized={!isR2Hosted(src)} />
                  ))}
                  {order.thumbs.length === 0 && (
                    <span className="order-row-thumb-fallback"><ShoppingBag size={20} /></span>
                  )}
                </div>

                <div className="order-row-main">
                  <span className="order-row-number">Sipariş no: <b>{order.orderNumber}</b></span>
                  <span className={`order-status-pill tone-${meta.tone}`}>{meta.text}</span>
                </div>

                <div className="order-row-end">
                  <span className="order-row-date">{order.createdAt}</span>
                  <b className="order-row-total">
                    {order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                  </b>
                  {order.extendableRentalAgreementId && (
                    <button
                      type="button"
                      className="order-row-extend-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/pay/uzatma/${order.extendableRentalAgreementId}`);
                      }}
                    >
                      <RefreshCw size={13} /> Uzat
                    </button>
                  )}
                </div>

                <ChevronRight size={18} className="order-row-chevron" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
