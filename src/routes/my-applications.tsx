import { createFileRoute } from "@tanstack/react-router";
import { MyApplicationsPage } from "@/components/pages";

export const Route = createFileRoute("/my-applications")({
  head: () => ({
    meta: [{ title: "My Applications | PureFarm Student" }],
  }),
  component: MyApplicationsPage,
});
