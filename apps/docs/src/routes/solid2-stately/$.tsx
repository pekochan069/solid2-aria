import { createFileRoute, notFound } from "@tanstack/solid-router";
import { allSolid2StatelyDocs } from "content-collections";
import { createMemo } from "solid-js";

import { Markdown } from "#components/markdown";

export const Route = createFileRoute("/solid2-stately/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const document = createMemo(() => {
    const entry = allSolid2StatelyDocs.find(
      (doc) => doc._meta.path === params()._splat
    );

    if (!entry) {
      throw notFound();
    }

    return entry;
  });

  return <Markdown document={document()} />;
}
