import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/pages";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | PureFarm" },
      { name: "description", content: "Login to the PureFarm farmer dashboard demo." },
    ],
  }),
  component: LoginPage,
});
