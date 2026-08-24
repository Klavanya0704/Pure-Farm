import { createFileRoute } from "@tanstack/react-router";
import { SupportPage } from "@/components/pages";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support | PureFarm" },
      {
        name: "description",
        content: "Get PureFarm support and answers to common farmer questions.",
      },
    ],
  }),
  component: SupportPage,
});
