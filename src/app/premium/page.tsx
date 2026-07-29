import { Percent, Truck, Headset, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PREMIUM_BENEFITS, PREMIUM_YEARLY_PRICE } from "@/lib/premium";
import { formatPrice } from "@/lib/products-data";
import { PremiumPurchasePanel } from "./PremiumPurchasePanel";

const BENEFIT_ICONS = [Percent, Truck, Headset, Sparkles];

export default async function PremiumPage() {
  const session = await auth();
  const customerId = session?.user?.id;

  const user = customerId
    ? await prisma.user.findUnique({
        where: { id: customerId },
        include: { customerProfile: true },
      })
    : null;

  return (
    <section className="premium-hero">
      <div className="container premium-hero-inner">
        <span className="auth-eyebrow">Castapos Premium</span>
        <h1>Kiralamanın en ayrıcalıklı hali.</h1>
        <p>
          Premium üyelikle her ay ekstra indirim, ücretsiz öncelikli teslimat ve öncelikli destekten
          yararlan — yıllık tek ödeme ile.
        </p>
      </div>

      <div className="container premium-benefits-grid">
        {PREMIUM_BENEFITS.map((b, i) => {
          const BenefitIcon = BENEFIT_ICONS[i];
          return (
            <article key={b.title} className="premium-benefit-card">
              <span className="premium-benefit-mark">
                <BenefitIcon size={17} />
              </span>
              <b>{b.title}</b>
              <span>{b.text}</span>
            </article>
          );
        })}
      </div>

      <div className="container">
        <PremiumPurchasePanel
          isLoggedIn={!!session?.user}
          isPremium={user?.customerProfile?.isPremiumMember ?? false}
          premiumExpiresAt={user?.customerProfile?.premiumExpiresAt?.toISOString() ?? null}
          customerId={customerId ?? null}
          priceFormatted={formatPrice(PREMIUM_YEARLY_PRICE)}
        />
      </div>
    </section>
  );
}
