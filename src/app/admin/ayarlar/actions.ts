"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { SITE_SETTINGS_ID } from "@/lib/site-settings";

export interface HomeBannerFormData {
  url: string;
  alt: string;
  href: string;
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
    const cleanBanners = data.banners
      .map((b) => ({ url: b.url.trim(), alt: b.alt.trim(), href: b.href.trim() || null }))
      .filter((b) => b.url);
    if (cleanBanners.some((b) => !b.alt)) {
      return { success: false, error: "Her banner için bir alt metin (erişilebilirlik açıklaması) girilmeli." };
    }
    const bannerInterval = Math.round(data.bannerIntervalSeconds);
    if (!Number.isFinite(bannerInterval) || bannerInterval < 2 || bannerInterval > 60) {
      return { success: false, error: "Geçiş süresi 2 ile 60 saniye arasında olmalı." };
    }
    const bannersWithOrder = cleanBanners.map((b, i) => ({ ...b, sortOrder: i }));

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
