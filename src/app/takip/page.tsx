import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TakipLoginForm } from "./TakipLoginForm";
import Link from "next/link";

async function handleLogout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("takip_tc");
  redirect("/takip");
}

export default async function TakipPage() {
  const cookieStore = await cookies();
  const takipTc = cookieStore.get("takip_tc")?.value;

  if (!takipTc) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 flex flex-col justify-center items-center px-4">
        <TakipLoginForm />
      </div>
    );
  }

  // Load agreements for this customer
  const agreements = await prisma.rentalAgreement.findMany({
    where: { taxOrNationalId: takipTc },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kiralama Sözleşmelerim</h1>
            <p className="text-gray-500 mt-1">Aktif ve geçmiş kiralamalarınıza ait ödeme planlarını takip edebilirsiniz.</p>
          </div>
          <form action={handleLogout} className="mt-4 sm:mt-0">
            <button
              type="submit"
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-semibold transition"
            >
              Çıkış Yap
            </button>
          </form>
        </div>

        {agreements.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
            <FileText className="mx-auto text-gray-400" size={36} />
            <h3 className="text-lg font-bold text-gray-900 mt-4">Kayıtlı Sözleşme Bulunmamaktadır</h3>
            <p className="text-gray-500 mt-1">Sistemimizde adınıza kayıtlı herhangi bir kiralama sözleşmesi bulunamadı.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {agreements.map((agreement) => {
              const statusColors: Record<string, string> = {
                CURRENT: "bg-green-50 text-green-700 border-green-200",
                LATE: "bg-red-50 text-red-700 border-red-200",
                COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
              };

              const deliveryColors: Record<string, string> = {
                PENDING: "bg-orange-50 text-orange-700 border-orange-200",
                DELIVERED: "bg-green-50 text-green-700 border-green-200",
                RETURNED: "bg-gray-100 text-gray-600 border-gray-300",
              };

              return (
                <div
                  key={agreement.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Sözleşme No</span>
                        <h2 className="text-lg font-bold text-gray-900">{agreement.id.substring(18).toUpperCase()}</h2>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full border ${
                          statusColors[agreement.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {agreement.paymentStatus === "CURRENT"
                          ? "Düzenli Ödeniyor"
                          : agreement.paymentStatus === "LATE"
                          ? "Gecikmede"
                          : "Tamamlandı"}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ürün Adı:</span>
                        <b className="text-gray-900 font-semibold">{agreement.assetName}</b>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Süre / Tutar:</span>
                        <b className="text-gray-900 font-semibold">
                          {agreement.rentalTermMonths} Ay / ₺{agreement.monthlyAmount.toLocaleString("tr-TR")}/ay
                        </b>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Teslimat Durumu:</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-md border ${
                            deliveryColors[agreement.deliveryStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {agreement.deliveryStatus === "PENDING"
                            ? "Beklemede"
                            : agreement.deliveryStatus === "DELIVERED"
                            ? "Teslim Edildi"
                            : "İade Alındı"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/takip/${agreement.id}`}
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center justify-center text-sm"
                  >
                    Detay ve Ödeme Planı →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
