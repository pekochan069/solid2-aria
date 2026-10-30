import { createFileRoute } from "@tanstack/solid-router";

import { BlocksPage } from "../../components/catalog/catalog-pages";

export const Route = createFileRoute("/blocks/")({
  component: BlocksPage,
  head: () => ({ meta: [{ title: "Building Blocks — shadcn/solid" }] }),
});
