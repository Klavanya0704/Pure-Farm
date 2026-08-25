import { Link } from "@tanstack/react-router";
import { IndianRupee, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart } from "./CartContext";

export function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  // Compute deterministic discount, old price, and review count based on product ID/price
  const discount = (product.id.charCodeAt(product.id.length - 1) % 3) * 5 + 10; // 10%, 15%, or 20%
  const oldPrice = Math.round(product.price / (1 - discount / 100));
  const reviewCount = product.id.charCodeAt(product.id.length - 1) * 3 + 12; // e.g. 120, etc.

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Product Image + Discount Badge */}
      <div className="relative overflow-hidden bg-[#fbfdfb] aspect-square w-full p-4 flex items-center justify-center border-b border-border/40">
        <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <span className="absolute left-3 top-3 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] border border-emerald-100/50 px-2 py-0.5 text-[10px] font-black shadow-sm">
          -{discount}%
        </span>
        {product.badge ? (
          <span className="absolute right-3 top-3 rounded-lg bg-[#2d6a4f] px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
            {product.badge}
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3.5 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {product.brand}
        </p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-sm font-black leading-snug text-[#1b4332] hover:text-[#2d6a4f] transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">Unit: {product.unit || "1 kg"}</p>

        {/* Rating and review count */}
        <div className="flex items-center gap-1.5 text-xs pt-0.5">
          <span className="inline-flex items-center gap-0.5 font-bold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {product.rating}
          </span>
          <span className="text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between gap-3 pt-3 mt-auto border-t border-border/40">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-[#2d6a4f] flex items-center">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                ₹{oldPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground">Incl. of all taxes</p>
          </div>
          <button
            type="button"
            onClick={() => addItem(product.id)}
            disabled={product.stock <= 0}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d6a4f] text-white transition hover:bg-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
