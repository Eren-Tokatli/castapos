"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastKind = "success" | "error";
type Toast = { id: number; message: string; kind: ToastKind };

const ToastContext = createContext<{ toast: (message: string, kind?: ToastKind) => void } | null>(null);

let nextId = 1;

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-xl shadow-2xl text-sm font-bold min-w-[240px] max-w-sm animate-[toast-in_.2s_ease-out] ${
              t.kind === "success"
                ? "bg-slate-900 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {t.kind === "success" ? <CheckCircle2 size={17} className="shrink-0 text-emerald-400" /> : <XCircle size={17} className="shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100 transition">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx.toast;
}
