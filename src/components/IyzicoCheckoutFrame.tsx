"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

type CheckoutKind = "ORDER" | "INSTALLMENT" | "MEMBERSHIP";

/** Initializes an Iyzico Checkout Form for the given kind/reference and injects
 * the returned script into the page. Shared by cart checkout and premium-membership
 * purchase — both use the identical initialize -> inject-script -> callback lifecycle. */
export function IyzicoCheckoutFrame({
  kind,
  referenceId,
}: {
  kind: CheckoutKind;
  referenceId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const start = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const body =
        kind === "ORDER"
          ? { kind, orderId: referenceId }
          : kind === "INSTALLMENT"
          ? { kind, installmentId: referenceId }
          : { kind, customerId: referenceId };

      const res = await fetch("/api/iyzico/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ödeme formu hazırlanamadı.");
        setLoading(false);
        return;
      }

      setTimeout(() => {
        const container = document.getElementById("iyzico-script-container");
        if (container) {
          container.innerHTML = "";
          const match = /<script\b[^>]*>([\s\S]*?)<\/script>/.exec(data.checkoutFormContent || "");
          if (match && match[1]) {
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.text = match[1];
            container.appendChild(script);
          }
        }
        setLoading(false);
      }, 100);
    } catch {
      setError("Bağlantı hatası oluştu.");
      setLoading(false);
    }
  }, [kind, referenceId]);

  useEffect(() => {
    // Fetching on mount is the intended use of this effect; `start` sets
    // loading/error state as part of that fetch lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
  }, [start]);

  return (
    <div className="p-4 bg-slate-50 border rounded-xl my-4 min-h-[400px] flex flex-col justify-center items-center">
      {loading && (
        <div className="text-center py-10 space-y-4">
          <span className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="text-gray-500 font-semibold">Güvenli ödeme formu hazırlanıyor...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10 space-y-4">
          <AlertTriangle className="mx-auto text-red-500" size={30} />
          <p className="text-red-600 font-bold">{error}</p>
          <button
            onClick={start}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition"
          >
            Yeniden Dene
          </button>
        </div>
      )}

      <div className="w-full" style={{ display: loading || error ? "none" : "block" }}>
        <div id="iyzico-script-container"></div>
        <div id="iyzipay-checkout-form" className="responsive"></div>
      </div>
    </div>
  );
}
