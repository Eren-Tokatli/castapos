import React from "react";
import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";

export default async function PayLinkSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; amount?: string }>;
}) {
  const { name, amount } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">Ödeme Başarılı</h2>
          <p className="text-sm text-slate-500 leading-normal px-4">
            Tahsilat işleminiz iyzico altyapısı aracılığıyla güvenli bir şekilde tamamlanmıştır.
          </p>
        </div>

        {/* Receipt Box */}
        {(name || amount) && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
            {name && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Ödeyen:</span>
                <span className="font-bold text-slate-800">{name}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-400 font-medium">Tutar:</span>
                <span className="font-black text-orange-500 text-sm">₺{parseFloat(amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200/60 pt-2">
              <span className="text-slate-400 font-medium">İşlem Durumu:</span>
              <span className="font-bold text-emerald-600">Başarılı (Onaylandı)</span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link
            href="/"
            className="w-full h-11 bg-slate-900 hover:bg-slate-850 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition text-sm"
          >
            <Home size={16} /> Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
