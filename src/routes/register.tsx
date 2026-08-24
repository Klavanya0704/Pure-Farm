import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/components/pages";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register | PureFarm" },
      { name: "description", content: "Register for the PureFarm farmer platform demo." },
    ],
  }),
  component: RegisterPage,
});
