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
    <article 
      className="group flex w-full flex-col overflow-hidden transition-all duration-250 ease-out bg-[#FFFFFF] rounded-[20px] border border-[#E5E7EB] shadow-[0_3px_12px_rgba(0,0,0,0.06)] hover:-translate-y-[5px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
    >
      {/* Upper Half: Large Product Image Area */}
      <div className="relative h-[190px] md:h-[220px] w-full overflow-hidden rounded-t-[18px] bg-white">
        <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </Link>
        
        {/* Discount Badge */}
        <span className="absolute left-3 top-3 rounded-md bg-[#F97316] text-white px-2 py-0.5 text-[11px] font-bold shadow-sm select-none">
          {discountStr}
        </span>

        {/* Other Badge (below discount) */}
        {badgeText ? (
          <span
            className={`absolute left-3 top-9 rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm select-none ${
              badgeText.toLowerCase().includes("hot") ? "bg-red-500 animate-pulse" : "bg-amber-500"
            }`}
          >
            {badgeText}
          </span>
        ) : null}

        {/* Floating Wishlist Heart */}
        <button 
          className="absolute right-3 top-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors z-10"
          aria-label="Add to wishlist"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>
      </div>

      {/* Lower Half: Product Details */}
      <div className="flex flex-1 flex-col p-4 bg-[#FFFFFF]">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wide mb-1.5">
          {product.category}
        </span>
        
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-[16px] md:text-[18px] font-[700] leading-tight text-[#123D2F] hover:text-[#145A43] transition-colors mb-1.5"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-[12px] mb-3">
          <span className="inline-flex items-center gap-0.5 text-[#F59E0B]">
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
          </span>
          <span className="text-muted-foreground font-medium">{product.rating} ({reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[18px] font-[700] text-[#145A43]">₹{product.price}</span>
          <span className="text-[13px] font-medium text-muted-foreground line-through">₹{oldPrice}</span>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={() => addItem(product.id)}
            disabled={product.stock <= 0}
            className="w-full h-[44px] flex items-center justify-center gap-2 rounded-[12px] bg-[#145A43] text-white font-[700] text-sm transition-all hover:bg-[#0D3B2E] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
