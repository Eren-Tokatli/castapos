"use client";

import React, { useState } from "react";
import { Mail, MapPin, Save, MessageCircle, Link2, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, Timer, LayoutGrid } from "lucide-react";
import { updateSiteSettings, type SiteSettingsFormData, type HomeBannerFormData, type CampaignTileFormData } from "./actions";
import { useAdminToast } from "../_components/ToastProvider";

const EMPTY_BANNER: HomeBannerFormData = { url: "", alt: "", href: "", mobileUrl: "" };

export function SettingsClient({ settings }: { settings: SiteSettingsFormData }) {
  const toast = useAdminToast();
  const [form, setForm] = useState<SiteSettingsFormData>(settings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof SiteSettingsFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateBannerField = (idx: number, field: keyof HomeBannerFormData, value: string) => {
    setForm((f) => ({
      ...f,
      banners: f.banners.map((b, i) => (i === idx ? { ...b, [field]: value } : b)),
    }));
  };

  const addBanner = () => setForm((f) => ({ ...f, banners: [...f.banners, { ...EMPTY_BANNER }] }));

  const removeBanner = (idx: number) =>
    setForm((f) => ({ ...f, banners: f.banners.filter((_, i) => i !== idx) }));

  const moveBanner = (idx: number, direction: -1 | 1) => {
    setForm((f) => {
      const target = idx + direction;
      if (target < 0 || target >= f.banners.length) return f;
      const next = [...f.banners];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...f, banners: next };
    });
  };

  const updateCampaignTileField = (idx: number, field: keyof CampaignTileFormData, value: string) => {
    setForm((f) => ({
      ...f,
      campaignTiles: f.campaignTiles.map((t, i) => (i === idx ? { ...t, [field]: value } : t)),
    }));
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Sol sütun — iletişim bilgileri */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
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
          </div>

          {/* Sağ sütun — anasayfa banner slaytları */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <ImageIcon size={14} /> Anasayfa Banner Slaytları
            </div>
            <p className="text-xs text-slate-500 -mt-3">
              Görsel dosyası buradan yüklenmez — ürün fotoğraflarında olduğu gibi, görseli bir yere (ör. bir
              CDN/host) yükleyip linkini buraya yapıştır. Sıra burada listelendiği gibi anasayfada gösterilir.
            </p>

            <div className="space-y-3">
              {form.banners.length === 0 && (
                <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                  Henüz banner eklenmedi. Anasayfada slider hiç görünmeyecek.
                </p>
              )}
              {form.banners.map((banner, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Banner {idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBanner(idx, -1)}
                        disabled={idx === 0}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Yukarı taşı"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBanner(idx, 1)}
                        disabled={idx === form.banners.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Aşağı taşı"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBanner(idx)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50"
                        aria-label="Banner'ı sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Görsel URL</label>
                    <input
                      type="text"
                      value={banner.url}
                      onChange={(e) => updateBannerField(idx, "url", e.target.value)}
                      placeholder="https://.../banner.png"
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none font-mono"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Alt Metin</label>
                      <input
                        type="text"
                        value={banner.alt}
                        onChange={(e) => updateBannerField(idx, "alt", e.target.value)}
                        placeholder="Görseli kısaca tarif et"
                        className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tıklanınca gidilecek link (opsiyonel)</label>
                      <input
                        type="text"
                        value={banner.href}
                        onChange={(e) => updateBannerField(idx, "href", e.target.value)}
                        placeholder="/kategori?cat=Fitness"
                        className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  {banner.url && (
                    <img
                      src={banner.url}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg border border-slate-200 bg-white"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                      Mobil Görsel URL (opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={banner.mobileUrl}
                      onChange={(e) => updateBannerField(idx, "mobileUrl", e.target.value)}
                      placeholder="https://.../banner-mobil.png"
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none font-mono"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Boş bırakılırsa mobilde yukarıdaki görsel kenarlardan kırpılarak kullanılır.
                      Kırpmasız görünmesi için ~2322×1354 oranında (dikeye yakın) bir görsel yükle.
                    </p>
                    {banner.mobileUrl && (
                      <img
                        src={banner.mobileUrl}
                        alt=""
                        className="w-full h-24 object-cover rounded-lg border border-slate-200 bg-white mt-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addBanner}
              className="flex items-center gap-1.5 px-4 py-2 border border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition"
            >
              <Plus size={14} /> Banner Ekle
            </button>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1 uppercase">
                <Timer size={14} /> Slaytlar arası geçiş süresi (saniye)
              </label>
              <input
                type="number"
                min={2}
                max={60}
                value={form.bannerIntervalSeconds}
                onChange={(e) => setForm((f) => ({ ...f, bannerIntervalSeconds: Number(e.target.value) }))}
                className="w-32 h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Kampanya kutucukları — anasayfada "Sizden Gelenler" üstündeki sabit 3'lü alan */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <LayoutGrid size={14} /> Kampanya Kutucukları (3&apos;lü Alan)
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Anasayfada &quot;Sizden Gelenler&quot; bölümünün hemen üstünde yan yana duran 3 kutucuk. Sabit 3
            pozisyon — boş bırakılan kutucuk varsayılan görseliyle gösterilir.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {form.campaignTiles.map((tile, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/60">
                <span className="text-xs font-bold text-slate-500">Kutucuk {idx + 1}</span>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Görsel URL</label>
                  <input
                    type="text"
                    value={tile.url}
                    onChange={(e) => updateCampaignTileField(idx, "url", e.target.value)}
                    placeholder="https://.../kutucuk.png"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Alt Metin</label>
                  <input
                    type="text"
                    value={tile.alt}
                    onChange={(e) => updateCampaignTileField(idx, "alt", e.target.value)}
                    placeholder="Görseli kısaca tarif et"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tıklanınca gidilecek link</label>
                  <input
                    type="text"
                    value={tile.href}
                    onChange={(e) => updateCampaignTileField(idx, "href", e.target.value)}
                    placeholder="/urun/urun-slug"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                {tile.url && (
                  <img
                    src={tile.url}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border border-slate-200 bg-white"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
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
