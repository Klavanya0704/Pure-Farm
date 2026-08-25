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
  const oldPrice = product.customOldPrice !== undefined 
    ? product.customOldPrice 
    : Math.round(product.price / (1 - ((product.id.charCodeAt(product.id.length - 1) % 3) * 5 + 10) / 100));
  const reviewCount = product.customReviewCount !== undefined 
    ? product.customReviewCount 
    : product.id.charCodeAt(product.id.length - 1) * 3 + 12; // e.g. 120, etc.
  const badgeText = product.customBadgeText || product.badge;

  return (
    <article className="group flex h-[270px] w-full max-w-[170px] min-w-[150px] flex-col overflow-hidden rounded-[20px] border border-emerald-100/40 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 mx-auto">
      {/* Product Image + Discount Badge */}
      <div className="relative h-[135px] w-full bg-[#fbfdfb] p-3 flex items-center justify-center border-b border-border/40 overflow-hidden">
        <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-200 ease-out group-hover:scale-[1.04]"
          />
        </Link>
        <span className="absolute left-2.5 top-2.5 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] border border-emerald-100/50 px-1.5 py-0.5 text-[9px] font-black shadow-sm select-none">
          {discountStr}
        </span>
        {badgeText ? (
          <span className={`absolute right-2.5 top-2.5 rounded-lg px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm select-none ${
            badgeText.toLowerCase().includes("hot") ? "bg-red-500 animate-pulse" : "bg-amber-500"
          }`}>
            {badgeText}
          </span>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-3 space-y-0.5 justify-between">
        <div className="space-y-0.5">
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="line-clamp-2 text-xs font-black leading-tight text-[#1b4332] hover:text-[#2d6a4f] transition-colors"
          >
            {product.name}
          </Link>
          <p className="text-[10px] text-muted-foreground">Unit: {product.unit || "1 kg"}</p>

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
              <span className="text-sm font-black text-[#2d6a4f]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-muted-foreground line-through">
                ₹{oldPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[8px] text-muted-foreground">Incl. of taxes</p>
          </div>
          <button
            type="button"
            onClick={() => addItem(product.id)}
            disabled={product.stock <= 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2d6a4f] text-white transition hover:bg-[#1b4332] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
