import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/examples/")({
  beforeLoad: () => {
    throw redirect({ to: "/examples/dashboard" });
  },
});
