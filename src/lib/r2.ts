// Cloudflare R2 — admin panelden dosya yükleme (banner/ürün/kampanya
// görselleri). R2, S3 API'siyle uyumlu olduğu için @aws-sdk/client-s3
// kullanılıyor; Vercel Blob yerine bilerek seçildi çünkü R2 bağımsız bir
// servis — hosting'i Vercel'den başka bir yere taşısak da görseller ve
// upload kodu (S3 API'si her yerde çalışır) aynen çalışmaya devam eder.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;
const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

export const r2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucketName && publicUrl);

let client: S3Client | null = null;
function getClient() {
  if (!r2Configured) {
    throw new Error("R2 yapılandırılmamış — .env içindeki R2_* değişkenlerini kontrol edin.");
  }
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    });
  }
  return client;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Sadece JPG, PNG, WEBP, GIF veya SVG yükleyebilirsin.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Dosya çok büyük — en fazla 20MB olabilir.";
  }
  return null;
}

// folder: "banners" | "products" | "campaigns" gibi — R2'de görselleri
// gruplamak için, sadece key prefix'i.
export async function uploadImageToR2(file: Buffer, contentType: string, folder: string): Promise<string> {
  const ext = contentType.split("/")[1]?.replace("svg+xml", "svg") || "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${publicUrl!.replace(/\/$/, "")}/${key}`;
}
