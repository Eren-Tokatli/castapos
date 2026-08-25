"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateCustomerIdentity } from "@/lib/account-security";
import { buildOtpEmail, sendTransactionalEmail } from "@/lib/email";
import { canRequestOtp, verifyOtp } from "@/lib/otp";

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[@$!%*?&._-]/.test(password)
  );
}

export async function sendEmailOtp(email: string, firstName?: string, lastName?: string) {
  const cleanEmail = email.toLowerCase().trim();

  const identityError = validateCustomerIdentity({
    email: cleanEmail,
    firstName,
    lastName,
  });
  if (identityError) {
    return { success: false, error: identityError };
  }

  // Existing user check
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return { success: false, error: "Bu e-posta adresi zaten kullanımda." };
  }

  // Hız sınırı — art arda çok sayıda doğrulama kodu isteyip e-posta spam'i
  // yapılmasını engeller.
  const rateLimit = await canRequestOtp(cleanEmail);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.error };
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

  const otpEmail = buildOtpEmail(code, "register");
  const emailResult = await sendTransactionalEmail({
    to: cleanEmail,
    ...otpEmail,
  });

  if (!emailResult.sent) {
    return { success: false, error: "Doğrulama kodu e-postası gönderilemedi. Lütfen biraz sonra tekrar dene." };
  }

  return {
    success: true,
    deliveryChannel: emailResult.provider === "resend" ? "email" : "console",
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
  const identityError = validateCustomerIdentity({
    email,
    firstName: form.firstName,
    lastName: form.lastName,
  });
  if (identityError) {
    return { success: false, error: identityError };
  }
  if (!isStrongPassword(form.password)) {
    return { success: false, error: "Şifreniz belirlenen tüm güvenlik kriterlerini karşılamalıdır." };
  }

  // Enforce phone validation
  const cleanPhone = form.phone ? form.phone.replace(/[^0-9]/g, "") : "";
  if (form.phone && cleanPhone.length !== 10) {
    return { success: false, error: "Telefon numarası 10 hane olmalıdır (Örn: 5051234567)." };
  }

  // Verify Email OTP Code — deneme sınırlı (brute-force koruması), bkz. lib/otp.ts.
  const otpResult = await verifyOtp(email, form.verificationCode.trim());
  if (!otpResult.success) {
    return { success: false, error: otpResult.error };
  }

  // Check existing user once more
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Bu e-posta ile zaten bir hesap var." };
  }

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
