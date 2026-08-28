import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImageToR2, validateUploadFile, r2Configured } from "@/lib/r2";

// Admin panelden görsel dosyası yükleme (banner/ürün/kampanya). Sadece
// ADMIN rolü kullanabilir — middleware.ts /admin sayfalarını korur ama
// /api altındaki bu route'u kapsamaz, o yüzden yetki kontrolü burada.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
  }

  if (!r2Configured) {
    return NextResponse.json({ error: "Dosya deposu yapılandırılmamış (R2)." }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }
  if (typeof folder !== "string" || !/^[a-z-]+$/.test(folder)) {
    return NextResponse.json({ error: "Geçersiz klasör." }, { status: 400 });
  }

  const validationError = validateUploadFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageToR2(buffer, file.type, folder);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("R2 upload hatası:", err);
    return NextResponse.json({ error: "Yükleme başarısız oldu, tekrar deneyin." }, { status: 500 });
  }
}
