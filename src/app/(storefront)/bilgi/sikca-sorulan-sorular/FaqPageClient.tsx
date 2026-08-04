"use client";

import { useEffect } from "react";

export function FaqPageClient() {
  useEffect(() => {
    document.body.classList.add("page-sikca-sorulan-sorular");
    return () => document.body.classList.remove("page-sikca-sorulan-sorular");
  }, []);

  return null;
}
