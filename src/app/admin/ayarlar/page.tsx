import React from "react";
import { getSiteSettings } from "@/lib/site-settings";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <SettingsClient
      settings={{
        contactEmail: settings.contactEmail,
        supportPhone: settings.supportPhone,
        addressTr: settings.addressTr,
        addressUs: settings.addressUs,
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
        youtubeUrl: settings.youtubeUrl,
        linkedinUrl: settings.linkedinUrl,
        banners: [...settings.banners]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((b) => ({ url: b.url, alt: b.alt, href: b.href || "", mobileUrl: b.mobileUrl || "" })),
        bannerIntervalSeconds: settings.bannerIntervalSeconds,
        // Sabit 3 slot — kayıtlı olan kadarı kullanılır, kalanı boş form
        // alanı olarak gösterilir (henüz doldurulmamış demektir).
        campaignTiles: Array.from({ length: 3 }, (_, i) => {
          const t = settings.campaignTiles[i];
          return { url: t?.url || "", alt: t?.alt || "", href: t?.href || "" };
        }),
      }}
    />
  );
}
