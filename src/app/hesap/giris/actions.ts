"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function requestMfaCode(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    return { success: false, error: "E-posta veya şifre hatalı." };
  }

  // Compare password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "E-posta veya şifre hatalı." };
  }

  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // Save to OtpCode
  await prisma.otpCode.create({
    data: {
      identifier: cleanEmail,
      code,
      expiresAt,
    },
  });

  // NetGSM Send SMS
  const phone = user.phone;
  let smsSent = false;

  if (phone) {
    const netgsmUser = process.env.CASTA_NETGSM_USER;
    const netgsmPass = process.env.CASTA_NETGSM_PASSWORD;
    const netgsmHeader = process.env.CASTA_NETGSM_HEADER || "Castapos";
    const smsMessage = `Castapos giris dogrulama kodunuz: ${code}`;

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
        console.error("MFA SMS NetGSM Hatası:", error);
      }
    } else {
      console.log(`[SMS MOCK] NetGSM Config Eksik. MFA Kod: ${code} -> Tel: ${phone}`);
      smsSent = true;
    }
  } else {
    console.log(`[MFA BYPASS/EMAIL] User has no phone number. MFA Kod: ${code} for email: ${cleanEmail}`);
  }

  return {
    success: true,
    mfaRequired: true,
    maskedPhone: phone ? phone.substring(0, 3) + "****" + phone.substring(phone.length - 4) : null,
    // Debug for development:
    ...(process.env.NODE_ENV !== "production" ? { debugCode: code } : {}),
  };
}
