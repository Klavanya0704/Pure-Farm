import { createFileRoute } from "@tanstack/react-router";
import { LivestockDetailPage } from "@/components/pages";

export const Route = createFileRoute("/crop-insurance/livestock")({
  head: () => ({
    meta: [
      { title: "Livestock Insurance Support | PureFarm" },
      {
        name: "description",
        content:
          "Livestock insurance coverage for dairy cattle, buffalo, sheep, and goat protection.",
      },
    ],
  }),
  component: LivestockDetailPage,
});
