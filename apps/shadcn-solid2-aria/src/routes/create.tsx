import { createFileRoute } from "@tanstack/solid-router";
import type { SearchSchemaInput } from "@tanstack/solid-router";

import { CreatePage } from "../components/tools/create";
import type { DesignConfig } from "../lib/tool-state";
import { designSchema } from "../lib/tool-state";

export const Route = createFileRoute("/create")({
  component: () => <CreatePage initial={Route.useSearch()()} />,
  head: () => ({ meta: [{ title: "New Project — shadcn/solid" }] }),
  validateSearch: (search: SearchSchemaInput & Partial<DesignConfig>) =>
    designSchema.parse(search),
});
