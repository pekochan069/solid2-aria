import { createFileRoute, notFound } from "@tanstack/solid-router";

import { TypesetFixture } from "../../../components/tools/typeset";
import { typesetSchema } from "../../../lib/tool-state";

export const Route = createFileRoute("/preview/typeset/$name")({
  component: () => (
    <main id="main-content" class="tool-page page-width">
      <TypesetFixture name={Route.useLoaderData()().name} />
    </main>
  ),
  loader: ({ params }) => {
    const name = typesetSchema.shape.item.safeParse(params.name);

    if (
      !typesetSchema.shape.item
        .unwrap()
        .options.some((option) => option === params.name) ||
      !name.success
    ) {
      throw notFound();
    }

    return { name: name.data };
  },
});
