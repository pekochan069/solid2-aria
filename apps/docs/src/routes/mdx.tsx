import type { JSX } from "@solidjs/web";
import { createFileRoute, notFound } from "@tanstack/solid-router";
import { allSolid2AriaComponentsDocs } from "content-collections";

import { Markdown } from "../components/markdown";

export const Route = createFileRoute("/mdx")({
  component: MDXPage,
});

function Heading(props: JSX.IntrinsicElements["h1"]) {
  return <h1 {...props} class={["text-3xl font-bold", props.class]} />;
}

function MDXPage() {
  const document = allSolid2AriaComponentsDocs.find(
    (entry) => entry._meta.path === "mdx"
  );

  if (!document) {
    // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router expects its structured not-found signal.
    throw notFound();
  }

  return (
    <main class="mx-auto max-w-3xl space-y-4 p-6">
      <Markdown components={{ h1: Heading }} document={document} />
    </main>
  );
}
