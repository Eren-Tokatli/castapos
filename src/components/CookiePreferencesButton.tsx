"use client";

import type { ReactNode } from "react";

type CookiePreferencesButtonProps = {
  children: ReactNode;
  className?: string;
};

export function CookiePreferencesButton({ children, className }: CookiePreferencesButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("castapos:open-cookie-preferences"))}
    >
      {children}
    </button>
  );
}
