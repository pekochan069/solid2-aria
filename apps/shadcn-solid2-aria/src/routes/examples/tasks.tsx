import { createFileRoute } from "@tanstack/solid-router";

import { ExamplePage } from "../../components/showcase/example-page";

export const Route = createFileRoute("/examples/tasks")({
  component: () => <ExamplePage name="tasks" />,
  head: () => ({ meta: [{ title: "Tasks — shadcn/solid" }] }),
});
