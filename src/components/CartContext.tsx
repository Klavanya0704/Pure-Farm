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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { CartItem } from "@/data/types";

export interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (
    productId: string,
    qty?: number,
    details?: Partial<CartItem>,
  ) => { success: boolean; message?: string };
  updateQty: (
    productId: string,
    qty: number,
    maxStock?: number,
  ) => { success: boolean; message?: string };
  removeItem: (productId: string) => void;
  clearCart: () => void;
  syncCartWithDatabase: () => Promise<{ warnings: string[] }>;
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
      const dbPrice = item.price;
      const staticProduct = PRODUCTS.find((p) => p.id === item.productId);
      const price = dbPrice !== undefined ? dbPrice : staticProduct ? staticProduct.price : 0;
      return sum + price * item.qty;
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
      addItem: (productId, qty = 1, details) => {
        const current = itemsRef.current;
        const existing = current.find((item) => item.productId === productId);
        const avail = details?.availableQuantity ?? existing?.availableQuantity;
        const currentQty = existing ? existing.qty : 0;
        const requestedTotal = currentQty + qty;

        if (avail !== undefined && requestedTotal > avail) {
          return { success: false, message: `Only ${avail} units are currently available.` };
        }

        if (existing) {
          commitItems(
            current.map((item) =>
              item.productId === productId ? { ...item, ...details, qty: requestedTotal } : item,
            ),
          );
        } else {
          commitItems([...current, { productId, qty: Math.max(1, qty), ...details }]);
        }
        return { success: true };
      },
      updateQty: (productId, qty, maxStock) => {
        const current = itemsRef.current;
        if (qty <= 0) {
          commitItems(current.filter((item) => item.productId !== productId));
          return { success: true };
        }
        const existing = current.find((item) => item.productId === productId);
        const avail = maxStock ?? existing?.availableQuantity;
        if (avail !== undefined && qty > avail) {
          return { success: false, message: `Only ${avail} units are currently available.` };
        }
        commitItems(
          current.map((item) => (item.productId === productId ? { ...item, qty } : item)),
        );
        return { success: true };
      },
      removeItem: (productId) => {
        commitItems(itemsRef.current.filter((item) => item.productId !== productId));
      },
      clearCart: () => {
        commitItems([]);
      },
      syncCartWithDatabase: async () => {
        const current = itemsRef.current;
        if (current.length === 0 || !isSupabaseConfigured) {
          return { warnings: [] };
        }

        const productIds = current.map((i) => i.productId);
        const { data: liveProducts, error } = await supabase
          .from("products")
          .select("id, name, price, available_quantity, status, image_url, unit, farmer_id")
          .in("id", productIds);

        if (error || !liveProducts) {
          return { warnings: [] };
        }

        const warnings: string[] = [];
        const updatedItems: CartItem[] = [];

        for (const item of current) {
          const live = liveProducts.find((p) => p.id === item.productId);
          if (
            !live ||
            live.status === "inactive" ||
            live.status === "sold_out" ||
            Number(live.available_quantity) <= 0
          ) {
            warnings.push(`"${live?.name || item.name || "Product"}" is sold out and unavailable.`);
            updatedItems.push({
              ...item,
              availableQuantity: 0,
              isSoldOut: true,
            });
          } else {
            const liveStock = Number(live.available_quantity);
            const livePrice = Number(live.price);
            let newQty = item.qty;

            if (item.qty > liveStock) {
              newQty = liveStock;
              warnings.push(
                `Only ${liveStock} units of "${live.name || item.name}" are currently available.`,
              );
            }

            updatedItems.push({
              ...item,
              name: live.name,
              price: livePrice,
              unit: live.unit,
              farmerId: live.farmer_id ?? item.farmerId,
              imageUrl: live.image_url ?? item.imageUrl,
              availableQuantity: liveStock,
              qty: newQty,
              isSoldOut: false,
            });
          }
        }

        commitItems(updatedItems);
        return { warnings };
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
      const staticProduct = PRODUCTS.find((p) => p.id === item.productId);
      if (staticProduct) {
        return {
          product: {
            ...staticProduct,
            price: item.price !== undefined ? item.price : staticProduct.price,
          },
          qty: item.qty,
          cartItem: item,
        };
      }
      if (item.name) {
        const syntheticProduct = {
          id: item.productId,
          name: item.name,
          brand: "PureFarm Direct",
          category: "seeds" as const,
          unit: item.unit || "unit",
          price: item.price || 0,
          rating: 4.8,
          stock: item.availableQuantity ?? 99,
          description: "Fresh produce directly from verified farmer",
          image:
            item.imageUrl ||
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f3f4f6'><rect width='400' height='300' fill='%23f3f4f6'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='bold' fill='%239ca3af'>Image Unavailable</text></svg>",
        };
        return { product: syntheticProduct, qty: item.qty, cartItem: item };
      }
      return null;
    })
    .filter((entry): entry is { product: any; qty: number; cartItem: CartItem } => Boolean(entry));
}
