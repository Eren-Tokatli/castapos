"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS, getProduct, defaultPeriod, monthlyPrice } from "@/lib/products-data";

export interface CartItem {
  id: string;
  period: number;
  qty: number;
}

export interface FavoriteItem {
  id: string;
  period: number;
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (id: string, period: number) => void;
  removeFromCart: (index: number) => void;
  updateCartItemQty: (index: number, delta: number) => void;
  cartCount: number;
  monthlyTotal: number;
  
  favorites: FavoriteItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string, period?: number) => void;

  compareList: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (open: boolean) => void;

  coupon: { code: string } | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("castaposCart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedFavorites = localStorage.getItem("castaposFavorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      } else {
        // Set default favorites like static site
        const defaults = [
          { id: "walkingpad-r2-pro", period: 3 },
          { id: "wero-ai-bike", period: 3 }
        ];
        setFavorites(defaults);
        localStorage.setItem("castaposFavorites", JSON.stringify(defaults));
      }

      const savedCompare = localStorage.getItem("castaposCompareProducts");
      if (savedCompare) setCompareList(JSON.parse(savedCompare));

      const savedCoupon = localStorage.getItem("castaposCoupon");
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error("Error loading localStorage data", e);
    }
  }, []);

  const addToCart = (id: string, period: number) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (x) => x.id === id && x.period === period
      );

      let updated;
      if (existingIndex > -1) {
        updated = prev.map((item, idx) =>
          idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        updated = [...prev, { id, period, qty: 1 }];
      }
      localStorage.setItem("castaposCart", JSON.stringify(updated));
      return updated;
    });

    // Match static behavior: mobile just shows toast, desktop opens drawer
    if (window.matchMedia("(max-width:760px)").matches) {
      showToast("Ürün sepetine eklendi.");
    } else {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      localStorage.setItem("castaposCart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartItemQty = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, qty: Math.max(1, item.qty + delta) };
        }
        return item;
      });
      localStorage.setItem("castaposCart", JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some((x) => x.id === id);
  };

  const toggleFavorite = (id: string, period?: number) => {
    const p = getProduct(id);
    const selectedPeriod = period || p.periods[0] || 3;

    setFavorites((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      let updated;

      if (index < 0) {
        updated = [...prev, { id, period: selectedPeriod }];
        showToast(`Ürün ${selectedPeriod} aylık planla favorilerine eklendi.`);
      } else if (prev[index].period !== selectedPeriod) {
        updated = prev.map((item, idx) =>
          idx === index ? { id, period: selectedPeriod } : item
        );
        showToast(`Favori planı ${selectedPeriod} ay olarak güncellendi.`);
      } else {
        updated = prev.filter((x) => x.id !== id);
        showToast("Ürün favorilerinden çıkarıldı.");
      }

      localStorage.setItem("castaposFavorites", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      const exists = prev.includes(id);
      let updated;
      if (exists) {
        updated = prev.filter((x) => x !== id);
      } else {
        if (prev.length >= 3) {
          showToast("En fazla 3 ürün karşılaştırabilirsin.");
          return prev;
        }
        updated = [...prev, id];
      }
      localStorage.setItem("castaposCompareProducts", JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem("castaposCompareProducts");
  };

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toLowerCase();
    if (normalized === "merhaba10") {
      const val = { code: "merhaba10" };
      setCoupon(val);
      localStorage.setItem("castaposCoupon", JSON.stringify(val));
      showToast("Kupon uygulandı: %10 indirim tanımlandı.");
      return true;
    }
    setCoupon(null);
    localStorage.removeItem("castaposCoupon");
    showToast("Kupon kodu geçerli değil.");
    return false;
  };

  const removeCoupon = () => {
    setCoupon(null);
    localStorage.removeItem("castaposCoupon");
    showToast("Kupon sepetten kaldırıldı.");
  };

  const showToast = (message: string) => {
    let t = document.querySelector(".site-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "site-toast";
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add("show");
    setTimeout(() => t?.classList.remove("show"), 2100);
  };

  const cartCount = cart.reduce((n, x) => n + x.qty, 0);

  const monthlyTotal = cart.reduce((sum, item) => {
    const p = getProduct(item.id);
    return sum + monthlyPrice(p, item.period) * item.qty;
  }, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        cartCount,
        monthlyTotal,
        favorites,
        isFavorite,
        toggleFavorite,
        compareList,
        toggleCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
        isCartOpen,
        setIsCartOpen,
        isFavoritesOpen,
        setIsFavoritesOpen,
        coupon,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
