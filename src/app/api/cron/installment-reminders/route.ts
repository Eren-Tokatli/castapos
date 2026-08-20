import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail, buildInstallmentReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/// Her gün çalışır (bkz. vercel.json), vadesi 3 gün sonra olan ödenmemiş
/// taksitler için otomatik e-posta hatırlatması gönderir ve admin panelinde
/// "Ödeme Kayıtları"nda görünecek bir ödeme linki kaydı oluşturur/günceller.
/// WhatsApp otomatik gönderilemiyor (WhatsApp Business API entegrasyonu yok) —
/// admin Taksitler sayfasındaki WhatsApp butonuyla elle gönderebilir.
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

  // "3 gün sonra" penceresi: bugünden +3 gün, o günün tamamı (00:00–23:59:59.999)
  // — dueDate'lerin saat bileşeni sipariş anına göre değişebildiği için gün
  // bazında eşleştiriyoruz, tam saniyeye değil.
  const target = new Date();
  target.setDate(target.getDate() + 3);
  const dayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const installments = await prisma.installment.findMany({
    where: { paid: false, dueDate: { gte: dayStart, lt: dayEnd } },
  });

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const installment of installments) {
    try {
      const agreement = await prisma.rentalAgreement.findUnique({
        where: { id: installment.rentalAgreementId },
      });
      if (!agreement) { skipped++; continue; }

      // Aynı gün içinde tekrar tekrar göndermeyi önle (cron birden fazla
      // tetiklenirse veya admin aynı gün elle link oluşturduysa).
      const existingLink = await prisma.paymentLink.findFirst({ where: { installmentId: installment.id } });
      if (existingLink?.lastSentAt) {
        const hoursSinceLastSend = (Date.now() - existingLink.lastSentAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSend < 20) { skipped++; continue; }
      }

      if (!agreement.email) { skipped++; continue; }

      const payUrl = `${origin}/pay/taksit/${installment.id}`;
      const email = buildInstallmentReminderEmail({
        tenantName: agreement.tenantName,
        assetName: agreement.assetName,
        amount: installment.amount,
        dueDate: installment.dueDate,
        payUrl,
      });
      await sendTransactionalEmail({ to: agreement.email, ...email });

      if (existingLink) {
        await prisma.paymentLink.update({ where: { id: existingLink.id }, data: { lastSentAt: new Date() } });
      } else {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await prisma.paymentLink.create({
          data: {
            token,
            payerName: agreement.tenantName,
            payerEmail: agreement.email,
            payerPhone: agreement.phone || null,
            amount: installment.amount,
            description: `${installment.description || "Taksit Ödemesi"} — ${agreement.assetName}`,
            paid: false,
            installmentId: installment.id,
            lastSentAt: new Date(),
          },
        });
      }

      sent++;
    } catch (error: any) {
      errors.push(`${installment.id}: ${error.message}`);
    }
  }

  return NextResponse.json({ checked: installments.length, sent, skipped, errors });
}
