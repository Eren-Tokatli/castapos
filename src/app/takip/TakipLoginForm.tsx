"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function TakipLoginForm() {
  const [tc, setTc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (tc.length !== 11) {
      setError("T.C. Kimlik numarası 11 haneli olmalıdır.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxOrNationalId: tc }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
      } else {
        setSuccess(data.message || "Doğrulama kodu gönderildi.");
        // Redirect to OTP verification page
        setTimeout(() => {
          router.push(`/takip/dogrula?tc=${tc}`);
        }, 1000);
      }
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white border border-gray-100 shadow-xl rounded-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Müşteri Ödeme Takip Portalı</h2>
        <p className="text-gray-500 text-sm mt-1">
          Kiralama sözleşmenizi görüntülemek ve taksitlerinizi ödemek için T.C. kimlik numaranızı girin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tc" className="block text-sm font-semibold text-gray-700 mb-1">
            T.C. Kimlik / Vergi Numarası
          </label>
          <input
            id="tc"
            type="text"
            maxLength={11}
            value={tc}
            onChange={(e) => setTc(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="11 Haneli T.C. No"
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition text-lg tracking-wider"
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
            "Giriş Kodu Gönder"
          )}
        </button>
      </form>
    </div>
  );
}
