"use client";

import React, { createContext, useContext } from "react";

export interface SiteSettingsValue {
  contactEmail: string;
  supportPhone: string;
  addressTr: string;
  addressUs: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
}

const SiteSettingsContext = createContext<SiteSettingsValue | undefined>(undefined);

// StoreProvider/ThemeProvider ile aynı desen: değer sunucuda (root layout)
// bir kez çekilir, burada sadece istemci tarafında dağıtılır — client
// component'lerin (ör. footer'ı barındıran StorefrontLayout) admin/ayarlar
// üzerinden değişen iletişim bilgilerini okuyabilmesi için.
export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettingsValue;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
