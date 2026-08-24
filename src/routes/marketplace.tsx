import { createFileRoute } from "@tanstack/react-router";
import { MarketplacePage } from "@/components/pages";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace | PureFarm" },
      {
        name: "description",
        content: "Search, filter, sort, and buy farm inputs from the PureFarm catalogue.",
      },
    ],
  }),
  component: MarketplacePage,
});
