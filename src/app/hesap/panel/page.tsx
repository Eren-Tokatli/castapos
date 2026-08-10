import { redirect } from "next/navigation";

// "Hesabım" panel sayfası kaldırıldı — Kullanıcı Bilgilerim artık hesap
// alanının giriş noktası. Bu route'a giden eski bağlantılar (kayıt sonrası
// yönlendirme, e-posta linkleri vb.) kırılmasın diye burada yönlendiriyoruz.
export default function AccountPanelRedirect() {
  redirect("/hesap/kullanici-bilgilerim");
}
