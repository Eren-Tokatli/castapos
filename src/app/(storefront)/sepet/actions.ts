"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CartItem {
  id: string;
  qty: number;
  period?: number;
  mode: "buy" | "rent";
}

export async function createStorefrontOrder(
  shippingForm: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    address: string;
    orderNote?: string;
  },
  cartItems: CartItem[],
  monthlyTotal: number,
  discountAmount: number
) {
  try {
    const total = monthlyTotal - discountAmount;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Map cart items with details from the products in DB
    const itemsData = await Promise.all(
      cartItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`Ürün bulunamadı: ${item.id}`);
        }

        const isBuy = item.mode === "buy";
        let unitPrice = 0;
        let rentalTierLabel = null;

        if (isBuy) {
          unitPrice = product.buyPrice || 0;
        } else {
          const duration = item.period || 1;
          const tier = product.rentalTiers.find((t) => t.durationMonths === duration);
          unitPrice = tier ? tier.price : (product.rentalTiers[0]?.price || 0);
          rentalTierLabel = tier ? tier.label : `${duration} Ay`;
        }

        const lineTotal = unitPrice * item.qty;

        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          saleMode: isBuy ? "BUY" : "RENT" as any,
          rentalTierLabel,
          quantity: item.qty,
          unitPrice,
          lineTotal,
          options: [], // empty for simplicity
        };
      })
    );

    // Save order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING_PAYMENT",
        currency: "TRY",
        subtotal: monthlyTotal,
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
        items: itemsData,
        totalLines: [
          { code: "subtotal", title: "Ara Toplam", value: monthlyTotal, sortOrder: 1 },
          { code: "discount", title: "İndirim", value: -discountAmount, sortOrder: 2 },
          { code: "total", title: "Toplam", value: total, sortOrder: 3 },
        ],
        paymentMethod: "IYZICO",
        paymentStatus: "PENDING",
      },
    });

    revalidatePath("/admin/payments");
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error("Create Storefront Order Error:", error);
    return { success: false, error: error.message || "Sipariş kaydedilirken bir hata oluştu." };
  }
}
