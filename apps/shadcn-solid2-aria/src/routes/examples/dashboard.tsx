import { createFileRoute } from "@tanstack/solid-router";

import { ExamplePage } from "../../components/showcase/example-page";

export const Route = createFileRoute("/examples/dashboard")({
  component: () => <ExamplePage name="dashboard" />,
  head: () => ({ meta: [{ title: "Dashboard — shadcn/solid" }] }),
});
