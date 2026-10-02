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

export interface WishlistContextValue {
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function getStorageKey(userId?: string | null): string {
  return userId ? `purefarm_wishlist_${userId}` : "purefarm_wishlist_guest";
}

function readStoredWishlist(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredWishlist(key: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch (err) {
    console.error("Failed to save wishlist", err);
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => getStorageKey(user?.id), [user?.id]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Load wishlist whenever active user changes
  useEffect(() => {
    setWishlistIds(readStoredWishlist(storageKey));
    setIsReady(true);
  }, [storageKey]);

  // Save wishlist on changes once loaded
  useEffect(() => {
    if (isReady && typeof window !== "undefined") {
      writeStoredWishlist(storageKey, wishlistIds);
    }
  }, [isReady, storageKey, wishlistIds]);

  const value = useMemo<WishlistContextValue>(() => {
    const isInWishlist = (productId: string) => wishlistIds.includes(productId);

    const toggleWishlist = (productId: string) => {
      setWishlistIds((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
      );
    };

    const addToWishlist = (productId: string) => {
      setWishlistIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
    };

    const removeFromWishlist = (productId: string) => {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
    };

    const clearWishlist = () => setWishlistIds([]);

    return {
      wishlistIds,
      wishlistCount: wishlistIds.length,
      isInWishlist,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
    };
  }, [wishlistIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
