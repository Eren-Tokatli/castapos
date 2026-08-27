import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveCheckoutForm } from "@/lib/iyzico";
import { revalidatePath } from "next/cache";
import type { Order, PaymentRecord } from "@/generated/prisma";
import { sendTransactionalEmail, buildOrderConfirmationEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";

/// Ödemesi tamamlanan siparişteki her satır için ürün stok adedini düşürür.
/// Stok 0'a inerse stockStatus otomatik OUT_OF_STOCK'a çekilir; negatife
/// düşmesin diye 0'da sabitlenir.
async function decrementStockForOrder(order: Order) {
  for (const item of order.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;

    const newQuantity = Math.max(0, product.quantity - item.quantity);
    await prisma.product.update({
      where: { id: product.id },
      data: {
        quantity: newQuantity,
        stockStatus: newQuantity === 0 ? "OUT_OF_STOCK" : product.stockStatus,
      },
    });
  }
}

/// Ödemesi tamamlanan siparişin özetini müşteriye e-posta + SMS ile bildirir.
/// Her iki kanal da altyapı env değişkenleri eksikse sessizce console mock'a
/// düşer — sipariş akışını asla bloklamaz (best-effort, hata yutulur).
async function sendOrderConfirmation(order: Order) {
  const customerName = `${order.billingFirstName} ${order.billingLastName}`.trim();

  try {
    const email = buildOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName,
      total: order.total,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        rentalTierLabel: item.rentalTierLabel || "",
        lineTotal: item.lineTotal,
      })),
    });
    await sendTransactionalEmail({ to: order.email, ...email });
  } catch (error) {
    console.error("Sipariş onay e-postası gönderilemedi:", error);
  }

  if (order.phone) {
    try {
      await sendSms(
        order.phone,
        `Castapos: ${order.orderNumber} numarali siparisiniz alindi, odemeniz tamamlandi. Toplam: ${Math.round(order.total).toLocaleString("tr-TR")} TL.`
      );
    } catch (error) {
      console.error("Sipariş onay SMS'i gönderilemedi:", error);
    }
  }
}

/// Creates one RentalAgreement (+ full installment calendar) per RENT item
/// in a just-paid Order. The order's checkout payment covers the first
/// month only (see sepet/actions.ts), so installment #1 is marked paid and
/// the rest are left open for later collection via the customer's /takip
/// portal or an admin-sent payment link.
async function createRentalAgreementsFromOrder(order: Order) {
  const rentItems = order.items.filter((item) => item.saleMode === "RENT");

  for (const item of rentItems) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    const tier = product?.rentalTiers.find((t) => t.label === item.rentalTierLabel);
    const term = tier?.durationMonths || 1;
    const monthlyAmount = item.unitPrice;
    const rentalStart = new Date();
    const rentalEnd = new Date(rentalStart);
    rentalEnd.setMonth(rentalStart.getMonth() + term);

    const agreement = await prisma.rentalAgreement.create({
      data: {
        userId: order.userId || undefined,
        orderReferenceNo: order.orderNumber,
        assetSku: item.sku || undefined,
        assetName: item.name,
        tenantName: `${order.billingFirstName} ${order.billingLastName}`.trim(),
        taxOrNationalId: order.taxOrNationalId || "",
        phone: order.phone || "",
        email: order.email,
        address: `${order.billingAddressLine1} ${order.billingAddressLine2 || ""}`.trim(),
        city: order.billingCity,
        rentalTermMonths: term,
        monthlyAmount,
        rentalStart,
        rentalEnd,
        deliveryStatus: "PENDING",
        paymentStatus: term <= 1 ? "COMPLETED" : "CURRENT",
        paymentDueDay: rentalStart.getDate(),
      },
    });

    const installmentsData = Array.from({ length: term }, (_, i) => {
      const dueDate = new Date(rentalStart);
      dueDate.setMonth(rentalStart.getMonth() + i);
      return {
        rentalAgreementId: agreement.id,
        dueDate,
        amount: monthlyAmount,
        paid: i === 0, // first month already collected at checkout
        description: `${i + 1}. Ay Ödemesi`,
      };
    });

    await prisma.installment.createMany({ data: installmentsData });
  }

  if (rentItems.length > 0) {
    revalidatePath("/admin/agreements");
    revalidatePath("/admin");
  }
}

