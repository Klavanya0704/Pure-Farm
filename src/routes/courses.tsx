import { createFileRoute } from "@tanstack/react-router";
import { CoursesPage } from "@/components/pages";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses | PureFarm Student" },
      {
        name: "description",
        content: "Explore tech and agricultural courses for student learners.",
      },
    ],
  }),
  component: CoursesPage,
});
