/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

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
  toggleWishlist: (product: WishlistProductItem) => void;
  addToWishlist: (product: WishlistProductItem) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function getStorageKey(userId?: string | null): string {
  return userId ? `purefarm_wishlist_${userId}` : "purefarm_wishlist_guest";
}

function readStoredWishlist(key: string): WishlistProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && item.id.length > 0);
  } catch {
    return [];
  }
}

function writeStoredWishlist(key: string, items: WishlistProductItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(idsToCleanItems(items)));
  } catch (err) {
    console.error("Failed to save wishlist", err);
  }
}

function idsToCleanItems(items: WishlistProductItem[]): WishlistProductItem[] {
  return items.map((i) => ({
    id: i.id,
    name: i.name || "Produce Item",
    price: Number(i.price) || 0,
    unit: i.unit || "kg",
    image: i.image,
    category: i.category || "vegetables",
    stock: i.stock !== undefined ? Number(i.stock) : 99,
    brand: i.brand || "PureFarm Direct",
    description: i.description,
  }));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => getStorageKey(user?.id), [user?.id]);
  const [items, setItems] = useState<WishlistProductItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Load wishlist whenever active user changes
  useEffect(() => {
    setItems(readStoredWishlist(storageKey));
    setIsReady(true);
  }, [storageKey]);

  // Save wishlist on changes once loaded
  useEffect(() => {
    if (isReady && typeof window !== "undefined") {
      writeStoredWishlist(storageKey, items);
    }
  }, [isReady, storageKey, items]);

  const value = useMemo<WishlistContextValue>(() => {
    const wishlistIds = items.map((i) => i.id);

    const isInWishlist = (productId: string) => wishlistIds.includes(productId);

    const toggleWishlist = (product: WishlistProductItem) => {
      setItems((prev) =>
        prev.some((i) => i.id === product.id)
          ? prev.filter((i) => i.id !== product.id)
          : [...prev, product],
      );
    };

    const addToWishlist = (product: WishlistProductItem) => {
      setItems((prev) => (prev.some((i) => i.id === product.id) ? prev : [...prev, product]));
    };

    const removeFromWishlist = (productId: string) => {
      setItems((prev) => prev.filter((i) => i.id !== productId));
    };

    const clearWishlist = () => setItems([]);

    return {
      items,
      wishlistIds,
      wishlistCount: items.length,
      isInWishlist,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
    };
  }, [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
