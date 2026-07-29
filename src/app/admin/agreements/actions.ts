"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAgreement(formData: any) {
  try {
    const {
      tenantName,
      taxOrNationalId,
      phone,
      email,
      address,
      city,
      assetName,
      assetSku,
      rentalTermMonths,
      monthlyAmount,
      rentalStart,
      serialNumber,
      deliveryStatus,
      paymentDueDay,
    } = formData;

    const term = parseInt(rentalTermMonths) || 0;
    const monthlyVal = parseFloat(monthlyAmount) || 0;
    const startDate = rentalStart ? new Date(rentalStart) : new Date();

    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + term);

    // Create Agreement
    const agreement = await prisma.rentalAgreement.create({
      data: {
        tenantName,
        taxOrNationalId,
        phone,
        email: email || null,
        address: address || null,
        city: city || null,
        assetName,
        assetSku: assetSku || null,
        rentalTermMonths: term,
        monthlyAmount: monthlyVal,
        rentalStart: startDate,
        rentalEnd: endDate,
        serialNumber: serialNumber || null,
        deliveryStatus: deliveryStatus || "PENDING",
        paymentStatus: "CURRENT",
        paymentDueDay: parseInt(paymentDueDay) || startDate.getDate(),
      },
    });

    // Auto-generate installments calendar
    const installmentsData = [];
    for (let i = 0; i < term; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);
      installmentsData.push({
        rentalAgreementId: agreement.id,
        dueDate,
        amount: monthlyVal,
        paid: false,
        description: `${i + 1}. Ay Ödemesi`,
      });
    }

    if (installmentsData.length > 0) {
      await prisma.installment.createMany({
        data: installmentsData,
      });
    }

    revalidatePath("/admin/agreements");
    revalidatePath("/admin");
    return { success: true, agreement };
  } catch (error: any) {
    console.error("Create Agreement Action Error:", error);
    return { success: false, error: error.message || "İşlem sırasında hata oluştu." };
  }
}

export async function updateAgreement(id: string, formData: any) {
  try {
    const {
      tenantName,
      taxOrNationalId,
      phone,
      email,
      address,
      city,
      assetName,
      assetSku,
      serialNumber,
      deliveryStatus,
      paymentStatus,
      notes,
    } = formData;

    const updated = await prisma.rentalAgreement.update({
      where: { id },
      data: {
        tenantName,
        taxOrNationalId,
        phone,
        email: email || null,
        address: address || null,
        city: city || null,
        assetName,
        assetSku: assetSku || null,
        serialNumber: serialNumber || null,
        deliveryStatus,
        paymentStatus,
        notes: notes || null,
      },
    });

    revalidatePath("/admin/agreements");
    revalidatePath("/admin");
    return { success: true, agreement: updated };
  } catch (error: any) {
    console.error("Update Agreement Action Error:", error);
    return { success: false, error: error.message || "Güncelleme sırasında hata oluştu." };
  }
}

export async function deleteAgreement(id: string) {
  try {
    // Delete associated installments first
    await prisma.installment.deleteMany({
      where: { rentalAgreementId: id },
    });

    // Delete agreement
    await prisma.rentalAgreement.delete({
      where: { id },
    });

    revalidatePath("/admin/agreements");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Agreement Action Error:", error);
    return { success: false, error: error.message || "Silme sırasında hata oluştu." };
  }
}

export async function toggleInstallmentPaid(id: string, paid: boolean) {
  try {
    const installment = await prisma.installment.update({
      where: { id },
      data: { paid },
    });

    // Recalculate agreement status
    const agreement = await prisma.rentalAgreement.findUnique({
      where: { id: installment.rentalAgreementId },
    });

    if (agreement) {
      const unpaidCount = await prisma.installment.count({
        where: {
          rentalAgreementId: agreement.id,
          paid: false,
          dueDate: { lt: new Date() },
        },
      });

      await prisma.rentalAgreement.update({
        where: { id: agreement.id },
        data: {
          paymentStatus: unpaidCount > 0 ? "LATE" : "CURRENT",
        },
      });
    }

    revalidatePath("/admin/agreements");
    revalidatePath("/admin/installments");
    revalidatePath("/admin");
    return { success: true, installment };
  } catch (error: any) {
    console.error("Toggle Installment Paid Action Error:", error);
    return { success: false, error: error.message || "İşlem sırasında hata oluştu." };
  }
}
