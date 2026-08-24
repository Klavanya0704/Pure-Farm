import { createFileRoute } from "@tanstack/react-router";
import { LearnPage } from "@/components/pages";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning | PureFarm" },
      {
        name: "description",
        content: "Practical farmer courses and field-ready agriculture learning modules.",
      },
    ],
  }),
  component: LearnPage,
});
