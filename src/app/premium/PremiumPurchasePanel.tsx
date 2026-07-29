"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { IyzicoCheckoutFrame } from "@/components/IyzicoCheckoutFrame";

export function PremiumPurchasePanel({
  isLoggedIn,
  isPremium,
  premiumExpiresAt,
  customerId,
  priceFormatted,
}: {
  isLoggedIn: boolean;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  customerId: string | null;
  priceFormatted: string;
}) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (isPremium) {
    return (
      <div className="premium-purchase-card is-premium">
        <div>
          <span className="membership-kicker"><Star size={13} fill="currentColor" strokeWidth={0} /> Premium Üye</span>
          <b>
            {premiumExpiresAt
              ? `Üyeliğin ${new Date(premiumExpiresAt).toLocaleDateString("tr-TR")} tarihine kadar aktif`
              : "Premium üyeliğin aktif"}
          </b>
          <span className="membership-sub">Tüm Premium ayrıcalıklarından yararlanıyorsun.</span>
        </div>
        <Link className="btn btn-soft" href="/hesap/panel">
          Hesabıma dön
        </Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="premium-purchase-card">
        <div>
          <span className="membership-kicker">Yıllık {priceFormatted}</span>
          <b>Premium&apos;a geçmek için giriş yap</b>
          <span className="membership-sub">Üyeliğe devam etmek için önce hesabına giriş yapman gerekiyor.</span>
        </div>
        <Link className="btn btn-primary" href="/hesap/giris?callbackUrl=/premium">
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (checkoutOpen && customerId) {
    return (
      <div className="premium-purchase-card checkout-open">
        <div style={{ width: "100%" }}>
          <span className="membership-kicker">Güvenli Ödeme (Iyzico 3D Secure)</span>
          <IyzicoCheckoutFrame kind="MEMBERSHIP" referenceId={customerId} />
        </div>
      </div>
    );
  }

  return (
    <div className="premium-purchase-card">
      <div>
        <span className="membership-kicker">Yıllık {priceFormatted}</span>
        <b>Premium Üye Ol</b>
        <span className="membership-sub">Tek seferlik yıllık ödeme, otomatik yenileme yoktur.</span>
      </div>
      <button className="btn btn-primary" type="button" onClick={() => setCheckoutOpen(true)}>
        Premium Üye Ol
      </button>
    </div>
  );
}
