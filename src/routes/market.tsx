import { createFileRoute } from "@tanstack/react-router";
import { MarketPage } from "@/components/pages";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Mandi Prices | PureFarm" },
      { name: "description", content: "Track crop mandi prices, arrivals, and trend indicators." },
    ],
  }),
  component: MarketPage,
});
