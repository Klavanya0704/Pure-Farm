import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/pages";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | PureFarm" },
      { name: "description", content: "Learn about the PureFarm digital agriculture platform." },
    ],
  }),
  component: AboutPage,
});
