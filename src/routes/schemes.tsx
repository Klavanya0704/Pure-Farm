import { createFileRoute } from "@tanstack/react-router";
import { SchemesPage } from "@/components/pages";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes | PureFarm" },
      {
        name: "description",
        content: "Find farmer scheme eligibility, benefits, deadlines, and official links.",
      },
    ],
  }),
  component: SchemesPage,
});
