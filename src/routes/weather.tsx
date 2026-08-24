import { createFileRoute } from "@tanstack/react-router";
import { WeatherPage } from "@/components/pages";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather Advisory | PureFarm" },
      {
        name: "description",
        content: "Agricultural weather forecast and field advisory for farmers.",
      },
    ],
  }),
  component: WeatherPage,
});
