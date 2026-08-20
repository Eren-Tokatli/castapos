"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, ShieldCheck, User, AlertCircle, Sparkles, Package } from "lucide-react";

interface InstallmentPayInfo {
  id: string;
  amount: number;
  description: string | null;
  dueDate: string;
  paid: boolean;
  tenantName: string;
  assetName: string;
}

export function TaksitPayClient({ installment }: { installment: InstallmentPayInfo }) {
  const searchParams = useSearchParams();
  const paymentError = searchParams.get("msg");

  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(paymentError);

  useEffect(() => {
    if (checkoutHtml) {
      const container = document.getElementById("iyzico-checkout-container");
      if (container) {
        const scripts = container.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          const newScript = document.createElement("script");
          newScript.type = "text/javascript";
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          document.body.appendChild(newScript);
        }
      }
    }
  }, [checkoutHtml]);

  const handleStartPayment = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/iyzico/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "INSTALLMENT",
          installmentId: installment.id,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || "Ödeme formu yüklenirken hata oluştu.");
      } else {
        setCheckoutHtml(data.checkoutFormContent);
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası oluştu.");
      setLoading(false);
    }
  };

  if (installment.paid) {
    return (
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-lg space-y-4">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Bu Taksit Ödenmiştir</h2>
        <p className="text-sm text-slate-500 leading-normal">
          {installment.description || "Bu ödeme"} zaten tahsil edilmiştir. İlginiz için teşekkür ederiz.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl flex flex-col">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-extrabold tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md uppercase">
            CASTAPOS GÜVENLİ ÖDEME
          </span>
          <h2 className="text-lg font-bold">Kiralama Taksit Ödemesi</h2>
          <p className="text-xs text-slate-400">
            Lütfen taksit detaylarını inceleyerek güvenli ödemeyi tamamlayın.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl text-xs flex gap-2 items-start font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Invoice Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs text-slate-600">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
            <span className="w-8 h-8 bg-white border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center">
              <User size={15} />
            </span>
            <div>
              <p className="text-[9px] font-bold text-slate-400 block uppercase">KİRALAYAN</p>
              <p className="font-bold text-slate-800 text-sm">{installment.tenantName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
            <span className="w-8 h-8 bg-white border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center">
              <Package size={15} />
            </span>
            <div>
              <p className="text-[9px] font-bold text-slate-400 block uppercase">CİHAZ</p>
              <p className="font-bold text-slate-800 text-sm">{installment.assetName}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 block uppercase">AÇIKLAMA</p>
            <p className="font-medium text-slate-700 leading-normal">
              {installment.description || "Aylık kiralama bedeli"} · Son ödeme tarihi:{" "}
              {new Date(installment.dueDate).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>

        {/* Amount Box */}
        <div className="flex justify-between items-center bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <span className="text-xs font-bold text-orange-700">Toplam Ödenecek Tutar:</span>
          <span className="text-2xl font-black text-orange-600">₺{installment.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Checkout container */}
        {checkoutHtml ? (
          <div className="pt-2">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 block text-center">
              KART BİLGİLERİNİ GİRİN
            </h3>
            <div
              id="iyzico-checkout-container"
              className="w-full bg-slate-50 p-2 rounded-2xl border border-slate-100"
              dangerouslySetInnerHTML={{ __html: checkoutHtml }}
            />
          </div>
        ) : (
          <button
            onClick={handleStartPayment}
            disabled={loading}
            className="w-full h-12 bg-slate-900 hover:bg-slate-850 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <CreditCard size={18} /> {loading ? "Yükleniyor..." : "Kredi Kartı ile Güvenli Öde"}
          </button>
        )}

        {/* Security badges */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-slate-400" /> iyzico Güvencesiyle 256-bit SSL
          </span>
        </div>
      </div>
    </div>
  );
}
