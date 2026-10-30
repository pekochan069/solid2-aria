import { createFileRoute } from "@tanstack/solid-router";

import { SeraPage } from "../components/showcase/sera";

export const Route = createFileRoute("/sera")({
  component: SeraPage,
  head: () => ({ meta: [{ title: "Introducing Sera — shadcn/solid" }] }),
});
