import { createFileRoute } from "@tanstack/react-router";
import { MachinesToolsListPage } from "@/components/pages";

export const Route = createFileRoute("/machines-tools/list")({
  head: () => ({
    meta: [
      { title: "List Machine / Tool for Rent | PureFarm" },
      {
        name: "description",
        content: "Rent out your agricultural machinery and tools to farmers who need them.",
      },
    ],
  }),
  component: MachinesToolsListPage,
});
