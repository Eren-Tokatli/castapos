"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalCount === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
      <span className="text-xs font-semibold text-slate-500">
        {totalCount} kayıttan {from}–{to} arası gösteriliyor
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold text-slate-600 px-2 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
