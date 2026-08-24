import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/pages";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | PureFarm" },
      {
        name: "description",
        content: "Contact PureFarm for callback, marketplace, and crop advisory support.",
      },
    ],
  }),
  component: ContactPage,
});
