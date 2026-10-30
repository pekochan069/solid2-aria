import { createFileRoute } from "@tanstack/solid-router";

import { ColorsPage } from "../components/tools/colors";

export const Route = createFileRoute("/colors")({
  component: ColorsPage,
  head: () => ({
    meta: [{ title: "Tailwind Colors in Every Format — shadcn/solid" }],
  }),
});
