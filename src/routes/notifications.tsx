import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/pages";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | PureFarm" },
      {
        name: "description",
        content:
          "Read and manage PureFarm market, weather, scheme, order, and advisory notifications.",
      },
    ],
  }),
  component: NotificationsPage,
});
