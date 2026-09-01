"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface TakipOtpFormProps {
  tc: string;
}

export function TakipOtpForm({ tc }: TakipOtpFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (code.length !== 4) {
      setError("Doğrulama kodu 4 haneli olmalıdır.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxOrNationalId: tc, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
      } else {
        setSuccess(data.message || "Giriş başarılı! Yönlendiriliyorsunuz...");
        // Revalidate and redirect
        setTimeout(() => {
          router.push("/takip");
          router.refresh();
        }, 1000);
      }
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white border border-gray-100 shadow-xl rounded-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SMS Doğrulama</h2>
        <p className="text-gray-500 text-sm mt-1">
          Lütfen <b>{tc}</b> kimlik numarasına ait kayıtlı telefonunuza gönderilen 4 haneli kodu girin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-1">
            4 Haneli Doğrulama Kodu
          </label>
          <input
            id="code"
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0000"
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition text-center text-2xl tracking-widest font-mono"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Kodu Doğrula ve Giriş Yap"
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push("/takip")}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-800 transition pt-2"
        >
          ← T.C. No Değiştir
        </button>
      </form>
    </div>
  );
}
