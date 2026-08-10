import { redirect } from "next/navigation";
import Link from "next/link";
import { Bot, Clock3, Mail, MapPin, MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/AccountShell";

export const dynamic = "force-dynamic";

const whatsappUrl =
  "https://wa.me/905448010433?text=Merhaba%20Castapos%2C%20kiralama%20s%C3%BCreci%20hakk%C4%B1nda%20destek%20almak%20istiyorum.";

const supportActions = [
  {
    icon: MessageCircle,
    title: "WhatsApp ile yaz",
    text: "Destek ekibimizle sohbet başlat.",
    value: "+90 544 801 04 33",
    href: whatsappUrl,
    external: true,
    featured: true,
  },
  {
    icon: PhoneCall,
    title: "Telefonla ara",
    text: "Sipariş, teslimat ve ürün desteği için ulaş.",
    value: "+90 544 801 04 33",
    href: "tel:+905448010433",
  },
  {
    icon: Bot,
    title: "AI ile sohbet",
    text: "Ürün seçimi ve kiralama süreci için hızlı öneri al.",
    value: "Akıllı asistanı aç",
    href: "/ai-sohbet",
  },
  {
    icon: Mail,
    title: "İletişim bilgileri",
    text: "Adres, e-posta ve form bilgilerini görüntüle.",
    value: "İletişim sayfasına git",
    href: "/bilgi/iletisim",
  },
];

export default async function MusteriHizmetleriPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/hesap/giris?callbackUrl=/hesap/musteri-hizmetleri");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : session?.user?.name || "Castapos üyesi";

  return (
    <AccountShell displayName={displayName} email={user?.email || session?.user?.email || ""}>
      <div className="account-panel-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="section-kicker">Hesabım</span>
          <h1>Müşteri Hizmetleri</h1>
          <p>Ürün seçimi, teslimat, ödeme ve kiralama planı için doğru destek kanalını seçebilirsin.</p>
        </div>
        <span className="order-status-pill tone-done">Çevrimiçi</span>
      </div>

      <div className="live-support-page-card" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
        <div className="live-support-action-list">
          {supportActions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <span className="live-support-action-icon">
                  <Icon size={22} />
                </span>
                <span>
                  <b>{action.title}</b>
                  <small>{action.text}</small>
                </span>
                <strong>{action.value}</strong>
              </>
            );

            return action.external ? (
              <a
                key={action.title}
                className={`live-support-action ${action.featured ? "featured" : ""}`}
                href={action.href}
                target="_blank"
                rel="noopener"
              >
                {content}
              </a>
            ) : (
              <Link
                key={action.title}
                className={`live-support-action ${action.featured ? "featured" : ""}`}
                href={action.href}
              >
                {content}
              </Link>
            );
          })}
        </div>

        <div className="live-support-page-note">
          <div>
            <Clock3 size={18} />
            <span>Yanıt süreleri yoğunluğa göre değişebilir; mesaj bırakırsan ekibimiz en kısa sürede dönüş yapar.</span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>Sipariş ve ödeme bilgilerini yalnızca resmi Castapos kanallarında paylaş.</span>
          </div>
          <div>
            <MapPin size={18} />
            <span>Türkiye operasyon merkezi: Levent, Beşiktaş/İstanbul.</span>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
