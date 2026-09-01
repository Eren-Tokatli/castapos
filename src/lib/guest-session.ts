import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

// Giriş yapmamış ziyaretçilerin canlı destek sohbetini kaybetmeden
// devam edebilmesi için tarayıcıya yazılan, imzalı/şifreli bir kimlik.
// Bu bir "hesap" değil — sadece "bu tarayıcı daha önce bu sohbeti açmış
// mıydı" sorusuna cevap veren, sunucu tarafından okunabilir bir çerez.
// AUTH_SECRET zaten proje genelinde kullanılıyor (next-auth), burada da
// aynı sırrı kullanıyoruz — yeni bir env değişkeni gerekmiyor.

export interface GuestSessionData {
  guestId?: string;
  guestName?: string;
}

const sessionOptions: SessionOptions = {
  password: process.env.AUTH_SECRET as string,
  cookieName: "castapos_guest_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90, // 90 gün
  },
};

export async function getGuestSession() {
  const cookieStore = await cookies();
  return getIronSession<GuestSessionData>(cookieStore, sessionOptions);
}
