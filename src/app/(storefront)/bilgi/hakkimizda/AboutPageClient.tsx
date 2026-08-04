"use client";

import { useEffect } from "react";

export function AboutPageClient() {
  useEffect(() => {
    document.body.classList.add("page-hakkimizda");
    return () => document.body.classList.remove("page-hakkimizda");
  }, []);

  return null;
}
