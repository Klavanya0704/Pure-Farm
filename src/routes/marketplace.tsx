import { createFileRoute } from "@tanstack/react-router";
import { MarketplacePage } from "@/components/pages";
import { z } from "zod";

const marketplaceSearchSchema = z.object({
  category: z.string().optional().catch(undefined),
  cat: z.string().optional().catch(undefined),
  query: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/marketplace")({
  validateSearch: (search: Record<string, unknown>) => {
    return marketplaceSearchSchema.parse(search);
  },
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

