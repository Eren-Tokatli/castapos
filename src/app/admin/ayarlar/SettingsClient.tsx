"use client";

import React, { useState } from "react";
import { Mail, MapPin, Save, MessageCircle, Link2 } from "lucide-react";
import { updateSiteSettings, type SiteSettingsFormData } from "./actions";
import { useAdminToast } from "../_components/ToastProvider";

export function SettingsClient({ settings }: { settings: SiteSettingsFormData }) {
  const toast = useAdminToast();
  const [form, setForm] = useState<SiteSettingsFormData>(settings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof SiteSettingsFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await updateSiteSettings(form);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Ayarlar kaydedilemedi.");
      return;
    }
    toast("Ayarlar kaydedildi.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Site Ayarları</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Footer, İletişim, Canlı Destek ve Müşteri Hizmetleri sayfalarında görünen bilgiler — buradan
          değiştirdiğinde sitenin her yerinde güncellenir.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
        )}

        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <Mail size={14} /> İletişim
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">E-posta</label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={set("contactEmail")}
            required
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pt-2">
          <MessageCircle size={14} /> Destek Telefonu
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
            WhatsApp ve &quot;telefonla ara&quot; için (Canlı Destek + Müşteri Hizmetleri sayfaları)
          </label>
          <input
            type="text"
            value={form.supportPhone}
            onChange={set("supportPhone")}
            required
            placeholder="+905XXXXXXXXX"
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">Uluslararası formatta, boşluksuz gir: +90 ile başlayıp ülke kodu dahil tüm rakamlar.</p>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pt-2">
          <MapPin size={14} /> Adresler
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Türkiye Adresi</label>
          <textarea
            value={form.addressTr}
            onChange={set("addressTr")}
            required
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">ABD Adresi</label>
          <textarea
            value={form.addressUs}
            onChange={set("addressUs")}
            required
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none resize-none"
          />
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pt-2">
          <Link2 size={14} /> Sosyal Medya
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Facebook</label>
            <input
              type="url"
              value={form.facebookUrl}
              onChange={set("facebookUrl")}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Instagram</label>
            <input
              type="url"
              value={form.instagramUrl}
              onChange={set("instagramUrl")}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">YouTube</label>
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={set("youtubeUrl")}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">LinkedIn</label>
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={set("linkedinUrl")}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition disabled:opacity-50"
          >
            <Save size={15} />
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
