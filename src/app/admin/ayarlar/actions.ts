"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { SITE_SETTINGS_ID } from "@/lib/site-settings";

export interface HomeBannerFormData {
  url: string;
  alt: string;
  href: string;
  // Opsiyonel — doluysa mobilde url yerine bu gösterilir (bkz. SettingsClient.tsx).
  mobileUrl: string;
}

export interface CampaignTileFormData {
  url: string;
  alt: string;
  href: string;
  // Opsiyonel — doluysa mobilde url yerine bu gösterilir (bkz. SettingsClient.tsx).
  mobileUrl: string;
}

export interface SiteSettingsFormData {
  contactEmail: string;
  supportPhone: string;
  addressTr: string;
  addressUs: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  banners: HomeBannerFormData[];
  bannerIntervalSeconds: number;
  // Sabit 3 pozisyon (anasayfa "Sizden Gelenler" üstündeki kutucuklar).
  // Bir slot boş bırakılırsa storefront kendi varsayılan görseline döner.
  campaignTiles: CampaignTileFormData[];
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

export async function updateSiteSettings(data: SiteSettingsFormData) {
  try {
    await requireAdmin();

    if (!data.contactEmail.trim() || !data.contactEmail.includes("@")) {
      return { success: false, error: "Geçerli bir e-posta adresi girin." };
    }
    if (!data.supportPhone.trim()) {
      return { success: false, error: "Destek telefonu boş bırakılamaz." };
    }
    if (!data.addressTr.trim() || !data.addressUs.trim()) {
      return { success: false, error: "Adres alanları boş bırakılamaz." };
    }
    // Admin panelde artık alt metin girilmiyor (kaldırıldı) — erişilebilirlik
    // için tamamen boş kalmasın diye burada otomatik, jenerik bir metinle
    // dolduruluyor.
    const cleanBanners = data.banners
      .map((b, i) => ({ url: b.url.trim(), alt: b.alt.trim() || `Anasayfa banner'ı ${i + 1}`, href: b.href.trim() || null, mobileUrl: b.mobileUrl.trim() || null }))
      .filter((b) => b.url);
    const bannerInterval = Math.round(data.bannerIntervalSeconds);
    if (!Number.isFinite(bannerInterval) || bannerInterval < 2 || bannerInterval > 60) {
      return { success: false, error: "Geçiş süresi 2 ile 60 saniye arasında olmalı." };
    }
    const bannersWithOrder = cleanBanners.map((b, i) => ({ ...b, sortOrder: i }));

    const cleanCampaignTiles = data.campaignTiles
      .map((t, i) => ({
        url: t.url.trim(),
        alt: t.alt.trim() || `Kampanya kutucuğu ${i + 1}`,
        href: t.href.trim() || null,
        mobileUrl: t.mobileUrl.trim() || null,
      }))
      .filter((t) => t.url);

    await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      update: {
        contactEmail: data.contactEmail.trim(),
        supportPhone: data.supportPhone.trim(),
        addressTr: data.addressTr.trim(),
        addressUs: data.addressUs.trim(),
        facebookUrl: data.facebookUrl.trim(),
        instagramUrl: data.instagramUrl.trim(),
        youtubeUrl: data.youtubeUrl.trim(),
        linkedinUrl: data.linkedinUrl.trim(),
        banners: bannersWithOrder,
        bannerIntervalSeconds: bannerInterval,
        campaignTiles: cleanCampaignTiles,
      },
      create: {
        id: SITE_SETTINGS_ID,
        contactEmail: data.contactEmail.trim(),
        supportPhone: data.supportPhone.trim(),
        addressTr: data.addressTr.trim(),
        addressUs: data.addressUs.trim(),
        facebookUrl: data.facebookUrl.trim(),
        instagramUrl: data.instagramUrl.trim(),
        youtubeUrl: data.youtubeUrl.trim(),
        linkedinUrl: data.linkedinUrl.trim(),
        banners: bannersWithOrder,
        bannerIntervalSeconds: bannerInterval,
        campaignTiles: cleanCampaignTiles,
      },
    });

    // Bu ayarlar footer'da (root layout üzerinden her sayfada), İletişim,
    // Canlı Destek ve Müşteri Hizmetleri sayfalarında görünüyor.
    revalidatePath("/", "layout");
    revalidatePath("/bilgi/iletisim");
    revalidatePath("/canli-destek");
    revalidatePath("/hesap/musteri-hizmetleri");
    revalidatePath("/admin/ayarlar");
    return { success: true };
  } catch (error: any) {
    console.error("Update Site Settings Action Error:", error);
    return { success: false, error: error.message || "Ayarlar kaydedilemedi." };
  }
}
