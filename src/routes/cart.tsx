import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/components/pages";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart | PureFarm" },
      {
        name: "description",
        content: "Review PureFarm cart items, quantities, subtotal, and order checkout.",
      },
    ],
  }),
  component: CartPage,
});
