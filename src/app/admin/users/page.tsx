import React from "react";
import { prisma } from "@/lib/prisma";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, orders, tickets, profiles] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({
      select: {
        userId: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        total: true,
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supportTicket.findMany({ select: { userId: true } }),
    prisma.customerProfile.findMany({ select: { userId: true, isPremiumMember: true } }),
  ]);

  const ordersByUser = new Map<string, typeof orders>();
  for (const o of orders) {
    if (!o.userId) continue;
    const list = ordersByUser.get(o.userId) || [];
    list.push(o);
    ordersByUser.set(o.userId, list);
  }
  const ticketCountByUser = new Map<string, number>();
  for (const t of tickets) {
    if (!t.userId) continue; // canlı destek widget'ından gelen misafir talepleri
    ticketCountByUser.set(t.userId, (ticketCountByUser.get(t.userId) || 0) + 1);
  }
  const premiumByUser = new Map(profiles.map((p) => [p.userId, p.isPremiumMember]));

  const serialized = users.map((u) => {
    const userOrders = ordersByUser.get(u.id) || [];
    const paidOrders = userOrders.filter((o) => o.status === "PAID");
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const itemsPurchased = paidOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      orderCount: userOrders.length,
      ticketCount: ticketCountByUser.get(u.id) || 0,
      isPremiumMember: premiumByUser.get(u.id) || false,
      totalSpent,
      itemsPurchased,
      recentOrders: userOrders.slice(0, 5).map((o) => ({
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        total: o.total,
        itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
      })),
    };
  });

  return <UsersClient users={serialized} />;
}
