"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, ImagePlus } from "lucide-react";

// Admin panelde görsel yükleme için ortak mantık — dosyayı /api/admin/upload
// üzerinden R2'ye yükler, sonucu düz bir URL string'i olarak döner. Hem
// ImageUploadField (etiketli/önizlemeli tam alan) hem ImageUploadButton
// (tek ikon, sıkışık grid satırları için) bunu kullanıyor.
export function useImageUpload(folder: string) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<{ url: string } | { error: string }> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Yükleme başarısız oldu." };
      return { url: data.url as string };
    } catch {
      return { error: "Yükleme başarısız oldu, bağlantını kontrol et." };
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}

// Sıkışık grid satırları için (ör. ürün görsel listesi) — sadece bir ikon
// buton, URL yapıştırma alanı zaten ayrıca yanında duruyor.
export function ImageUploadButton({
  folder,
  onUploaded,
  onError,
}: {
  folder: string;
  onUploaded: (url: string) => void;
  onError: (message: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload(folder);

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title="Bilgisayardan görsel yükle"
        className="shrink-0 w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-60"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const result = await upload(file);
          if ("error" in result) onError(result.error);
          else onUploaded(result.url);
          e.target.value = "";
        }}
      />
    </>
  );
}

// Admin panelde görsel alanları için ortak component — dosya yükler (R2'ye,
// bkz. api/admin/upload), sonucu düz bir URL string'i olarak `onChange`'e
// verir. URL yapıştırma seçeneği bilerek yok — tek yol dosya yükleme.
export function ImageUploadField({
  value,
  onChange,
  folder,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload(folder);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    const result = await upload(file);
    if ("error" in result) setError(result.error);
    else onChange(result.url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{label}</label>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full h-10 px-3 border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Yükleniyor..." : value ? "Değiştirmek için tıkla" : "Bilgisayardan görsel seç"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {value && (
        <Image
          src={value}
          alt=""
          width={400}
          height={96}
          unoptimized
          className="w-full h-24 object-cover rounded-lg border border-slate-200 bg-white mt-2"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </div>
  );
}
