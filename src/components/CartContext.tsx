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
import { PRODUCTS } from "@/data/products";
import type { CartItem } from "@/data/types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (productId: string, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "purefarm-cart";
const WINDOW_NAME_PREFIX = "__purefarm_cart__=";

function writeStoredCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(items);
  if (typeof window.localStorage !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }
  if (typeof window.sessionStorage !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
  }
  const otherWindowNameEntries = window.name
    .split("|")
    .filter((entry) => entry && !entry.startsWith(WINDOW_NAME_PREFIX));
  window.name = [
    ...otherWindowNameEntries,
    `${WINDOW_NAME_PREFIX}${encodeURIComponent(serialized)}`,
  ]
    .join("|")
    .trim();
  document.cookie = `${STORAGE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=2592000; SameSite=Lax`;
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const windowNameValue = window.name
      .split("|")
      .find((entry) => entry.startsWith(WINDOW_NAME_PREFIX))
      ?.slice(WINDOW_NAME_PREFIX.length);
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${STORAGE_KEY}=`))
      ?.split("=")[1];
    const raw = [
      typeof window.localStorage === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY),
      typeof window.sessionStorage === "undefined"
        ? null
        : window.sessionStorage.getItem(STORAGE_KEY),
      windowNameValue ? decodeURIComponent(windowNameValue) : null,
      decodeURIComponent(cookieValue || "[]"),
    ].find((value) => value && value !== "[]");
    const parsed = JSON.parse(raw || "[]") as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.productId && item.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    setItems(readStoredCart());
    setIsReady(true);
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (typeof window !== "undefined" && isReady) {
      writeStoredCart(items);
    }
  }, [isReady, items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);

    const commitItems = (nextItems: CartItem[]) => {
      itemsRef.current = nextItems;
      writeStoredCart(nextItems);
      setItems(nextItems);
    };

    return {
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal,
      addItem: (productId, qty = 1) => {
        const current = itemsRef.current;
        const existing = current.find((item) => item.productId === productId);
        if (existing) {
          commitItems(
            current.map((item) =>
              item.productId === productId ? { ...item, qty: Math.min(item.qty + qty, 99) } : item,
            ),
          );
          return;
        }
        commitItems([...current, { productId, qty: Math.max(1, qty) }]);
      },
      updateQty: (productId, qty) => {
        const current = itemsRef.current;
        if (qty <= 0) {
          commitItems(current.filter((item) => item.productId !== productId));
          return;
        }
        commitItems(
          current.map((item) =>
            item.productId === productId ? { ...item, qty: Math.min(qty, 99) } : item,
          ),
        );
      },
      removeItem: (productId) => {
        commitItems(itemsRef.current.filter((item) => item.productId !== productId));
      },
      clearCart: () => {
        commitItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export function getCartProducts(items: CartItem[]) {
  return items
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      return product ? { product, qty: item.qty } : null;
    })
    .filter((item): item is { product: (typeof PRODUCTS)[number]; qty: number } => Boolean(item));
}
