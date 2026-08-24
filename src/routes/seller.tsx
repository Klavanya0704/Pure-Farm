import { createFileRoute } from "@tanstack/react-router";
import { SellerPage } from "@/components/pages";

export const Route = createFileRoute("/seller")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard | PureFarm" },
      {
        name: "description",
        content: "PureFarm seller dashboard console for listings and inventory.",
      },
    ],
  }),
  component: SellerPage,
});
