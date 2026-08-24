import { createFileRoute } from "@tanstack/react-router";
import { OrderPage } from "@/components/pages";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Order | PureFarm" },
      {
        name: "description",
        content: "Place a safe mock PureFarm order with delivery and payment selection.",
      },
    ],
  }),
  component: OrderPage,
});
