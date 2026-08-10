"use client";

import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

/**
 * URL girişlerinin yanında canlı küçük önizleme — kaydetmeden önce linkin
 * gerçekten bir görsele gittiğini görmek için. Bozuk/boş link ise kırık
 * görsel ikonu gösterir.
 */
export function ImagePreviewThumb({ url, size = 40 }: { url: string; size?: number }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [url]);

  const trimmed = url.trim();

  return (
    <div
      className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {trimmed && !broken ? (
        <img
          src={trimmed}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <ImageOff size={size * 0.45} className="text-slate-300" />
      )}
    </div>
  );
}
