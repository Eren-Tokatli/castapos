"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { submitReview } from "./actions";

export type ReviewableItem = {
  productId: string;
  name: string;
  sku?: string | null;
  saleMode: string;
  rentalTierLabel?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
};

function ReviewForm({
  orderId,
  item,
  onDone,
}: {
  orderId: string;
  item: ReviewableItem;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Lütfen bir puan seç.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await submitReview({
      orderId,
      productId: item.productId,
      productName: item.name,
      productImage: item.image,
      rating,
      comment,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Değerlendirme gönderilemedi.");
      return;
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const value = i + 1;
          const filled = value <= (hoverRating || rating);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} yıldız`}
              style={{ background: "none", border: 0, cursor: "pointer", color: filled ? "var(--brand)" : "#d0d5dd", padding: 2 }}
            >
              <Star size={22} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.5} />
            </button>
          );
        })}
      </div>

      <textarea
        required
        rows={3}
        placeholder="Ürün hakkındaki düşüncelerini yaz..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[var(--gold)] resize-y"
      />

      {error && <p className="text-xs text-red-600 m-0">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition">
          Vazgeç
        </button>
        <button type="submit" disabled={loading} className="premium-btn !px-4 !py-2 !text-xs">
          {loading ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
        </button>
      </div>
    </form>
  );
}

export function OrderItemsClient({
  orderId,
  items,
  canReview,
  reviewedProductIds,
}: {
  orderId: string;
  items: ReviewableItem[];
  canReview: boolean;
  reviewedProductIds: string[];
}) {
  const [openReviewFor, setOpenReviewFor] = useState<string | null>(null);
  const [justReviewed, setJustReviewed] = useState<string[]>([]);

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item, idx) => {
        const alreadyReviewed = reviewedProductIds.includes(item.productId) || justReviewed.includes(item.productId);

        return (
          <div key={idx} className="py-4 text-xs">
            <div className="flex justify-between items-center gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                <div className="flex gap-4 text-slate-400 mt-1 font-semibold">
                  {item.sku && <span>SKU: {item.sku}</span>}
                  <span>Tür: {item.saleMode === "RENTAL" ? `Kiralama (${item.rentalTierLabel || "Plan"})` : "Satın Alma"}</span>
                  <span>Adet: {item.quantity}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-slate-400 block">Birim Fiyat: ₺{item.unitPrice.toLocaleString("tr-TR")}</span>
                <span className="font-black text-slate-900 block mt-0.5 text-sm">₺{item.lineTotal.toLocaleString("tr-TR")}</span>
              </div>
            </div>

            {canReview && (
              <div className="mt-2">
                {alreadyReviewed ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Check size={13} /> Değerlendirildi
                  </span>
                ) : openReviewFor === item.productId ? (
                  <ReviewForm
                    orderId={orderId}
                    item={item}
                    onDone={() => {
                      setJustReviewed((prev) => [...prev, item.productId]);
                      setOpenReviewFor(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenReviewFor(item.productId)}
                    className="premium-btn-ghost"
                  >
                    <Star size={12} /> Değerlendir
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
