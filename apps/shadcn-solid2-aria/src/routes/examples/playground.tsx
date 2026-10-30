import { createFileRoute } from "@tanstack/solid-router";

import { ExamplePage } from "../../components/showcase/example-page";

export const Route = createFileRoute("/examples/playground")({
  component: () => <ExamplePage name="playground" />,
  head: () => ({ meta: [{ title: "Playground — shadcn/solid" }] }),
});
