import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveCheckoutForm } from "@/lib/iyzico";

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
        await prisma.order.update({
          where: { id: paymentRecord.orderId },
          data: {
            paymentStatus: "SUCCESS",
            status: "PAID",
          },
        });

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

          return NextResponse.redirect(
            new URL(`/takip/${agreement.id}?payment=success`, request.url),
            303
          );
        }

        return NextResponse.redirect(new URL("/takip", request.url), 303);
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
            new URL(`/takip/${installment.rentalAgreementId}?payment=error&msg=${encodeURIComponent(errorMessage)}`, request.url),
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
