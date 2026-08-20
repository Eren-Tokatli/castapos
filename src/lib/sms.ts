// NetGSM SMS gönderimi — src/app/api/otp/request/route.ts içindeki mantıkla
// aynı, tekilleştirmek için buraya taşındı. Ortam değişkenleri eksikse
// sessizce console mock'a düşer (dev ortamında SMS servisini bloke etmez).
export async function sendSms(phone: string, message: string): Promise<boolean> {
  const netgsmUser = process.env.CASTA_NETGSM_USER;
  const netgsmPass = process.env.CASTA_NETGSM_PASSWORD;
  const netgsmHeader = process.env.CASTA_NETGSM_HEADER || "Castapos";

  if (!netgsmUser || !netgsmPass) {
    console.log(`[SMS MOCK] NetGSM Config Eksik. Tel: ${phone}\n${message}`);
    return true;
  }

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
        <msg><![CDATA[${message}]]></msg>
        <no>${phone}</no>
    </body>
</mainbody>`;

  try {
    const response = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: xml,
    });
    const responseText = await response.text();
    return responseText.startsWith("00") || responseText.startsWith("01");
  } catch (error) {
    console.error("NetGSM SMS Gönderim Hatası:", error);
    return false;
  }
}
