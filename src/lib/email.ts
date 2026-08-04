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
