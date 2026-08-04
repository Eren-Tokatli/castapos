"use client";

import { useEffect } from "react";

type CanliDestekBodyClassProps = {
  className: string;
};

export function CanliDestekBodyClass({ className }: CanliDestekBodyClassProps) {
  useEffect(() => {
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [className]);

  return null;
}
