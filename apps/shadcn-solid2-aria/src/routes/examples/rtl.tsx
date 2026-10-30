import { createFileRoute } from "@tanstack/solid-router";

import { ExamplePage } from "../../components/showcase/example-page";

export const Route = createFileRoute("/examples/rtl")({
  component: () => <ExamplePage name="rtl" />,
  head: () => ({ meta: [{ title: "RTL — shadcn/solid" }] }),
});
