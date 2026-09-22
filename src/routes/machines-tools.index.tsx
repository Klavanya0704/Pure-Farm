import { createFileRoute } from "@tanstack/react-router";
import { MachinesToolsPage } from "@/components/pages";

export const Route = createFileRoute("/machines-tools/")({
  head: () => ({
    meta: [
      { title: "Machines & Tools Rental | PureFarm" },
      {
        name: "description",
        content: "Rent agricultural machinery and tools from farmers near you.",
      },
    ],
  }),
  component: MachinesToolsPage,
});
