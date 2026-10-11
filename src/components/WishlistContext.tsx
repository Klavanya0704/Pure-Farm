/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { getProduct, getCategoryPlaceholder, getProductImage } from "@/data/products";

export interface WishlistProductItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
  category?: string;
  stock?: number;
  brand?: string;
  description?: string;
}

export interface WishlistContextValue {
  items: WishlistProductItem[];
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: WishlistProductItem | string) => void;
  addToWishlist: (product: WishlistProductItem | string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isReady: boolean;
  refreshWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function getStorageKey(userId?: string | null): string {
  return userId ? `purefarm_wishlist_${userId}` : "purefarm_wishlist_guest";
}

function normalizeWishlistItem(input: any): WishlistProductItem | null {
  if (!input) return null;
  const id =
    typeof input === "string"
      ? input.trim()
      : typeof input.id === "string"
        ? input.id.trim()
        : "";
  if (!id) return null;

  const staticProduct = getProduct(id);
  if (staticProduct) {
    return {
      id: staticProduct.id,
      name: staticProduct.name,
      price: Number(staticProduct.price) || 0,
      unit: staticProduct.unit || "kg",
      image: staticProduct.image || getProductImage(staticProduct.name, staticProduct.category, null),
      category: staticProduct.category || "vegetables",
      stock: staticProduct.stock !== undefined ? Number(staticProduct.stock) : 99,
      brand: staticProduct.brand || "PureFarm Direct",
      description: staticProduct.description || "Verified agricultural input.",
    };
  }

  if (typeof input === "object") {
    return {
      id,
      name:
        typeof input.name === "string" && input.name.trim()
          ? input.name.trim()
          : "Agricultural Produce",
      price: Number(input.price) || 0,
      unit: typeof input.unit === "string" && input.unit.trim() ? input.unit.trim() : "kg",
      image: input.image || getCategoryPlaceholder(input.category, input.name),
      category: typeof input.category === "string" ? input.category : "vegetables",
      stock: input.stock !== undefined ? Number(input.stock) : 99,
      brand: typeof input.brand === "string" ? input.brand : "PureFarm Direct",
      description:
        typeof input.description === "string"
          ? input.description
          : "Saved produce item from PureFarm marketplace.",
    };
  }

  return {
    id,
    name: "Produce Item",
    price: 0,
    unit: "unit",
    image: getCategoryPlaceholder("Produce", id),
    category: "produce",
    stock: 99,
    brand: "PureFarm Direct",
    description: "Saved produce item from PureFarm.",
  };
}

function readStoredWishlist(key: string): WishlistProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const result: WishlistProductItem[] = [];
    for (const entry of parsed) {
      const clean = normalizeWishlistItem(entry);
      if (clean && !result.some((existing) => existing.id === clean.id)) {
        result.push(clean);
      }
    }
    return result;
  } catch (err) {
    console.error("Failed to read wishlist from localStorage:", err);
    return [];
  }
}

function writeStoredWishlist(key: string, items: WishlistProductItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const sanitized = items
      .map(normalizeWishlistItem)
      .filter((i): i is WishlistProductItem => Boolean(i && i.id));
    window.localStorage.setItem(key, JSON.stringify(sanitized));
  } catch (err) {
    console.error("Failed to save wishlist:", err);
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const currentUserId = user?.id || null;
  const storageKey = useMemo(() => getStorageKey(currentUserId), [currentUserId]);
  const [items, setItems] = useState<WishlistProductItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const activeKeyRef = useRef(storageKey);

  const refreshWishlist = () => {
    const loaded = readStoredWishlist(storageKey);
    setItems(loaded);
  };

  // Load and safely merge on active user change
  useEffect(() => {
    activeKeyRef.current = storageKey;
    setIsReady(false);

    let loaded = readStoredWishlist(storageKey);

    // If user is logged in, check if guest wishlist had items that should be merged
    if (currentUserId) {
      const guestItems = readStoredWishlist("purefarm_wishlist_guest");
      if (guestItems.length > 0) {
        const merged = [...loaded];
        for (const gi of guestItems) {
          if (!merged.some((i) => i.id === gi.id)) {
            merged.push(gi);
          }
        }
        loaded = merged;
        writeStoredWishlist(storageKey, loaded);
        try {
          window.localStorage.removeItem("purefarm_wishlist_guest");
        } catch {}
      }
    }

    setItems(loaded);
    setIsReady(true);
  }, [storageKey, currentUserId]);

  // Persist changes whenever items change, but only once loaded and key is matching
  useEffect(() => {
    if (isReady && typeof window !== "undefined" && activeKeyRef.current === storageKey) {
      writeStoredWishlist(storageKey, items);
    }
  }, [isReady, storageKey, items]);

  const value = useMemo<WishlistContextValue>(() => {
    const wishlistIds = items.map((i) => i.id);

    const isInWishlist = (productId: string) => {
      if (!productId) return false;
      return wishlistIds.includes(productId.trim());
    };

    const toggleWishlist = (productOrId: WishlistProductItem | string) => {
      const targetId =
        typeof productOrId === "string" ? productOrId.trim() : productOrId?.id?.trim();
      if (!targetId) return;

      setItems((prev) => {
        const exists = prev.some((i) => i.id === targetId);
        if (exists) {
          return prev.filter((i) => i.id !== targetId);
        }
        const clean = normalizeWishlistItem(productOrId);
        return clean ? [...prev, clean] : prev;
      });
    };

    const addToWishlist = (productOrId: WishlistProductItem | string) => {
      const targetId =
        typeof productOrId === "string" ? productOrId.trim() : productOrId?.id?.trim();
      if (!targetId) return;

      setItems((prev) => {
        if (prev.some((i) => i.id === targetId)) return prev;
        const clean = normalizeWishlistItem(productOrId);
        return clean ? [...prev, clean] : prev;
      });
    };

    const removeFromWishlist = (productId: string) => {
      if (!productId) return;
      const cleanId = productId.trim();
      setItems((prev) => prev.filter((i) => i.id !== cleanId));
    };

    const clearWishlist = () => {
      setItems([]);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {}
      }
    };

    return {
      items,
      wishlistIds,
      wishlistCount: items.length,
      isInWishlist,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isReady,
      refreshWishlist,
    };
  }, [items, isReady, storageKey]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
