"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertTriangle } from "lucide-react";

interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  description: string | null;
}

interface Agreement {
  id: string;
  assetName: string;
  assetSku: string | null;
  tenantName: string;
  rentalTermMonths: number | null;
  monthlyAmount: number;
  rentalStart: string | null;
  rentalEnd: string | null;
  deliveryStatus: string;
  paymentStatus: string;
  serialNumber: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
}

interface AgreementDetailClientProps {
  agreement: Agreement;
  installments: Installment[];
}

export function AgreementDetailClient({ agreement, installments }: AgreementDetailClientProps) {
  const router = useRouter();
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [iyzicoScript, setIyzicoScript] = useState("");
  const [checkoutToken, setCheckoutToken] = useState("");

  const handlePay = async (installment: Installment) => {
    setSelectedInstallment(installment);
    setCheckoutLoading(true);
    setCheckoutError("");
    setIyzicoScript("");
    setCheckoutToken("");

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
      if (!res.ok) {
        setCheckoutError(data.error || "Ödeme formu yüklenirken hata oluştu.");
      } else {
        setCheckoutToken(data.token);
        setIyzicoScript(data.checkoutFormContent);

        // Inject Iyzico iframe scripts dynamically
        setTimeout(() => {
          const container = document.getElementById("iyzico-script-container");
          if (container) {
            // Remove previous scripts if any
            container.innerHTML = "";
            
            // Extract the script tag content from checkoutFormContent
            const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
            const match = scriptRegex.exec(data.checkoutFormContent);
            if (match && match[1]) {
              const newScript = document.createElement("script");
              newScript.type = "text/javascript";
              newScript.text = match[1];
              container.appendChild(newScript);
            }
          }
        }, 100);
      }
    } catch (err) {
      setCheckoutError("Bağlantı hatası oluştu.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const closePaymentModal = () => {
    setSelectedInstallment(null);
    setIyzicoScript("");
    setCheckoutToken("");
    setCheckoutError("");
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push("/takip")}
          className="text-orange-500 font-bold flex items-center gap-1 hover:text-orange-600 transition"
        >
          ← Sözleşmelerime Dön
        </button>
      </div>

      {/* Grid of details */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left pane - details */}
        <div className="md:col-span-1 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Cihaz Bilgisi</span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{agreement.assetName}</h2>
            {agreement.serialNumber && (
              <span className="inline-flex mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                S/N: {agreement.serialNumber}
              </span>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase block">Kiralayan Kişi</span>
              <span className="text-sm font-semibold text-gray-800">{agreement.tenantName}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase block">Telefon & E-posta</span>
              <span className="text-sm font-semibold text-gray-800 block">{agreement.phone}</span>
              {agreement.email && <span className="text-xs text-gray-500 block">{agreement.email}</span>}
            </div>
            {agreement.address && (
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase block">Teslimat Adresi</span>
                <span className="text-sm text-gray-600 block">
                  {agreement.address} {agreement.city && `, ${agreement.city}`}
                </span>
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase block">Kiralama Süresi</span>
              <span className="text-sm font-semibold text-gray-800">
                {agreement.rentalTermMonths} Ay
              </span>
              {agreement.rentalStart && (
                <span className="text-xs text-gray-500 block">
                  {new Date(agreement.rentalStart).toLocaleDateString("tr-TR")} -{" "}
                  {agreement.rentalEnd && new Date(agreement.rentalEnd).toLocaleDateString("tr-TR")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right pane - payment calendar */}
        <div className="md:col-span-2 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Ödeme Takvimi</h3>

          <div className="space-y-3">
            {installments.map((inst, index) => (
              <div
                key={inst.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
                  inst.paid
                    ? "bg-green-50/40 border-green-100"
                    : new Date(inst.dueDate) < new Date()
                    ? "bg-red-50/40 border-red-100"
                    : "bg-gray-50/30 border-gray-100"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {index + 1}
                    </span>
                    <span className="font-bold text-gray-900">
                      ₺{inst.amount.toLocaleString("tr-TR")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {inst.description || `${index + 1}. Ay Ödemesi`}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                    <span>Son Ödeme Tarihi: {new Date(inst.dueDate).toLocaleDateString("tr-TR")}</span>
                    {new Date(inst.dueDate) < new Date() && !inst.paid && (
                      <span className="text-red-600 font-bold bg-red-50 border border-red-100 px-1.5 py-0.25 rounded text-[10px]">
                        Gecikmiş
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {inst.paid ? (
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
                      <Check size={15} /> Ödendi
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePay(inst)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition shadow-sm"
                    >
                      Ödeme Yap
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Iframe Modal Overlay */}
      {selectedInstallment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Head */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h4 className="font-bold text-gray-900">Taksit Ödemesi</h4>
                <p className="text-xs text-gray-500">
                  {selectedInstallment.description || "Aylık Kiralama Bedeli"} - ₺
                  {selectedInstallment.amount.toLocaleString("tr-TR")}
                </p>
              </div>
              <button
                onClick={closePaymentModal}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition text-lg"
              >
                ×
              </button>
            </div>

            {/* Modal Body / Iframe */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center min-h-[500px]">
              {checkoutLoading && (
                <div className="text-center py-10 space-y-4">
                  <span className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                  <p className="text-gray-500 font-semibold">Güvenli ödeme formu yükleniyor...</p>
                </div>
              )}

              {checkoutError && (
                <div className="text-center py-10 space-y-4">
                  <AlertTriangle className="mx-auto text-red-500" size={30} />
                  <p className="text-red-600 font-bold">{checkoutError}</p>
                  <button
                    onClick={() => handlePay(selectedInstallment)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition"
                  >
                    Yeniden Dene
                  </button>
                </div>
              )}

              {/* Secure checkout form content container */}
              <div className="w-full">
                <div id="iyzico-script-container"></div>
                <div id="iyzipay-checkout-form" className="responsive"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
