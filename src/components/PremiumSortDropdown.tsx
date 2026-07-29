"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

interface PremiumSortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

export function PremiumSortDropdown({ options, value, onChange }: PremiumSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label || options[0]?.label || "";

  return (
    <div
      className="premium-sort"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="premium-sort-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>

      {open && (
        <div className="premium-sort-menu" role="listbox" tabIndex={-1}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={value === option.value ? "active" : ""}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
