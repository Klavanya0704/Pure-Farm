import { createFileRoute } from "@tanstack/react-router";
import { PmfbyDetailPage } from "@/components/pages";

export const Route = createFileRoute("/crop-insurance/pmfby")({
  head: () => ({
    meta: [
      { title: "PMFBY - Pradhan Mantri Fasal Bima Yojana | PureFarm" },
      {
        name: "description",
        content:
          "Pradhan Mantri Fasal Bima Yojana details, premiums, eligible crops, coverage stages, and claim process.",
      },
    ],
  }),
  component: PmfbyDetailPage,
});
