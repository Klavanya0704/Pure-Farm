import { createFileRoute } from "@tanstack/react-router";
import { WishlistPage } from "@/components/pages";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist | PureFarm" },
      {
        name: "description",
        content: "View and manage your saved PureFarm produce and farm items.",
      },
    ],
  }),
  component: WishlistPage,
});
