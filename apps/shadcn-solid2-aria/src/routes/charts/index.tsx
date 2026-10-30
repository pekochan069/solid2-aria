import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/charts/")({
  beforeLoad: () => {
    throw redirect({ params: { type: "area" }, to: "/charts/$type" });
  },
});
