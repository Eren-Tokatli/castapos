import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail, buildRentalExtensionReminderEmail } from "@/lib/email";
import type { RentalAgreement } from "@/generated/prisma";

export const dynamic = "force-dynamic";

/// Her gün çalışır (bkz. vercel.json), bitişine tam 30/7/1 gün kalan aktif
/// kiralama sözleşmeleri için "uzatmak ister misin?" e-postası gönderir —
/// bkz. installment-reminders (aynı desen, farklı tetikleyici). Her eşik
/// sözleşme başına en fazla bir kez tetiklenir (reminderXSentAt alanları).
const MILESTONES = [
  { days: 30 as const, sentField: "reminder30SentAt" as const },
  { days: 7 as const, sentField: "reminder7SentAt" as const },
  { days: 1 as const, sentField: "reminder1SentAt" as const },
];

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const milestone of MILESTONES) {
    // "N gün sonra" penceresi: bugünden +N gün, o günün tamamı (00:00–23:59:59.999).
    const target = new Date();
    target.setDate(target.getDate() + milestone.days);
    const dayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const agreements = await prisma.rentalAgreement.findMany({
      where: {
        rentalEnd: { gte: dayStart, lt: dayEnd },
        deliveryStatus: { not: "RETURNED" },
        boughtOut: false,
        earlyReturn: false,
        [milestone.sentField]: null,
      },
    });

    for (const agreement of agreements as RentalAgreement[]) {
      try {
        if (!agreement.email) { skipped++; continue; }

        const extendUrl = `${origin}/pay/uzatma/${agreement.id}`;
        const email = buildRentalExtensionReminderEmail({
          tenantName: agreement.tenantName,
          assetName: agreement.assetName,
          daysLeft: milestone.days,
          rentalEnd: agreement.rentalEnd!,
          extendUrl,
        });
        const result = await sendTransactionalEmail({ to: agreement.email, ...email });
        if (!result.sent) {
          // Gönderim başarısız oldu (ör. Resend domain doğrulaması eksik) —
          // flag'i işaretlemeyiz ki yarın tekrar denensin, sessizce "gönderildi"
          // sayılmasın.
          errors.push(`${agreement.id} (${milestone.days}g): e-posta gönderilemedi`);
          continue;
        }

        await prisma.rentalAgreement.update({
          where: { id: agreement.id },
          data: { [milestone.sentField]: new Date() },
        });

        sent++;
      } catch (error: any) {
        errors.push(`${agreement.id} (${milestone.days}g): ${error.message}`);
      }
    }
  }

  return NextResponse.json({ sent, skipped, errors });
}
