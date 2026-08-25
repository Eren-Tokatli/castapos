import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taxOrNationalId, code } = body;

    if (!taxOrNationalId || !code) {
      return NextResponse.json(
        { error: "T.C. numarası ve doğrulama kodu gereklidir." },
        { status: 400 }
      );
    }

    const cleanTc = taxOrNationalId.trim().replace(/[^0-9]/g, "");
    const cleanCode = code.trim();

    // Deneme sınırlı doğrulama — 5 yanlış denemeden sonra kod hiç
    // karşılaştırılmadan reddedilir (4 haneli kodun brute-force'la
    // bulunmasını engeller).
    const result = await verifyOtp(cleanTc, cleanCode);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.error.includes("Çok fazla") ? 429 : 400 });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("takip_tc", cleanTc, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return NextResponse.json({
      success: true,
      message: "Doğrulama başarılı.",
    });
  } catch (error) {
    console.error("OTP Verify Route Error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
