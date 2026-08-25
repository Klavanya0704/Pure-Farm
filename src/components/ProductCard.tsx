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

  // Compute deterministic discount, old price, and review count based on product ID/price, or use custom overrides
  const discountStr = product.customDiscount
    ? product.customDiscount
    : `-${(product.id.charCodeAt(product.id.length - 1) % 3) * 5 + 10}%`;
  const oldPrice =
    product.customOldPrice !== undefined
      ? product.customOldPrice
      : Math.round(
          product.price / (1 - ((product.id.charCodeAt(product.id.length - 1) % 3) * 5 + 10) / 100),
        );
  const reviewCount =
    product.customReviewCount !== undefined
      ? product.customReviewCount
      : product.id.charCodeAt(product.id.length - 1) * 3 + 12;
  const badgeText = product.customBadgeText || product.badge;

  return (
    <article className="group flex h-[255px] w-full max-w-[165px] min-w-[145px] flex-col overflow-hidden rounded-[20px] border border-[#2d6a4f]/10 bg-white shadow-soft transition-all duration-250 ease-out hover:-translate-y-[5px] hover:shadow-md hover:border-[#2d6a4f]/25 mx-auto">
      {/* Upper Half: Product Image Area */}
      <div className="relative h-[120px] w-full bg-[#fbfdfb] p-3 flex items-center justify-center border-b border-border/30 overflow-hidden">
        <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-250 ease-out group-hover:scale-[1.06]"
          />
        </Link>
        {/* Soft green rounded pill for discount badge */}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#e8f5e9] text-[#2d6a4f] border border-emerald-100 px-2 py-0.5 text-[9px] font-black shadow-sm group-hover:animate-pulse select-none">
          {discountStr}
        </span>
        {badgeText ? (
          <span
            className={`absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-black text-white shadow-sm select-none ${
              badgeText.toLowerCase().includes("hot") ? "bg-red-500 animate-pulse" : "bg-amber-500"
            }`}
          >
            {badgeText}
          </span>
        ) : null}
      </div>

      {/* Lower Half: Product Details */}
      <div className="flex flex-1 flex-col p-3.5 space-y-0.5 justify-between">
        <div className="space-y-0.5">
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="line-clamp-1 text-xs font-black leading-tight text-[#1b4332] hover:text-[#2d6a4f] transition-colors"
          >
            {product.name}
          </Link>
          <p className="text-[10px] text-muted-foreground">{product.unit || "1 kg"}</p>

          {/* Rating and review count */}
          <div className="flex items-center gap-1 text-[10px] pt-0.5">
            <span className="inline-flex items-center gap-0.5 font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              {product.rating}
            </span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/30">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-[#2d6a4f]">₹{product.price}</span>
              <span className="text-[10px] text-muted-foreground line-through">₹{oldPrice}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => addItem(product.id)}
            disabled={product.stock <= 0}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a4f] text-white transition hover:bg-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-[1.08] active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
