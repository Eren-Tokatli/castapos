import React from "react";
import { TakipOtpForm } from "./TakipOtpForm";
import { redirect } from "next/navigation";

export default async function TakipOtpVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ tc?: string }>;
}) {
  const { tc } = await searchParams;

  if (!tc) {
    redirect("/takip");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 flex flex-col justify-center items-center px-4">
      <TakipOtpForm tc={tc} />
    </div>
  );
}
