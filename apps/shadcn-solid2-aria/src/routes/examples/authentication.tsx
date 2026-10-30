import { createFileRoute } from "@tanstack/solid-router";

import { ExamplePage } from "../../components/showcase/example-page";

export const Route = createFileRoute("/examples/authentication")({
  component: () => <ExamplePage name="authentication" />,
  head: () => ({ meta: [{ title: "Authentication — shadcn/solid" }] }),
});
