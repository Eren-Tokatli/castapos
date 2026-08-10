"use client";

import { AlertTriangle } from "lucide-react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true (default): red/destructive styling. false: orange/neutral styling. */
  danger?: boolean;
  /** Omit to render as a plain alert (single "Tamam" button, no confirm action). */
  onConfirm?: () => void;
  onClose: () => void;
};

/**
 * Admin paneli genelinde native window.confirm()/alert() yerine kullanılan
 * ortada açılan, arka planı blurlanan kart tipi onay/uyarı penceresi.
 * Native dialoglar tarayıcı otomasyonunu (ve bazı test araçlarını) kilitlediği
 * için tamamen React içinde render ediliyor.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Evet, Sil",
  cancelLabel = "Vazgeç",
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"}`}>
            <AlertTriangle size={22} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50/80">
          {onConfirm ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-semibold transition"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition shadow-lg ${
                  danger
                    ? "bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25"
                    : "bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25"
                }`}
              >
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/25 transition"
            >
              Tamam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
