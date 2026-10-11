import { createFileRoute } from "@tanstack/react-router";
import { CoursesPage } from "@/components/pages";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses | PureFarm Student" },
      {
        name: "description",
        content: "Explore agriculture, farming, and AgriTech courses for student learners.",
      },
    ],
  }),
  component: CoursesPage,
});
