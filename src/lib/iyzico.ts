import crypto from "crypto";

const apiKey = process.env.CASTA_IYZICO_API_KEY || "nbnNPsUN4SxonHRlm9L1Klj1Lcq02B69";
const secretKey = process.env.CASTA_IYZICO_SECRET_KEY || "uUymSXcpbnA59nkLdsVEet177mdN1J0S";
const baseUri = process.env.CASTA_IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

// Enforce correct base URL for sandbox vs production
const cleanBaseUrl = baseUri.includes("sandbox")
  ? "https://sandbox-api.iyzipay.com"
  : "https://api.iyzipay.com";

function generateIyzicoHeaders(path: string, body: any) {
  // Generate random string
  const hrTime = process.hrtime();
  const randomString = hrTime[0] + Math.random().toString(8).slice(2);

  // Signature: HmacSHA256 of: randomString + path + JSON body
  const rawData = randomString + path + JSON.stringify(body);
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawData)
    .digest("hex");

  const authorizationHash = Buffer.from(
    `apiKey:${apiKey}&randomKey:${randomString}&signature:${signature}`
  ).toString("base64");

  return {
    "Content-Type": "application/json",
    "x-iyzi-rnd": randomString,
    "x-iyzi-client-version": "iyzipay-node-2.0.69",
    "Authorization": `IYZWSv2 ${authorizationHash}`,
  };
}

export async function initializeCheckoutForm(requestBody: any) {
  const path = "/payment/iyzipay/checkoutform/initialize";
  const url = `${cleanBaseUrl}${path}`;
  const headers = generateIyzicoHeaders(path, requestBody);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Iyzico API connection error: ${response.statusText}`);
  }

  return response.json();
}

export async function retrieveCheckoutForm(token: string) {
  const path = "/payment/iyzipos/checkoutform/auth/ecom/detail";
  const url = `${cleanBaseUrl}${path}`;
  const requestBody = {
    locale: "tr",
    conversationId: `RETRIEVE-${Date.now()}`,
    token,
  };
  const headers = generateIyzicoHeaders(path, requestBody);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Iyzico API connection error: ${response.statusText}`);
  }

  return response.json();
}
