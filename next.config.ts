import type { NextConfig } from "next";

// Cloudflare R2'ye admin panelden yüklenen görseller (bkz. lib/r2.ts) —
// next/image bu host dışındaki uzak görselleri optimize etmeyi reddeder,
// o yüzden .env'deki R2_PUBLIC_URL'den host'u buraya da tanıtıyoruz.
const r2Hostname = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2Hostname ? [{ protocol: "https", hostname: r2Hostname }] : [],
  },
};

export default nextConfig;
