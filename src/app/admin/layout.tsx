import React from "react";
import { AdminLayoutClient } from "./AdminLayoutClient";
import { AdminToastProvider } from "./_components/ToastProvider";

export const metadata = {
  title: "Castapos Admin Panel",
  description: "CRM and Inventory Management Portal",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminToastProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminToastProvider>
  );
}
