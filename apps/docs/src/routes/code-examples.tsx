import { createFileRoute, notFound } from "@tanstack/solid-router";
import { allSolid2AriaComponentsDocs } from "content-collections";

import { Markdown } from "../components/markdown";

export const Route = createFileRoute("/code-examples")({
  component: CodeExamplesPage,
});

function CodeExamplesPage() {
  const document = allSolid2AriaComponentsDocs.find(
    (entry) => entry._meta.path === "mdx"
  );

  if (!document) {
    // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router expects its structured not-found signal.
    throw notFound();
  }

  return (
    <main class="mx-auto max-w-3xl space-y-4 p-6">
      <Markdown document={document} />
    </main>
  );
}
