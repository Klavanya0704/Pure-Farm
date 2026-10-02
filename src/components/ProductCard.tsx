import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useToast } from "./ToastContext";
import { useTranslation } from "@/i18n/LanguageContext";

export function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export const NEUTRAL_PRODUCT_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f3f4f6'><rect width='400' height='300' fill='%23f3f4f6'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='bold' fill='%239ca3af'>Image Unavailable</text><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%239ca3af'>PureFarm Produce</text></svg>";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showCartSuccessToast, showToast } = useToast();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const activeWishlist = isInWishlist(product.id);

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
    <article className="group flex w-full flex-col overflow-hidden transition-all duration-250 ease-out bg-[#FFFFFF] rounded-[20px] border border-[#E5E7EB] shadow-[0_3px_12px_rgba(0,0,0,0.06)] hover:-translate-y-[5px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)] relative">
      {/* Upper Half: Large Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[18px] bg-white">
        <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
          <img
            src={imageError || !product.image ? NEUTRAL_PRODUCT_FALLBACK : product.image}
            alt={product.name}
            onError={() => setImageError(true)}
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
            {t(badgeText)}
          </span>
        ) : null}

        {/* Floating Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist({
              id: product.id,
              name: product.name,
              price: product.price,
              unit: product.unit,
              image: product.image,
              category: product.category,
              stock: product.stock,
              brand: product.brand,
              description: product.description,
            });
          }}
          className={`absolute right-3 top-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all duration-200 z-10 cursor-pointer ${
            activeWishlist
              ? "bg-red-50 text-red-500 scale-105 shadow-md ring-1 ring-red-200"
              : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
          }`}
          aria-label={activeWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4.5 w-4.5 transition-transform ${activeWishlist ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>
      </div>

      {/* Lower Half: Product Details */}
      <div className="flex flex-1 flex-col p-4 bg-[#FFFFFF]">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wide mb-1.5">
          {t(product.category)}
        </span>

        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-[16px] md:text-[18px] font-[700] leading-tight text-[#123D2F] hover:text-[#145A43] transition-colors mb-1.5"
        >
          {t(product.name)}
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
          <span className="text-muted-foreground font-medium">
            {product.rating} ({reviewCount})
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[18px] font-[700] text-[#145A43]">₹{product.price}</span>
          <span className="text-[13px] font-medium text-muted-foreground line-through">
            ₹{oldPrice}
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={() => {
              const res = addItem(product.id, 1, {
                name: product.name,
                price: product.price,
                unit: product.unit,
                imageUrl: product.image,
                farmerId: (product as any).farmer_id,
                availableQuantity: product.stock,
              });
              if (res.success) {
                showCartSuccessToast(product.name, product.image);
              } else {
                showToast({
                  type: "error",
                  title: t("Unable to Add to Cart"),
                  message: res.message || t("Product is currently unavailable."),
                });
              }
            }}
            disabled={product.stock <= 0}
            className="w-full h-[44px] flex items-center justify-center gap-2 rounded-[12px] bg-[#145A43] text-white font-[700] text-sm transition-all hover:bg-[#0D3B2E] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock <= 0 ? t("Out of Stock") : t("Add to Cart")}
          </button>
        </div>
      </div>
    </article>
  );
}
