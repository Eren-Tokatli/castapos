type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult = {
  sent: boolean;
  provider: "resend" | "console";
};

const resendApiUrl = "https://api.resend.com/emails";

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.TRANSACTIONAL_EMAIL_FROM || "Castapos <noreply@castapos.com>";

  if (!resendApiKey) {
    console.log(`[EMAIL MOCK] ${input.subject} -> ${input.to}\n${input.text}`);
    return { sent: true, provider: "console" };
  }

  const response = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    console.error("Transactional email failed:", message);
    return { sent: false, provider: "resend" };
  }

  return { sent: true, provider: "resend" };
}

export function buildOrderConfirmationEmail(input: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: { name: string; quantity: number; rentalTierLabel: string; lineTotal: number }[];
}) {
  const formatTl = (value: number) =>
    `${Math.round(value).toLocaleString("tr-TR")} TL`;

  const itemsText = input.items
    .map((i) => `- ${i.name} (${i.rentalTierLabel}, ${i.quantity} adet): ${formatTl(i.lineTotal)}`)
    .join("\n");

  const itemsHtml = input.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #edf0f5;color:#101828">${i.name}<br/><span style="color:#667085;font-size:13px">${i.rentalTierLabel} · ${i.quantity} adet</span></td>
          <td style="padding:10px 0;border-bottom:1px solid #edf0f5;color:#101828;text-align:right;white-space:nowrap">${formatTl(i.lineTotal)}</td>
        </tr>`
    )
    .join("");

  return {
    subject: `Siparişin alındı — ${input.orderNumber}`,
    text: `Merhaba ${input.customerName},\n\n${input.orderNumber} numaralı siparişin alındı ve ödemen tamamlandı.\n\n${itemsText}\n\nToplam: ${formatTl(input.total)}\n\nSiparişini "Siparişlerim" sayfandan takip edebilirsin.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:28px">
        <div style="max-width:560px;margin:auto;background:#ffffff;border:1px solid #e5e7ee;border-radius:18px;padding:28px">
          <div style="font-size:20px;font-weight:800;color:#07111f;margin-bottom:10px">Castapos</div>
          <h1 style="font-size:22px;line-height:1.25;color:#07111f;margin:0 0 6px">Siparişin alındı 🎉</h1>
          <p style="font-size:14px;color:#667085;margin:0 0 4px">Sipariş no: <b style="color:#101828">${input.orderNumber}</b></p>
          <p style="font-size:15px;line-height:1.55;color:#667085;margin:0 0 20px">Merhaba ${input.customerName}, ödemen başarıyla tamamlandı. Kiralama süreci başladı.</p>
          <table style="width:100%;border-collapse:collapse">
            ${itemsHtml}
            <tr>
              <td style="padding-top:14px;font-weight:900;font-size:17px;color:#101828">Toplam</td>
              <td style="padding-top:14px;font-weight:900;font-size:17px;color:#101828;text-align:right">${formatTl(input.total)}</td>
            </tr>
          </table>
          <p style="font-size:13px;line-height:1.5;color:#667085;margin:22px 0 0">Siparişinin durumunu hesabındaki "Siparişlerim" sayfasından takip edebilirsin.</p>
        </div>
      </div>
    `,
  };
}

export function buildInstallmentReminderEmail(input: {
  tenantName: string;
  assetName: string;
  amount: number;
  dueDate: Date;
  payUrl: string;
}) {
  const formatTl = (value: number) => `${Math.round(value).toLocaleString("tr-TR")} TL`;
  const dueDateStr = input.dueDate.toLocaleDateString("tr-TR");

  return {
    subject: `Ödeme hatırlatması — ${dueDateStr} son ödeme tarihi`,
    text: `Merhaba ${input.tenantName},\n\n${input.assetName} kiralamanız için ${formatTl(input.amount)} tutarındaki taksitin son ödeme tarihi ${dueDateStr}.\n\nÖdeme linki: ${input.payUrl}\n\nSorun yaşarsanız bize ulaşabilirsiniz.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:28px">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #e5e7ee;border-radius:18px;padding:28px">
          <div style="font-size:20px;font-weight:800;color:#07111f;margin-bottom:10px">Castapos</div>
          <h1 style="font-size:22px;line-height:1.25;color:#07111f;margin:0 0 10px">Ödeme hatırlatması</h1>
          <p style="font-size:15px;line-height:1.55;color:#667085;margin:0 0 20px">Merhaba ${input.tenantName}, <b>${input.assetName}</b> kiralamanız için son ödeme tarihi yaklaşıyor.</p>
          <div style="background:#f8fafc;border:1px solid #edf0f5;border-radius:14px;padding:18px;margin:0 0 20px">
            <p style="margin:0 0 6px;font-size:12px;color:#667085;font-weight:700;text-transform:uppercase">Son Ödeme Tarihi</p>
            <p style="margin:0 0 14px;font-size:16px;color:#101828;font-weight:800">${dueDateStr}</p>
            <p style="margin:0 0 6px;font-size:12px;color:#667085;font-weight:700;text-transform:uppercase">Tutar</p>
            <p style="margin:0;font-size:22px;color:#f35f36;font-weight:900">${formatTl(input.amount)}</p>
          </div>
          <a href="${input.payUrl}" style="display:block;text-align:center;background:#101828;color:#fff;font-weight:800;text-decoration:none;padding:14px;border-radius:12px">Güvenli Öde</a>
          <p style="font-size:12px;line-height:1.5;color:#98a2b3;margin:20px 0 0">Ödemeyi zaten yaptıysanız bu e-postayı dikkate almayabilirsiniz.</p>
        </div>
      </div>
    `,
  };
}

export function buildRentalExtensionReminderEmail(input: {
  tenantName: string;
  assetName: string;
  daysLeft: 30 | 7 | 1;
  rentalEnd: Date;
  extendUrl: string;
}) {
  const rentalEndStr = input.rentalEnd.toLocaleDateString("tr-TR");
  const periodLabel =
    input.daysLeft === 30 ? "1 ay" : input.daysLeft === 7 ? "1 hafta" : "1 gün";
  const urgent = input.daysLeft === 1;

  return {
    subject: urgent
      ? `Son gün — ${input.assetName} kiralaman yarın sona eriyor`
      : `${periodLabel} kaldı — ${input.assetName} kiralaman ${rentalEndStr} tarihinde sona eriyor`,
    text: `Merhaba ${input.tenantName},\n\n${input.assetName} kiralamanın bitişine ${periodLabel} kaldı (son gün: ${rentalEndStr}).\n\nDevam etmek istersen kiralamanı uzatabilirsin: ${input.extendUrl}\n\nBir şey yapmazsan kiralaman ${rentalEndStr} tarihinde sona erecek.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:28px">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #e5e7ee;border-radius:18px;padding:28px">
          <div style="font-size:20px;font-weight:800;color:#07111f;margin-bottom:10px">Castapos</div>
          <h1 style="font-size:22px;line-height:1.25;color:#07111f;margin:0 0 10px">${urgent ? "Kiralaman yarın sona eriyor" : "Kiralaman sona ermek üzere"}</h1>
          <p style="font-size:15px;line-height:1.55;color:#667085;margin:0 0 20px">Merhaba ${input.tenantName}, <b>${input.assetName}</b> kiralamanın bitişine <b>${periodLabel}</b> kaldı.</p>
          <div style="background:#f8fafc;border:1px solid #edf0f5;border-radius:14px;padding:18px;margin:0 0 20px">
            <p style="margin:0 0 6px;font-size:12px;color:#667085;font-weight:700;text-transform:uppercase">Bitiş Tarihi</p>
            <p style="margin:0;font-size:16px;color:#101828;font-weight:800">${rentalEndStr}</p>
          </div>
          <a href="${input.extendUrl}" style="display:block;text-align:center;background:#101828;color:#fff;font-weight:800;text-decoration:none;padding:14px;border-radius:12px">Kiralamamı Uzat</a>
          <p style="font-size:12px;line-height:1.5;color:#98a2b3;margin:20px 0 0">Bir şey yapmazsan kiralaman ${rentalEndStr} tarihinde sona erer. Ürünü uzatmak istemiyorsan bu e-postayı dikkate almayabilirsin.</p>
        </div>
      </div>
    `,
  };
}

export function buildReviewInviteEmail(input: {
  tenantName: string;
  assetName: string;
  reviewUrl: string;
}) {
  return {
    subject: `${input.assetName} deneyimin nasıldı? Değerlendir, %10 kupon kazan`,
    text: `Merhaba ${input.tenantName},\n\n${input.assetName} kiralaman sona erdi. Deneyimini değerlendirmen 2 dakikanı alır ve bize çok yardımcı olur — üstelik değerlendirme yaptığında bir sonraki siparişinde geçerli %10 indirim kuponu hesabına otomatik tanımlanır.\n\nDeğerlendir: ${input.reviewUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:28px">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #e5e7ee;border-radius:18px;padding:28px">
          <div style="font-size:20px;font-weight:800;color:#07111f;margin-bottom:10px">Castapos</div>
          <h1 style="font-size:22px;line-height:1.25;color:#07111f;margin:0 0 10px">Deneyimin nasıldı?</h1>
          <p style="font-size:15px;line-height:1.55;color:#667085;margin:0 0 20px">Merhaba ${input.tenantName}, <b>${input.assetName}</b> kiralaman sona erdi. Deneyimini değerlendirir misin?</p>
          <div style="background:#fff4ef;border:1px solid #ffd4c7;border-radius:14px;padding:18px;margin:0 0 20px">
            <p style="margin:0;font-size:14px;line-height:1.5;color:#101828"><b>Değerlendirme yapınca</b> bir sonraki siparişinde geçerli <b style="color:#f35f36">%10 indirim kuponu</b> otomatik olarak hesabına tanımlanır.</p>
          </div>
          <a href="${input.reviewUrl}" style="display:block;text-align:center;background:#101828;color:#fff;font-weight:800;text-decoration:none;padding:14px;border-radius:12px">Deneyimimi Değerlendir</a>
        </div>
      </div>
    `,
  };
}

export function buildReviewThankYouCouponEmail(input: {
  customerName: string;
  couponCode: string;
  expiresAt: Date;
}) {
  const expiresStr = input.expiresAt.toLocaleDateString("tr-TR");

  return {
    subject: "Değerlendirmen için teşekkürler — %10 kuponun hazır",
    text: `Merhaba ${input.customerName},\n\nDeğerlendirmen için teşekkür ederiz! Bir sonraki siparişinde kullanabileceğin %10 indirim kuponun hesabına tanımlandı.\n\nKupon kodu: ${input.couponCode}\nSon kullanma tarihi: ${expiresStr}\n\nSepette "Kupon Kodu" alanına yapıştırman yeterli.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:28px">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #e5e7ee;border-radius:18px;padding:28px">
          <div style="font-size:20px;font-weight:800;color:#07111f;margin-bottom:10px">Castapos</div>
          <h1 style="font-size:22px;line-height:1.25;color:#07111f;margin:0 0 10px">Teşekkürler! 🎉</h1>
          <p style="font-size:15px;line-height:1.55;color:#667085;margin:0 0 20px">Merhaba ${input.customerName}, değerlendirmen için teşekkür ederiz. Bir sonraki siparişinde kullanabileceğin kuponun hazır.</p>
          <div style="background:#fff4ef;border:1px solid #ffd4c7;border-radius:14px;padding:20px;text-align:center;margin:0 0 16px">
            <p style="margin:0 0 8px;font-size:12px;color:#667085;font-weight:700;text-transform:uppercase">Kupon Kodu</p>
            <p style="margin:0;letter-spacing:3px;font-size:26px;font-weight:900;color:#f35f36">${input.couponCode}</p>
          </div>
          <p style="font-size:13px;line-height:1.5;color:#667085;margin:0 0 4px">İndirim: <b style="color:#101828">%10</b></p>
          <p style="font-size:13px;line-height:1.5;color:#667085;margin:0">Son kullanma tarihi: <b style="color:#101828">${expiresStr}</b></p>
          <p style="font-size:12px;line-height:1.5;color:#98a2b3;margin:20px 0 0">Sepette "Kupon Kodu" alanına yapıştırman yeterli.</p>
        </div>
      </div>
    `,
  };
}

export function buildOtpEmail(code: string, purpose: "login" | "register") {
  const title = purpose === "login" ? "Castapos giriş doğrulama kodun" : "Castapos e-posta doğrulama kodun";
  const description =
    purpose === "login"
      ? "Hesabına güvenli giriş yapmak için aşağıdaki MFA kodunu kullan."
      : "Castapos hesabını oluşturmak için aşağıdaki doğrulama kodunu kullan.";

  return {
    subject: title,
    text: `${description}\n\nKod: ${code}\n\nBu kod 10 dakika içinde geçerliliğini kaybeder.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:28px">
        <div style="max-width:520px;margin:auto;background:#ffffff;border:1px solid #e5e7ee;border-radius:18px;padding:28px">
          <div style="font-size:20px;font-weight:800;color:#07111f;margin-bottom:10px">Castapos</div>
          <h1 style="font-size:24px;line-height:1.25;color:#07111f;margin:0 0 10px">${title}</h1>
          <p style="font-size:15px;line-height:1.55;color:#667085;margin:0 0 20px">${description}</p>
          <div style="letter-spacing:8px;font-size:34px;font-weight:900;color:#f35f36;background:#fff4ef;border:1px solid #ffd4c7;border-radius:14px;padding:18px 20px;text-align:center">${code}</div>
          <p style="font-size:13px;line-height:1.5;color:#667085;margin:20px 0 0">Bu kod 10 dakika içinde geçerliliğini kaybeder. Bu işlemi sen başlatmadıysan bu e-postayı dikkate alma.</p>
        </div>
      </div>
    `,
  };
}
