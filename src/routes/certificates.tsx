import { createFileRoute } from "@tanstack/react-router";
import { CertificatesPage } from "@/components/pages";

export const Route = createFileRoute("/certificates")({
  head: () => ({
    meta: [{ title: "Certificates | PureFarm Student" }],
  }),
  component: CertificatesPage,
});
