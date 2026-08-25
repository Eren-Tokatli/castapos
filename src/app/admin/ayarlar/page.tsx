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
      }}
    />
  );
}
