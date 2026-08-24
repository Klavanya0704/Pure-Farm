import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/pages";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | PureFarm" },
      {
        name: "description",
        content: "Mock PureFarm admin dashboard for products, users, orders, and support.",
      },
    ],
  }),
  component: AdminPage,
});
