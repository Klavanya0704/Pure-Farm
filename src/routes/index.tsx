import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/pages";
import { InaugurationExperience } from "@/components/InaugurationExperience";
import { useState, useEffect } from "react";

export function IndexPageComponent() {
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("inauguration") === "true" || params.get("ceremony") === "true") {
        return false;
      }
      return sessionStorage.getItem("purefarm_inauguration_entered") === "true";
    }
    return false;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("inauguration") === "true" || params.get("ceremony") === "true") {
      setHasEntered(false);
      return;
    }
    const entered = sessionStorage.getItem("purefarm_inauguration_entered") === "true";
    setHasEntered(entered);
  }, []);

  const handleEnter = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("purefarm_inauguration_entered", "true");
    }
    setHasEntered(true);
  };

  if (!hasEntered) {
    return <InaugurationExperience onEnter={handleEnter} />;
  }

  return <HomePage />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PureFarm | Farm Inputs, Mandi Prices and Crop Support" },
      {
        name: "description",
        content:
          "PureFarm helps farmers shop inputs, track mandi prices, follow crop weather, discover schemes, and connect with local support.",
      },
    ],
  }),
  component: IndexPageComponent,
});
