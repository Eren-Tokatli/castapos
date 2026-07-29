import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializeCheckoutForm } from "@/lib/iyzico";
import { auth } from "@/auth";
import { PREMIUM_YEARLY_PRICE } from "@/lib/premium";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kind, orderId, installmentId, customerId, paymentLinkId } = body;

    if (!kind || (kind !== "ORDER" && kind !== "INSTALLMENT" && kind !== "MEMBERSHIP" && kind !== "PAYLINK")) {
      return NextResponse.json(
        { error: "Geçersiz işlem türü (ORDER, INSTALLMENT, MEMBERSHIP veya PAYLINK olmalıdır)." },
        { status: 400 }
      );
    }

    let amount = 0;
    let buyerId = "";
    let buyerName = "";
    let buyerSurname = "";
    let buyerPhone = "";
    let buyerEmail = "";
    let buyerAddress = "";
    let buyerCity = "Istanbul";
    let basketItems: any[] = [];
    let dbUpdateData: any = {};

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    // Unique callback token
    const callbackToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    if (kind === "ORDER") {
      if (!orderId) {
        return NextResponse.json({ error: "Sipariş ID gereklidir." }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
      }

      amount = order.total;
      buyerId = order.userId || "GUEST";
      buyerName = order.billingFirstName;
      buyerSurname = order.billingLastName;
      buyerPhone = order.phone || "+905000000000";
      buyerEmail = order.email;
      buyerAddress = `${order.billingAddressLine1} ${order.billingAddressLine2 || ""}`.trim();
      buyerCity = order.billingCity || "Istanbul";

      basketItems = order.items.map((item: any) => ({
        id: item.productId,
        name: item.name,
        category1: "Electronics",
        itemType: "PHYSICAL",
        price: item.lineTotal.toString(),
      }));

      dbUpdateData = {
        kind: "ORDER",
        orderId: order.id,
        payerName: `${buyerName} ${buyerSurname}`,
        payerEmail: buyerEmail,
        payerPhone: buyerPhone,
        amount,
        description: `${order.orderNumber} nolu sipariş ödemesi`,
      };
    } else if (kind === "INSTALLMENT") {
      if (!installmentId) {
        return NextResponse.json({ error: "Taksit ID gereklidir." }, { status: 400 });
      }

      const installment = await prisma.installment.findUnique({
        where: { id: installmentId },
      });

      if (!installment) {
        return NextResponse.json({ error: "Taksit bulunamadı." }, { status: 404 });
      }

      const agreement = await prisma.rentalAgreement.findUnique({
        where: { id: installment.rentalAgreementId },
      });

      if (!agreement) {
        return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });
      }

      amount = installment.amount;
      buyerId = agreement.userId || "CUSTOMER";
      
      const nameParts = agreement.tenantName.trim().split(" ");
      buyerSurname = nameParts.pop() || "";
      buyerName = nameParts.join(" ") || "Müşteri";
      
      buyerPhone = agreement.phone;
      buyerEmail = agreement.email || "destek@castapos.com";
      buyerAddress = agreement.address || "İstanbul Merkez";
      buyerCity = agreement.city || "Istanbul";

      basketItems = [
        {
          id: installment.id,
          name: `${agreement.assetName} - Taksit Ödemesi`,
          category1: "Rental",
          itemType: "VIRTUAL",
          price: amount.toString(),
        },
      ];

      dbUpdateData = {
        kind: "INSTALLMENT",
        installmentId: installment.id,
        payerName: agreement.tenantName,
        payerEmail: buyerEmail,
        payerPhone: buyerPhone,
        amount,
        description: `${agreement.assetName} kiralama taksiti (${installment.description || "Taksit"})`,
      };
    } else if (kind === "MEMBERSHIP") {
      // MEMBERSHIP — only the signed-in customer may start a checkout for their own id
      const session = await auth();
      const sessionCustomerId = session?.user?.id;

      if (!sessionCustomerId || sessionCustomerId !== customerId) {
        return NextResponse.json({ error: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { id: customerId },
        include: { customerProfile: true },
      });
      if (!user) {
        return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
      }

      if (user.customerProfile?.isPremiumMember) {
        return NextResponse.json({ error: "Zaten Premium üyesiniz." }, { status: 400 });
      }

      amount = PREMIUM_YEARLY_PRICE;
      buyerId = user.id;
      buyerName = user.firstName;
      buyerSurname = user.lastName;
      buyerPhone = user.phone || "+905000000000";
      buyerEmail = user.email;
      buyerAddress = user.customerProfile?.addresses?.[0]?.addressLine1 || "İstanbul Merkez";
      buyerCity = user.customerProfile?.addresses?.[0]?.city || "Istanbul";

      basketItems = [
        {
          id: user.id,
          name: "Castapos Premium Üyelik (Yıllık)",
          category1: "Membership",
          itemType: "VIRTUAL",
          price: amount.toString(),
        },
      ];

      dbUpdateData = {
        kind: "MEMBERSHIP",
        userId: user.id,
        payerName: `${user.firstName} ${user.lastName}`,
        payerEmail: buyerEmail,
        payerPhone: buyerPhone,
        amount,
        description: "Castapos Premium Üyelik (Yıllık)",
      };
    } else {
      // PAYLINK
      if (!paymentLinkId) {
        return NextResponse.json({ error: "Ödeme linki ID gereklidir." }, { status: 400 });
      }

      const paylink = await prisma.paymentLink.findUnique({
        where: { id: paymentLinkId },
      });

      if (!paylink) {
        return NextResponse.json({ error: "Ödeme linki bulunamadı." }, { status: 404 });
      }

      if (paylink.paid) {
        return NextResponse.json({ error: "Bu ödeme linki zaten ödenmiştir." }, { status: 400 });
      }

      amount = paylink.amount;
      buyerId = "PAYLINK_GUEST";

      const nameParts = paylink.payerName.trim().split(" ");
      buyerSurname = nameParts.pop() || "";
      buyerName = nameParts.join(" ") || "Müşteri";

      buyerPhone = paylink.payerPhone || "+905000000000";
      buyerEmail = paylink.payerEmail;
      buyerAddress = "İstanbul Merkez / Türkiye";
      buyerCity = "Istanbul";

      basketItems = [
        {
          id: paylink.id,
          name: paylink.description,
          category1: "PaymentLink",
          itemType: "VIRTUAL",
          price: amount.toString(),
        },
      ];

      dbUpdateData = {
        kind: "PAYLINK",
        paymentLinkId: paylink.id,
        payerName: paylink.payerName,
        payerEmail: buyerEmail,
        payerPhone: buyerPhone,
        amount,
        description: paylink.description,
      };
    }

    // Format phone to match Iyzico +90GSM format
    let cleanPhone = buyerPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone.startsWith("90")) {
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "90" + cleanPhone.substring(1);
      } else {
        cleanPhone = "90" + cleanPhone;
      }
    }
    const formattedPhone = "+" + cleanPhone;

    // Build checkout form request
    const iyzicoRequest = {
      locale: "tr",
      conversationId: `CASTAPOS-${Date.now()}`,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: "TRY",
      basketId: orderId || installmentId || customerId,
      paymentGroup: "PRODUCT",
      callbackUrl: `${origin}/api/iyzico/callback/${callbackToken}`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: buyerId,
        name: buyerName,
        surname: buyerSurname,
        gsmNumber: formattedPhone,
        email: buyerEmail,
        identityNumber: "11111111111", // Default sandbox TC
        registrationAddress: buyerAddress,
        ip: "85.34.78.112",
        city: buyerCity,
        country: "Turkey",
        zipCode: "34000",
      },
      shippingAddress: {
        contactName: `${buyerName} ${buyerSurname}`,
        city: buyerCity,
        country: "Turkey",
        address: buyerAddress,
        zipCode: "34000",
      },
      billingAddress: {
        contactName: `${buyerName} ${buyerSurname}`,
        city: buyerCity,
        country: "Turkey",
        address: buyerAddress,
        zipCode: "34000",
      },
      basketItems,
    };

    const iyzicoResult = await initializeCheckoutForm(iyzicoRequest);

    if (iyzicoResult.status !== "success") {
      return NextResponse.json(
        { error: iyzicoResult.errorMessage || "Iyzico form başlatılamadı." },
        { status: 502 }
      );
    }

    // Save PENDING PaymentRecord linked with callbackToken
    await prisma.paymentRecord.create({
      data: {
        ...dbUpdateData,
        iyzicoToken: callbackToken, // Storing our callback token
        iyzicoPaymentId: iyzicoResult.token, // Store Iyzico checkout token
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      checkoutFormContent: iyzicoResult.checkoutFormContent,
      token: iyzicoResult.token,
    });
  } catch (error: any) {
    console.error("Iyzico Checkout Init Error:", error);
    return NextResponse.json(
      { error: "Ödeme işlemi başlatılamadı." },
      { status: 500 }
    );
  }
}
