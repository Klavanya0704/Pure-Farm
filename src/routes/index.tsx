import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PureFarm | Farm Inputs, Mandi Prices and Crop Support" },
      {
        name: "description",
        content:
          "PureFarm helps farmers shop inputs, track mandi prices, follow crop weather, discover schemes, and connect with local support.",
      },
    ],
  }),
  component: HomePage,
});
