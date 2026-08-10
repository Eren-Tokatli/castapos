"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export function SortableTh({
  label,
  active,
  dir,
  onClick,
  className = "",
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th className={`py-3.5 px-5 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 border-0 bg-transparent p-0 m-0 cursor-pointer appearance-none font-bold text-[11px] uppercase tracking-wider transition rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${
          active ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
        } ${align === "right" ? "ml-auto" : align === "center" ? "mx-auto" : ""}`}
      >
        {label}
        <Icon size={12} className={active ? "text-orange-500" : "text-slate-300"} />
      </button>
    </th>
  );
}
