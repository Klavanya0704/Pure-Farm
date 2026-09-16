import { createFileRoute } from "@tanstack/react-router";
import { WeatherBasedDetailPage } from "@/components/pages";

export const Route = createFileRoute("/crop-insurance/weather-based")({
  head: () => ({
    meta: [
      { title: "Weather Based Crop Insurance | PureFarm" },
      {
        name: "description",
        content:
          "Index-based weather parametric crop insurance details, triggers, rainfall and temperature coverage.",
      },
    ],
  }),
  component: WeatherBasedDetailPage,
});