/// EXTENSION ödemesi tamamlanınca çağrılır: rentalEnd'i seçilen paketin ay
/// sayısı kadar ileri alır ve o kadar yeni Installment satırı ekler — ilk ay
/// (bu ödeme) paid:true, kalanı normal /takip akışında tahsil edilmek üzere
/// unpaid. Mevcut bitiş tarihi henüz gelmemişse ondan devam eder (süre
/// üst üste binmez), geçmişse bugünden başlar.
async function extendRentalAgreement(paymentRecord: PaymentRecord) {
  if (!paymentRecord.rentalAgreementId || !paymentRecord.extensionMonths) return null;

  const agreement = await prisma.rentalAgreement.findUnique({
    where: { id: paymentRecord.rentalAgreementId },
  });
  if (!agreement) return null;

  const months = paymentRecord.extensionMonths;
  const monthlyAmount = paymentRecord.amount;
  const extendFrom = agreement.rentalEnd && agreement.rentalEnd > new Date() ? agreement.rentalEnd : new Date();
  const newRentalEnd = new Date(extendFrom);
  newRentalEnd.setMonth(newRentalEnd.getMonth() + months);

  const installmentsData = Array.from({ length: months }, (_, i) => {
    const dueDate = new Date(extendFrom);
    dueDate.setMonth(dueDate.getMonth() + i);
    return {
      rentalAgreementId: agreement.id,
      dueDate,
      amount: monthlyAmount,
      paid: i === 0, // uzatmanın ilk ayı bu ödemeyle tahsil edildi
      description: `Uzatma - ${i + 1}. Ay Ödemesi`,
    };
  });

  await prisma.installment.createMany({ data: installmentsData });

  // Uzatma öncesinden kalan ödenmemiş taksitler varsa (agreement daha önce
  // LATE olabilir) onları da say — paymentStatus'u sadece bu uzatmanın
  // taksitlerine değil, sözleşmenin tamamına göre belirle.
  const unpaidInstallments = await prisma.installment.count({
    where: { rentalAgreementId: agreement.id, paid: false },
  });

  await prisma.rentalAgreement.update({
    where: { id: agreement.id },
    data: {
      rentalEnd: newRentalEnd,
      rentalTermMonths: (agreement.rentalTermMonths || 0) + months,
      paymentStatus: unpaidInstallments === 0 ? "COMPLETED" : "CURRENT",
    },
  });

  revalidatePath("/admin/agreements");
  revalidatePath("/hesap/siparislerim");

  return agreement;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  let paymentRecord = null;
  const { token } = await params;

  try {
    // 1. Find corresponding payment record
    paymentRecord = await prisma.paymentRecord.findFirst({
      where: { iyzicoToken: token },
    });

    if (!paymentRecord) {
      return NextResponse.json(
        { error: "İşlem kaydı bulunamadı." },
        { status: 404 }
      );
    }

    // 2. Fetch results from Iyzico
    const iyzicoPaymentToken = paymentRecord.iyzicoPaymentId;
    if (!iyzicoPaymentToken) {
      throw new Error("Iyzico ödeme tokenı bulunamadı.");
    }

    const iyzicoResult = await retrieveCheckoutForm(iyzicoPaymentToken);

    // 3. Process payment status
    if (iyzicoResult.status === "success" && iyzicoResult.paymentStatus === "SUCCESS") {
      // Payment Successful
      await prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          status: "SUCCESS",
          iyzicoPaymentId: iyzicoResult.paymentId, // update with actual payment ID
        },
      });

      if (paymentRecord.kind === "ORDER" && paymentRecord.orderId) {
        // Update storefront Order status
        const order = await prisma.order.update({
          where: { id: paymentRecord.orderId },
          data: {
            paymentStatus: "SUCCESS",
            status: "PAID",
          },
        });

        // Auto-create a RentalAgreement (+ installment plan) for each rented
        // item in the order — first month is already paid (this checkout),
        // remaining months stay unpaid and get collected via /takip later.
        await createRentalAgreementsFromOrder(order);

        // Ödenen siparişteki ürünlerin stok adedini düş.
        await decrementStockForOrder(order);

        // Müşteriye e-posta + SMS ile sipariş onayı gönder (best-effort).
        await sendOrderConfirmation(order);

        // Redirect to success page
        return NextResponse.redirect(
          new URL(`/siparis/basarili/${paymentRecord.orderId}`, request.url),
          303
        );
      } else if (paymentRecord.kind === "INSTALLMENT" && paymentRecord.installmentId) {
        // Update installment payment status
        const installment = await prisma.installment.update({
          where: { id: paymentRecord.installmentId },
          data: { paid: true },
        });

        // Get agreement details to check overdue status
        const agreement = await prisma.rentalAgreement.findUnique({
          where: { id: installment.rentalAgreementId },
        });

        if (agreement) {
          // Check if there are any remaining unpaid installments
          const unpaidInstallments = await prisma.installment.count({
            where: {
              rentalAgreementId: agreement.id,
              paid: false,
            },
          });

          // Update agreement payment status
          await prisma.rentalAgreement.update({
            where: { id: agreement.id },
            data: {
              paymentStatus: unpaidInstallments === 0 ? "COMPLETED" : "CURRENT",
            },
          });

          // Admin panelinde "Ödeme Kayıtları"nda görünen takip kaydını da senkronla.
          await prisma.paymentLink.updateMany({
            where: { installmentId: installment.id },
            data: { paid: true },
          });

          // Tek başına taksit ödeme linkinden (/pay/taksit/[id]) de, /takip
          // panelinden de aynı hedefe döner — link "ödendi" durumunu kimlik
          // doğrulaması gerekmeden gösterir, her iki akış için de çalışır.
          return NextResponse.redirect(
            new URL(`/pay/taksit/${installment.id}?payment=success`, request.url),
            303
          );
        }

        return NextResponse.redirect(new URL(`/pay/taksit/${installment.id}`, request.url), 303);
      } else if (paymentRecord.kind === "MEMBERSHIP" && paymentRecord.userId) {
        const now = new Date();
        const expires = new Date(now);
        expires.setFullYear(expires.getFullYear() + 1);

        await prisma.customerProfile.update({
          where: { userId: paymentRecord.userId },
          data: {
            isPremiumMember: true,
            premiumSince: now,
            premiumExpiresAt: expires,
          },
        });

        return NextResponse.redirect(new URL("/premium/basarili", request.url), 303);
      } else if (paymentRecord.kind === "PAYLINK" && paymentRecord.paymentLinkId) {
        await prisma.paymentLink.update({
          where: { id: paymentRecord.paymentLinkId },
          data: { paid: true },
        });

        return NextResponse.redirect(
          new URL(`/pay/link/basarili?name=${encodeURIComponent(paymentRecord.payerName)}&amount=${paymentRecord.amount}`, request.url),
          303
        );
      } else if (paymentRecord.kind === "EXTENSION" && paymentRecord.rentalAgreementId) {
        const agreement = await extendRentalAgreement(paymentRecord);

        if (agreement) {
          return NextResponse.redirect(
            new URL(`/pay/uzatma/${agreement.id}?payment=success`, request.url),
            303
          );
        }
      }
    } else {
      // Payment Failed
      const errorMessage = iyzicoResult.errorMessage || "Ödeme işlemi başarısız.";
      await prisma.paymentRecord.update({
        where: { id: paymentRecord.id },
        data: {
          status: "FAILED",
          errorMessage: errorMessage,
        },
      });

      if (paymentRecord.kind === "ORDER" && paymentRecord.orderId) {
        await prisma.order.update({
          where: { id: paymentRecord.orderId },
          data: {
            paymentStatus: "FAILED",
            status: "PENDING_PAYMENT",
          },
        });

        return NextResponse.redirect(
          new URL("/siparis/basarisiz", request.url),
          303
        );
      } else if (paymentRecord.kind === "INSTALLMENT" && paymentRecord.installmentId) {
        const installment = await prisma.installment.findUnique({
          where: { id: paymentRecord.installmentId },
        });

        if (installment) {
          return NextResponse.redirect(
            new URL(`/pay/taksit/${installment.id}?payment=error&msg=${encodeURIComponent(errorMessage)}`, request.url),
            303
          );
        }
      } else if (paymentRecord.kind === "MEMBERSHIP") {
        return NextResponse.redirect(
          new URL(`/premium?payment=error&msg=${encodeURIComponent(errorMessage)}`, request.url),
          303
        );
      } else if (paymentRecord.kind === "PAYLINK" && paymentRecord.paymentLinkId) {
        const paylink = await prisma.paymentLink.findUnique({
          where: { id: paymentRecord.paymentLinkId },
        });
        if (paylink) {
          return NextResponse.redirect(
            new URL(`/pay/link/${paylink.token}?payment=error&msg=${encodeURIComponent(errorMessage)}`, request.url),
            303
          );
        }
      } else if (paymentRecord.kind === "EXTENSION" && paymentRecord.rentalAgreementId) {
        return NextResponse.redirect(
          new URL(`/pay/uzatma/${paymentRecord.rentalAgreementId}?payment=error&msg=${encodeURIComponent(errorMessage)}`, request.url),
          303
        );
      }
    }

    return NextResponse.redirect(new URL("/", request.url), 303);
  } catch (error) {
    console.error("Iyzico Callback Route Error:", error);
    
    // In case of error, redirect to home or dashboard
    if (paymentRecord && paymentRecord.kind === "ORDER" && paymentRecord.orderId) {
      return NextResponse.redirect(new URL("/siparis/basarisiz", request.url), 303);
    }
    return NextResponse.redirect(new URL("/", request.url), 303);
  }
}

// Support GET for testing callbacks if needed
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  return POST(request, { params });
}
