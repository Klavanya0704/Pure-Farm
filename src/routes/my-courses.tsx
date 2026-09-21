import { createFileRoute } from "@tanstack/react-router";
import { MyCoursesPage } from "@/components/pages";

export const Route = createFileRoute("/my-courses")({
  head: () => ({
    meta: [{ title: "My Courses | PureFarm Student" }],
  }),
  component: MyCoursesPage,
});
