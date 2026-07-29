import React from "react";
import StorefrontLayout from "@/app/(storefront)/layout";

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
