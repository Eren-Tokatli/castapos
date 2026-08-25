import { prisma } from "@/lib/prisma";

// Hem /api/otp/verify hem de auth.ts'teki hesap girişi MFA'sı bu ortak
// mantığı kullanır — daha önce ikisi de aynı deseni (identifier+code+consumed
// filtresiyle findFirst) ayrı ayrı uyguluyordu, hiçbirinde deneme sınırı yoktu.
// 4 haneli kod (1000-9999) sınırsız denenebiliyordu; şemada zaten duran ama
// hiç kullanılmayan OtpCode.attempts alanı burada gerçek işlevine kavuşuyor.

const MAX_VERIFY_ATTEMPTS = 5;
const MAX_REQUESTS_PER_WINDOW = 3;
const REQUEST_WINDOW_MINUTES = 15;

export async function canRequestOtp(
  identifier: string
): Promise<{ allowed: true } | { allowed: false; error: string }> {
  const windowStart = new Date(Date.now() - REQUEST_WINDOW_MINUTES * 60 * 1000);
  const recentCount = await prisma.otpCode.count({
    where: { identifier, createdAt: { gte: windowStart } },
  });
  if (recentCount >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      error: `Çok fazla doğrulama kodu istendi. Lütfen ${REQUEST_WINDOW_MINUTES} dakika sonra tekrar dene.`,
    };
  }
  return { allowed: true };
}

export type VerifyOtpResult = { success: true } | { success: false; error: string };

// Kodun kendisine göre değil, kimliğe (identifier) göre en son aktif kaydı
// bulur — yanlış kod girilse bile hangi kaydın deneme sayacının artırılacağı
// böyle netleşir. MAX_VERIFY_ATTEMPTS'i aşan kimlikler için kod hiç
// karşılaştırılmadan reddedilir (brute-force'u erkenden durdurur).
export async function verifyOtp(identifier: string, code: string): Promise<VerifyOtpResult> {
  const otp = await prisma.otpCode.findFirst({
    where: { identifier, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { success: false, error: "Geçersiz veya süresi dolmuş doğrulama kodu." };
  }

  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
    return { success: false, error: "Çok fazla yanlış deneme yapıldı. Lütfen yeni bir doğrulama kodu iste." };
  }

  if (otp.code !== code) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { success: false, error: "Geçersiz veya süresi dolmuş doğrulama kodu." };
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
  return { success: true };
}
