import { createFileRoute } from "@tanstack/solid-router";
import type { SearchSchemaInput } from "@tanstack/solid-router";

import { TypesetPage } from "../components/tools/typeset";
import type { TypesetConfig } from "../lib/tool-state";
import { typesetSchema } from "../lib/tool-state";

type TypesetSearchInput = {
  [Key in keyof TypesetConfig]?: Key extends "scale" | "leading" | "measure"
    ? TypesetConfig[Key] | number
    : TypesetConfig[Key];
};

export const Route = createFileRoute("/typeset")({
  component: () => <TypesetPage initial={Route.useSearch()()} />,
  head: () => ({ meta: [{ title: "Typeset — shadcn/solid" }] }),
  validateSearch: (search: SearchSchemaInput & TypesetSearchInput) =>
    typesetSchema.parse(
      Object.fromEntries(
        Object.entries(search).map(([key, value]) => [key, String(value)])
      )
    ),
});
