"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createTicket } from "./actions";
import { TICKET_REASONS } from "./reasons";

export type WizardOrderItem = {
  productId: string;
  name: string;
  image?: string;
};

export type WizardOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  items: WizardOrderItem[];
};

type Step = "orders" | "items" | "reasons" | "message";

export function NewTicketWizard({
  orders,
  onClose,
  onCreated,
}: {
  orders: WizardOrder[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("orders");
  const [selectedOrder, setSelectedOrder] = useState<WizardOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<WizardOrderItem | null>(null);
  const [selectedReason, setSelectedReason] = useState<(typeof TICKET_REASONS)[number] | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickOrder = (order: WizardOrder) => {
    setSelectedOrder(order);
    if (order.items.length === 1) {
      setSelectedItem(order.items[0]);
      setStep("reasons");
    } else {
      setStep("items");
    }
  };

  const pickItem = (item: WizardOrderItem) => {
    setSelectedItem(item);
    setStep("reasons");
  };

  const pickReason = (reason: (typeof TICKET_REASONS)[number]) => {
    if (reason.redirectTo) {
      onClose();
      router.push(reason.redirectTo);
      return;
    }
    setSelectedReason(reason);
    setStep("message");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedItem || !selectedReason || !description.trim()) return;

    setLoading(true);
    setError(null);

    const res = await createTicket(selectedReason.label, description.trim(), {
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.orderNumber,
      productId: selectedItem.productId,
      productName: selectedItem.name,
      reasonCode: selectedReason.code,
      reasonLabel: selectedReason.label,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Talep oluşturulamadı.");
      return;
    }
    onCreated();
  };

  const goBack = () => {
    if (step === "items") setStep("orders");
    else if (step === "reasons") setStep(selectedOrder && selectedOrder.items.length > 1 ? "items" : "orders");
    else if (step === "message") setStep("reasons");
  };

  return (
    <div className="compare-modal-backdrop open" onClick={onClose}>
      <div className="compare-modal" style={{ width: "min(640px, 100%)" }} onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step !== "orders" && (
              <button type="button" onClick={goBack} aria-label="Geri" style={{ border: 0, background: "none", cursor: "pointer", display: "flex" }}>
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <span>Yeni Soru ve Talep</span>
              <h2 style={{ fontSize: 20 }}>
                {step === "orders" && "Hangi siparişle ilgili?"}
                {step === "items" && "Hangi ürünle ilgili?"}
                {step === "reasons" && "Konunuzu seçin"}
                {step === "message" && "Detayları yazın"}
              </h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        </div>

        <div className="compare-modal-body">
          {step === "orders" && (
            <div className="order-list">
              {orders.length === 0 ? (
                <p style={{ color: "#667085", fontSize: 14 }}>Henüz bir siparişin yok, talep açabilmek için önce bir sipariş vermelisin.</p>
              ) : (
                orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className="order-row"
                    style={{ width: "100%", cursor: "pointer", font: "inherit" }}
                    onClick={() => pickOrder(order)}
                  >
                    <div className="order-row-thumbs">
                      {order.items.slice(0, 2).map((item, idx) =>
                        item.image ? <img key={idx} src={item.image} alt="" /> : null
                      )}
                    </div>
                    <div className="order-row-main">
                      <span className="order-row-number">Sipariş no: <b>{order.orderNumber}</b></span>
                      <span style={{ display: "block", minWidth: 0, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#667085", fontSize: 13 }}>
                        {order.items.map((i) => i.name).join(", ")}
                      </span>
                    </div>
                    <div className="order-row-end">
                      <span className="order-row-date">{order.createdAt}</span>
                    </div>
                    <ChevronRight size={18} className="order-row-chevron" />
                  </button>
                ))
              )}
            </div>
          )}

          {step === "items" && selectedOrder && (
            <div className="order-list">
              {selectedOrder.items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="order-row"
                  style={{ width: "100%", cursor: "pointer", font: "inherit" }}
                  onClick={() => pickItem(item)}
                >
                  <div className="order-row-thumbs">
                    {item.image ? <img src={item.image} alt="" /> : <span className="order-row-thumb-fallback" />}
                  </div>
                  <div className="order-row-main">
                    <span className="order-row-number"><b>{item.name}</b></span>
                  </div>
                  <ChevronRight size={18} className="order-row-chevron" />
                </button>
              ))}
            </div>
          )}

          {step === "reasons" && selectedOrder && selectedItem && (
            <div>
              <div className="order-row" style={{ marginBottom: 18, cursor: "default" }}>
                <div className="order-row-thumbs">
                  {selectedItem.image ? <img src={selectedItem.image} alt="" /> : <span className="order-row-thumb-fallback" />}
                </div>
                <div className="order-row-main">
                  <span className="order-row-number"><b>{selectedItem.name}</b></span>
                  <span style={{ display: "block", minWidth: 0, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#667085", fontSize: 13 }}>Sipariş no: {selectedOrder.orderNumber}</span>
                </div>
                <div className="order-row-end">
                  <span className="order-row-date">{selectedOrder.createdAt}</span>
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px" }}>İade ve Diğer Talepler</h3>
              <div className="order-list">
                {TICKET_REASONS.map((reason) => {
                  const Icon = reason.icon;
                  return (
                    <button
                      key={reason.code}
                      type="button"
                      className="order-row"
                      style={{ width: "100%", cursor: "pointer", font: "inherit" }}
                      onClick={() => pickReason(reason)}
                    >
                      <div className="order-row-thumbs">
                        <span className="order-row-thumb-fallback"><Icon size={18} /></span>
                      </div>
                      <div className="order-row-main">
                        <span className="order-row-number"><b>{reason.label}</b></span>
                      </div>
                      <ChevronRight size={18} className="order-row-chevron" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "message" && selectedReason && (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <div className="order-row" style={{ cursor: "default" }}>
                <div className="order-row-thumbs">
                  {selectedItem?.image ? <img src={selectedItem.image} alt="" /> : <span className="order-row-thumb-fallback" />}
                </div>
                <div className="order-row-main">
                  <span className="order-row-number"><b>{selectedReason.label}</b></span>
                  <span style={{ display: "block", minWidth: 0, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#667085", fontSize: 13 }}>{selectedItem?.name}</span>
                </div>
              </div>

              <label style={{ display: "grid", gap: 7, fontWeight: 800, fontSize: 14 }}>
                Talebini detaylandır
                <textarea
                  required
                  rows={6}
                  placeholder="Yaşadığın sorunu buraya yazabilirsin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", border: "1px solid #d8dde7", borderRadius: 12, padding: 12, resize: "vertical", font: "inherit" }}
                />
              </label>

              {error && <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Gönderiliyor..." : "Talebi Gönder"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
