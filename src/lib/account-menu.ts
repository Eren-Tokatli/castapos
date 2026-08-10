import {
  Package,
  LifeBuoy,
  Star,
  UserCircle,
  Headset,
  type LucideIcon,
} from "lucide-react";

export type AccountMenuLink = {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
};

// Single source of truth for the account menu — used by both the header
// "Kullanıcı Bilgilerim" hover dropdown and the /hesap/* sidebar so they
// never drift. Kullanıcı Bilgilerim is the account landing page now (the
// header avatar and sidebar brand link both point straight here), so it's
// listed first. Çıkış Yap is rendered separately since it's an action, not a link.
export const ACCOUNT_MENU_LINKS: AccountMenuLink[] = [
  { href: "/hesap/kullanici-bilgilerim", label: "Kullanıcı Bilgilerim", desc: "Ad, e-posta, telefon ve adreslerin.", icon: UserCircle },
  { href: "/hesap/siparislerim", label: "Siparişlerim", desc: "Geçmiş ve devam eden kiralamaların.", icon: Package },
  { href: "/hesap/destek", label: "Soru ve Taleplerim", desc: "Soruların ve destek geçmişin.", icon: LifeBuoy },
  { href: "/hesap/degerlendirmelerim", label: "Değerlendirmelerim", desc: "Ürünler için yaptığın değerlendirmeler.", icon: Star },
  { href: "/hesap/musteri-hizmetleri", label: "Müşteri Hizmetleri", desc: "Canlı destek ile iletişime geç.", icon: Headset },
];
