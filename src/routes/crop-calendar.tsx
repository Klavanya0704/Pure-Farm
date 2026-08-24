import { createFileRoute } from "@tanstack/react-router";
import { CropCalendarPage } from "@/components/pages";

export const Route = createFileRoute("/crop-calendar")({
  head: () => ({
    meta: [
      { title: "Crop Calendar | PureFarm" },
      {
        name: "description",
        content: "Plan sowing, crop stages, and harvest activities by season.",
      },
    ],
  }),
  component: CropCalendarPage,
});
