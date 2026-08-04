"use client";

import { useEffect } from "react";

type InfoPageBodyClassProps = {
  className: string;
};

export function InfoPageBodyClass({ className }: InfoPageBodyClassProps) {
  useEffect(() => {
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className]);

  return null;
}
