import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

    // Verify OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        identifier: cleanTc,
        code: cleanCode,
        consumed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş doğrulama kodu." },
        { status: 400 }
      );
    }

    // Mark code as consumed
    await prisma.otpCode.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        consumed: true,
      },
    });

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
