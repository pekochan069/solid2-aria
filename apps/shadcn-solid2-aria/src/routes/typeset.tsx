import { createFileRoute } from "@tanstack/solid-router";
import type { SearchSchemaInput } from "@tanstack/solid-router";

import { TypesetPage } from "../components/tools/typeset";
import type { TypesetConfig } from "../lib/tool-state";
import { typesetSchema } from "../lib/tool-state";

export const Route = createFileRoute("/typeset")({
  component: () => <TypesetPage initial={Route.useSearch()()} />,
  head: () => ({ meta: [{ title: "Typeset — shadcn/solid" }] }),
  validateSearch: (search: SearchSchemaInput & Partial<TypesetConfig>) =>
    typesetSchema.parse(search),
});
