"use client";

import type { ReactNode } from "react";

interface LiveChatActionButtonProps {
  icon: ReactNode;
  title: string;
  text: string;
  value: string;
  featured?: boolean;
}

// "Canlı Destek" aksiyon kartı — diğerleri gibi bir sayfaya gitmek yerine
// sağ alttaki LiveSupportWidget'ı doğrudan sohbet görünümünde açar.
// İkon, Server Component tarafında render edilip JSX olarak geçiriliyor —
// bir Lucide bileşen referansı prop olarak client'a taşınamaz.
export function LiveChatActionButton({ icon, title, text, value, featured }: LiveChatActionButtonProps) {
  return (
    <button
      type="button"
      className={`live-support-action ${featured ? "featured" : ""}`}
      onClick={() => window.dispatchEvent(new Event("castapos-open-live-chat"))}
    >
      <span className="live-support-action-icon">{icon}</span>
      <span>
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <strong>{value}</strong>
    </button>
  );
}
