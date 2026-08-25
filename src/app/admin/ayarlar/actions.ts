"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { SITE_SETTINGS_ID } from "@/lib/site-settings";

export interface SiteSettingsFormData {
  contactEmail: string;
  supportPhone: string;
  addressTr: string;
  addressUs: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
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
