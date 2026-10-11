import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InaugurationExperience } from "@/components/InaugurationExperience";

export function InaugurationPageRoute() {
  const navigate = useNavigate();

  return (
    <InaugurationExperience
      standalone={true}
      onEnter={() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("purefarm_inauguration_entered", "true");
        }
        navigate({ to: "/" });
      }}
    />
  );
}

export const Route = createFileRoute("/inauguration")({
  head: () => ({
    meta: [
      { title: "Inauguration Ceremony | PureFarm" },
      {
        name: "description",
        content:
          "Official opening video and ribbon-cutting inauguration ceremony for PureFarm.",
      },
    ],
  }),
  component: InaugurationPageRoute,
});
