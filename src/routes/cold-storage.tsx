import { createFileRoute } from "@tanstack/react-router";
import { ColdStoragePage } from "@/components/pages";

export const Route = createFileRoute("/cold-storage")({
  head: () => ({
    meta: [
      { title: "Cold Storage Finder | PureFarm" },
      {
        name: "description",
        content: "Find nearby cold storage facilities for your produce.",
      },
    ],
  }),
  component: ColdStoragePage,
});
