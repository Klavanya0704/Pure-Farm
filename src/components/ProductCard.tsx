/* eslint-disable react-refresh/only-export-components */
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
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg">
      <Link to="/product/$id" params={{ id: product.id }} className="block bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase text-primary">{product.brand}</p>
            <Link
              to="/product/$id"
              params={{ id: product.id }}
              className="mt-1 line-clamp-2 text-base font-black leading-snug hover:text-primary"
            >
              {product.name}
            </Link>
          </div>
          {product.badge ? (
            <span className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[11px] font-black text-secondary-foreground">
              {product.badge}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 font-bold">
            <Star className="h-4 w-4 fill-secondary text-secondary" /> {product.rating}
          </span>
          <span className="text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="flex items-center text-xl font-black">
            <IndianRupee className="h-4 w-4" />
            {product.price.toLocaleString("en-IN")}
            <span className="ml-1 text-xs font-semibold text-muted-foreground">
              /{product.unit}
            </span>
          </p>
          <button
            type="button"
            onClick={() => addItem(product.id)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary-deep"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
