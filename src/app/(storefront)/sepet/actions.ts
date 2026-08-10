"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getProduct } from "@/lib/products-data";

interface CartItem {
  id: string;
  qty: number;
  period?: number;
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
  monthlyTotal: number,
  discountAmount: number
) {
  try {
    if (!/^[0-9]{11}$/.test(shippingForm.taxOrNationalId || "")) {
      return { success: false, error: "T.C. kimlik numarası 11 haneli olmalıdır." };
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Map cart items with details from the products in DB.
    // The storefront catalog (products-data.ts, static) and the admin-managed
    // Prisma Product catalog are two separate tables with unrelated ids/slugs —
    // ProductStatic.code is the only field that lines up with Product.sku, so
    // that's the bridge we resolve real pricing/tier data through.
    const itemsData = await Promise.all(
      cartItems.map(async (item) => {
        const staticProduct = getProduct(item.id);
        const product = await prisma.product.findUnique({
          where: { sku: staticProduct.code },
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
        const monthlyAmount = termTotal / duration;
        const lineTotal = monthlyAmount * item.qty;

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

    // Recompute totals from the resolved Prisma tier data — never trust the
    // client-submitted monthlyTotal, it's derived from the unrelated static
    // catalog's own (different) pricing and doesn't reflect what's charged.
    const itemsSubtotal = itemsData.reduce((sum, i) => sum + i.lineTotal, 0);
    const scaledDiscount = itemsSubtotal > 0 ? Math.round((discountAmount / monthlyTotal) * itemsSubtotal) : 0;
    const total = itemsSubtotal - scaledDiscount;

    // Save order
    const order = await prisma.order.create({
      data: {
        orderNumber,
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
          { code: "discount", title: "İndirim", value: -scaledDiscount, sortOrder: 2 },
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
