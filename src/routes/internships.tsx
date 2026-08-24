import { createFileRoute } from "@tanstack/react-router";
import { InternshipsPage } from "@/components/pages";

export const Route = createFileRoute("/internships")({
  head: () => ({
    meta: [
      { title: "Internships | PureFarm" },
      {
        name: "description",
        content:
          "Agriculture internship opportunities in field, operations, lab, and content teams.",
      },
    ],
  }),
  component: InternshipsPage,
});
