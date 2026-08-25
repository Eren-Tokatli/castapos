import React from "react";
import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = reviews.map((r) => ({
    id: r.id,
    userName: `${r.user.firstName} ${r.user.lastName}`.trim(),
    userEmail: r.user.email,
    productName: r.productName,
    productImage: r.productImage,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ReviewsClient reviews={serialized} />;
}
