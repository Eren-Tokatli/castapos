"use client";

import { useMemo, useState } from "react";

/**
 * Ürünler / Kullanıcılar / Kategoriler gibi büyüyebilecek tablolar için ortak
 * sıralama + sayfalama mantığı. Sütun başlığına tıklayınca sırala, altta
 * sayfa sayfa göster.
 */
export function useTableControls<T extends Record<string, any>>(
  items: T[],
  pageSize = 10
) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), "tr");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const resetPage = () => setPage(1);

  return {
    pageItems,
    page: safePage,
    setPage,
    totalPages,
    totalCount: sorted.length,
    sortKey,
    sortDir,
    toggleSort,
    resetPage,
  };
}
