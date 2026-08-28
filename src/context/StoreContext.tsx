"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CatalogProduct, defaultPeriod, monthlyPrice } from "@/lib/catalog-shared";
import { validateCoupon, type AppliedCoupon } from "@/app/(storefront)/sepet/actions";

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

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (open: boolean) => void;

  coupon: AppliedCoupon | null;
  applyCoupon: (code: string, cartTotal: number) => Promise<boolean>;
  removeCoupon: () => void;

  // Kök layout'ta sunucu tarafında bir kere çekilip buraya prop olarak
  // geçirilen aktif ürün kataloğu — header arama/sepet/favori çekmecesi,
  // sepet ve favorilerim sayfaları hep buradan okur (ayrı ayrı fetch yok).
  products: CatalogProduct[];
  getProductById: (id: string) => CatalogProduct | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({
  children,
  initialProducts,
}: {
  children: React.ReactNode;
  initialProducts: CatalogProduct[];
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [products] = useState<CatalogProduct[]>(initialProducts);

  const getProductById = (id: string) => products.find((p) => p.id === id);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("castaposCart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedFavorites = localStorage.getItem("castaposFavorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      } else if (products.length > 0) {
        // Set default favorites like static site — ilk iki gerçek ürün
        const defaults = products.slice(0, 2).map((p) => ({
          id: p.id,
          period: defaultPeriod(p) || 3,
        }));
        setFavorites(defaults);
        localStorage.setItem("castaposFavorites", JSON.stringify(defaults));
      }

      const savedCoupon = localStorage.getItem("castaposCoupon");
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error("Error loading localStorage data", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Masaüstünde sepet çekmecesi açılıyor zaten görsel geri bildirim veriyor;
    // mobilde artık ayrıca toast gösterilmiyor (kullanıcı isteği).
    if (!window.matchMedia("(max-width:760px)").matches) {
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
    const p = getProductById(id);
    const selectedPeriod = period || p?.periods[0] || 3;

    setFavorites((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      let updated;

      if (index < 0) {
        updated = [...prev, { id, period: selectedPeriod }];
        // "Favorilere eklendi" toast'ı kaldırıldı (kullanıcı isteği) — kalp
        // ikonunun dolu göstermesi zaten yeterli görsel geri bildirim.
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

  const applyCoupon = async (code: string, cartTotal: number) => {
    const result = await validateCoupon(code, cartTotal);
    if (!result.success) {
      setCoupon(null);
      localStorage.removeItem("castaposCoupon");
      showToast(result.error);
      return false;
    }
    setCoupon(result.coupon);
    localStorage.setItem("castaposCoupon", JSON.stringify(result.coupon));
    const label =
      result.coupon.discountType === "PERCENTAGE" ? `%${result.coupon.amount}` : `₺${result.coupon.amount}`;
    showToast(`Kupon uygulandı: ${label} indirim tanımlandı.`);
    return true;
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
    const p = getProductById(item.id);
    if (!p) return sum;
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
        isCartOpen,
        setIsCartOpen,
        isFavoritesOpen,
        setIsFavoritesOpen,
        coupon,
        applyCoupon,
        removeCoupon,
        products,
        getProductById,
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
