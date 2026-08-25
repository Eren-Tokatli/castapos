import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canRequestOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taxOrNationalId } = body;

    if (!taxOrNationalId) {
      return NextResponse.json(
        { error: "T.C. Kimlik / Vergi Numarası gereklidir." },
        { status: 400 }
      );
    }

    const cleanTc = taxOrNationalId.trim().replace(/[^0-9]/g, "");

    // Hız sınırı: aynı kimlik için art arda çok sayıda kod istenip SMS/e-posta
    // spam'i yapılmasını (ve NetGSM maliyetini) önler. Agreement sorgusundan
    // önce kontrol ediliyor — gereksiz sorgu/işlem yapmadan erken reddet.
    const rateLimit = await canRequestOtp(cleanTc);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    // Search for a matching agreement
    const agreement = await prisma.rentalAgreement.findFirst({
      where: {
        taxOrNationalId: cleanTc,
      },
    });

    if (!agreement) {
      return NextResponse.json(
        { error: "Girilen T.C. numarasına ait kiralama sözleşmesi bulunamadı." },
        { status: 404 }
      );
    }

    const phone = agreement.phone;
    if (!phone) {
      return NextResponse.json(
        { error: "Sözleşmede tanımlı telefon numarası bulunamadı." },
        { status: 400 }
      );
    }

    // Generate 4 digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Save to OtpCode
    await prisma.otpCode.create({
      data: {
        identifier: cleanTc,
        code,
        expiresAt,
      },
    });

    // NetGSM settings
    const netgsmUser = process.env.CASTA_NETGSM_USER;
    const netgsmPass = process.env.CASTA_NETGSM_PASSWORD;
    const netgsmHeader = process.env.CASTA_NETGSM_HEADER || "Castapos";

    const smsMessage = `Castapos dogrulama kodunuz: ${code}`;
    let smsSent = false;

    if (netgsmUser && netgsmPass) {
      const xml = `<?xml version='1.0' encoding='UTF-8'?>
<mainbody>
    <header>
        <company>Netgsm</company>
        <usercode>${netgsmUser}</usercode>
        <password>${netgsmPass}</password>
        <type>1:n</type>
        <msgheader>${netgsmHeader}</msgheader>
    </header>
    <body>
        <msg><![CDATA[${smsMessage}]]></msg>
        <no>${phone}</no>
    </body>
</mainbody>`;

      try {
        const response = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
          method: "POST",
          headers: {
            "Content-Type": "text/xml",
          },
          body: xml,
        });
        const responseText = await response.text();
        if (responseText.startsWith("00") || responseText.startsWith("01")) {
          smsSent = true;
        }
      } catch (error) {
        console.error("NetGSM SMS Gönderim Hatası:", error);
      }
    } else {
      console.log(`[SMS MOCK] NetGSM Config Eksik. Kod: ${code} -> Tel: ${phone}`);
      smsSent = true; // Simulating success in dev
    }

    return NextResponse.json({
      success: true,
      message: "Doğrulama kodu gönderildi.",
      // For development speed:
      ...(process.env.NODE_ENV !== "production" ? { debugCode: code } : {}),
    });
  } catch (error) {
    console.error("OTP Request Route Error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
