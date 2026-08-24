import { createFileRoute } from "@tanstack/react-router";
import { InsurancePage } from "@/components/pages";

export const Route = createFileRoute("/crop-insurance")({
  head: () => ({
    meta: [
      { title: "Crop Insurance | PureFarm" },
      {
        name: "description",
        content: "Compare crop insurance, weather index protection, and allied farming cover.",
      },
    ],
  }),
  component: InsurancePage,
});
