import React from "react";
import { prisma } from "@/lib/prisma";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, orders, tickets] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ select: { userId: true } }),
    prisma.supportTicket.findMany({ select: { userId: true } }),
  ]);

  const orderCountByUser = new Map<string, number>();
  for (const o of orders) {
    if (!o.userId) continue;
    orderCountByUser.set(o.userId, (orderCountByUser.get(o.userId) || 0) + 1);
  }
  const ticketCountByUser = new Map<string, number>();
  for (const t of tickets) {
    ticketCountByUser.set(t.userId, (ticketCountByUser.get(t.userId) || 0) + 1);
  }

  const serialized = users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    orderCount: orderCountByUser.get(u.id) || 0,
    ticketCount: ticketCountByUser.get(u.id) || 0,
  }));

  return <UsersClient users={serialized} />;
}
