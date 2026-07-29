"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const DISPOSABLE_DOMAINS = [
  "yopmail.com", "tempmail.com", "dispostable.com", "disposable.com", "mailinator.com",
  "getairmail.com", "guerrillamail.com", "sharklasers.com", "10minutemail.com",
  "trashmail.com", "fakeinbox.com", "generator.email", "temp-mail.org", "moakt.com",
  "fakemailgenerator.com", "crazymailing.com", "tempmailaddress.com", "tempmail.net",
  "guerrillamailblock.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz",
  "pokemail.net", "grr.la", "block.com", "disposablemail.com", "mailnesia.com",
  "dismail.de", "mailcatch.com", "maildrop.cc", "getnada.com", "tempmailo.com"
];

function isDisposableEmail(email: string): boolean {
  const parts = email.toLowerCase().trim().split("@");
  if (parts.length !== 2) return true;
  const domain = parts[1];
  return DISPOSABLE_DOMAINS.some(d => domain === d || domain.endsWith("." + d));
}

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[@$!%*?&._-]/.test(password)
  );
}

export async function sendEmailOtp(email: string) {
  const cleanEmail = email.toLowerCase().trim();

  // Basic format validation
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Geçersiz e-posta adresi." };
  }

  // Disposable block list check
  if (isDisposableEmail(cleanEmail)) {
    return { success: false, error: "Tek kullanımlık veya geçici e-posta adresleriyle kayıt olunamaz." };
  }

  // Existing user check
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return { success: false, error: "Bu e-posta adresi zaten kullanımda." };
  }

  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

  // Save to OtpCode
  await prisma.otpCode.create({
    data: {
      identifier: cleanEmail,
      code,
      expiresAt,
    },
  });

  // Log code to console for development verification
  console.log(`[EMAIL OTP SEED] Registration code generated for ${cleanEmail} ➔ ${code}`);

  return {
    success: true,
    // Debug for development:
    ...(process.env.NODE_ENV !== "production" ? { debugCode: code } : {}),
  };
}

export async function registerCustomer(form: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  verificationCode: string;
}) {
  const email = form.email.toLowerCase().trim();

  if (!form.firstName.trim() || !form.lastName.trim()) {
    return { success: false, error: "Ad ve soyad gereklidir." };
  }
  if (!email) {
    return { success: false, error: "E-posta gereklidir." };
  }
  if (isDisposableEmail(email)) {
    return { success: false, error: "Geçici e-posta adresleriyle kayıt olunamaz." };
  }
  if (!isStrongPassword(form.password)) {
    return { success: false, error: "Şifreniz belirlenen tüm güvenlik kriterlerini karşılamalıdır." };
  }

  // Enforce phone validation
  let cleanPhone = form.phone ? form.phone.replace(/[^0-9]/g, "") : "";
  if (form.phone && cleanPhone.length !== 10) {
    return { success: false, error: "Telefon numarası 10 hane olmalıdır (Örn: 5051234567)." };
  }

  // Verify Email OTP Code
  const otp = await prisma.otpCode.findFirst({
    where: {
      identifier: email,
      code: form.verificationCode.trim(),
      consumed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { success: false, error: "E-posta doğrulama kodu geçersiz veya süresi dolmuş." };
  }

  // Check existing user once more
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Bu e-posta ile zaten bir hesap var." };
  }

  // Consume OTP
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumed: true },
  });

  const passwordHash = await bcrypt.hash(form.password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: cleanPhone || undefined,
      role: "CUSTOMER",
      customerProfile: {
        create: {}
      }
    },
  });

  return { success: true };
}
