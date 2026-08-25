"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

interface CartItem {
  id: string;
  qty: number;
  period?: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  amount: number;
}

// Kuponun sepete uygulanabilir olup olmadığını kontrol eder (kod var mı,
// aktif mi, süresi geçmiş mi, kullanım limiti dolmuş mu, min. sepet tutarı
// karşılanıyor mu, bu kullanıcı kişi başı limitine ulaşmış mı). Sepet
// sayfasında "Uygula" butonuna basınca ve checkout'ta ikinci kez (sepet
// değişmiş/kupon süresi bu arada dolmuş olabilir diye) çağrılır.
export async function validateCoupon(
  code: string,
  cartTotal: number
): Promise<{ success: true; coupon: AppliedCoupon } | { success: false; error: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { success: false, error: "Kupon kodu boş olamaz." };

  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.active) {
    return { success: false, error: "Kupon kodu geçerli değil." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { success: false, error: "Bu kuponun süresi dolmuş." };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { success: false, error: "Bu kupon kullanım limitine ulaştı." };
  }
  if (coupon.minCartTotal != null && cartTotal < coupon.minCartTotal) {
    return {
      success: false,
      error: `Bu kupon için sepet tutarı en az ₺${coupon.minCartTotal.toLocaleString("tr-TR")} olmalı.`,
    };
  }
  if (coupon.usageLimitPerUser != null) {
    const session = await auth();
    if (session?.user?.id) {
      const userUses = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, userId: session.user.id },
      });
      if (userUses >= coupon.usageLimitPerUser) {
        return { success: false, error: "Bu kuponu zaten kullandın." };
      }
    }
  }

  return {
    success: true,
    coupon: { code: coupon.code, discountType: coupon.discountType, amount: coupon.amount },
  };
}

export async function createStorefrontOrder(
  shippingForm: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    taxOrNationalId: string;
    city: string;
    district: string;
    address: string;
    orderNote?: string;
  },
  cartItems: CartItem[],
  couponCode?: string
) {
  try {
    if (!/^[0-9]{11}$/.test(shippingForm.taxOrNationalId || "")) {
      return { success: false, error: "T.C. kimlik numarası 11 haneli olmalıdır." };
    }

    // Kiralama üyelik zorunlu — sepet sayfası bunu zaten kontrol edip giriş
    // sayfasına yönlendiriyor, ama o client tarafı bir kontrol; asıl güvenlik
    // burada. userId olmadan sipariş oluşmasına izin verilmez, aksi halde
    // "Siparişlerim" sayfası (userId'ye göre filtreliyor) bu siparişi hiçbir
    // yerde göstermez ve müşteri kendi siparişini takip edemez.
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Sipariş vermek için giriş yapmalısın." };
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // item.id storefront'ta ürünün Prisma slug'ı — sepet artık doğrudan
    // gerçek katalogdan geldiği için ayrı bir statik katalog köprüsüne
    // gerek yok, fiyat/paket verisi doğrudan buradan çözülüyor.
    const itemsData = await Promise.all(
      cartItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { slug: item.id },
        });

        if (!product) {
          throw new Error(`Ürün bulunamadı: ${item.id}`);
        }

        const duration = Math.max(1, item.period || 1);
        const tier = product.rentalTiers.find((t) => t.durationMonths === duration);
        const termTotal = tier ? tier.price : (product.rentalTiers[0]?.price || 0);
        const rentalTierLabel = tier ? tier.label : `${duration} Ay`;

        // Tier price is the total for the whole rental term, paid in equal
        // monthly installments — checkout only collects the first month here.
        // Kuruşa yuvarla: yuvarlanmamış ondalık (örn. 266.6666666666667) Iyzico'ya
        // gönderildiğinde "Geçersiz istek" hatasıyla ödeme başlatma tamamen
        // başarısız oluyordu — tutarlar zaten kuruş hassasiyetinden fazlasını
        // ifade edemez.
        const monthlyAmount = Math.round((termTotal / duration) * 100) / 100;
        const lineTotal = Math.round(monthlyAmount * item.qty * 100) / 100;

        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          saleMode: "RENT" as any,
          rentalTierLabel,
          quantity: item.qty,
          unitPrice: monthlyAmount,
          lineTotal,
          options: [], // empty for simplicity
        };
      })
    );

    const itemsSubtotal = itemsData.reduce((sum, i) => sum + i.lineTotal, 0);

    // Kupon burada YENİDEN doğrulanır — sepette "Uygula" denildiğinde geçerli
    // olması, checkout anında da geçerli olacağı anlamına gelmez (bu arada
    // süresi dolmuş, limiti dolmuş ya da kaldırılmış olabilir). İndirim tutarı
    // hiçbir zaman istemciden gelen bir sayıya güvenilerek değil, burada
    // sunucu tarafında yeniden hesaplanır.
    let discount = 0;
    let appliedCoupon: Awaited<ReturnType<typeof prisma.coupon.findUnique>> = null;
    if (couponCode) {
      const validation = await validateCoupon(couponCode, itemsSubtotal);
      if (validation.success) {
        appliedCoupon = await prisma.coupon.findUnique({ where: { code: validation.coupon.code } });
        if (appliedCoupon) {
          discount =
            appliedCoupon.discountType === "PERCENTAGE"
              ? Math.round(itemsSubtotal * (appliedCoupon.amount / 100) * 100) / 100
              : Math.min(appliedCoupon.amount, itemsSubtotal);
        }
      }
      // Kupon artık geçersizse (süresi dolmuş vb.) sessizce indirimsiz devam
      // ediyoruz — kullanıcı sepet sayfasında zaten "Uygula" derken bunu görmüş
      // olacaktı, checkout'u burada tıkanmasın diye siparişi engellemiyoruz.
    }

    const total = itemsSubtotal - discount;

    // Save order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: "PENDING_PAYMENT",
        currency: "TRY",
        subtotal: itemsSubtotal,
        shippingTotal: 0,
        taxTotal: total * 0.20, // 20% VAT
        total,
        billingFirstName: shippingForm.firstName,
        billingLastName: shippingForm.lastName,
        billingAddressLine1: shippingForm.address,
        billingAddressLine2: shippingForm.district,
        billingCity: shippingForm.city,
        billingPostcode: "34000",
        billingCountry: "Türkiye",
        shippingFirstName: shippingForm.firstName,
        shippingLastName: shippingForm.lastName,
        shippingAddressLine1: shippingForm.address,
        shippingAddressLine2: shippingForm.district,
        shippingCity: shippingForm.city,
        shippingPostcode: "34000",
        shippingCountry: "Türkiye",
        email: shippingForm.email,
        phone: shippingForm.phone,
        taxOrNationalId: shippingForm.taxOrNationalId,
        items: itemsData,
        totalLines: [
          { code: "subtotal", title: "Ara Toplam", value: itemsSubtotal, sortOrder: 1 },
          { code: "discount", title: "İndirim", value: -discount, sortOrder: 2 },
          { code: "total", title: "Toplam", value: total, sortOrder: 3 },
        ],
        paymentMethod: "IYZICO",
        paymentStatus: "PENDING",
      },
    });

    if (appliedCoupon && discount > 0) {
      await prisma.$transaction([
        prisma.coupon.update({ where: { id: appliedCoupon.id }, data: { usedCount: { increment: 1 } } }),
        prisma.couponRedemption.create({
          data: {
            couponId: appliedCoupon.id,
            userId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            discountAmount: discount,
          },
        }),
      ]);
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/kampanyalar");
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error("Create Storefront Order Error:", error);
    return { success: false, error: error.message || "Sipariş kaydedilirken bir hata oluştu." };
  }
}
