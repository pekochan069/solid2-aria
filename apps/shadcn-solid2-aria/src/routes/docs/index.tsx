import { createFileRoute } from "@tanstack/solid-router";
import { Loading } from "solid-js";

import { Article } from "../../components/docs/article";
import { guides } from "../../lib/docs";
import { Document, loadDocument } from "../../lib/documents";

export const Route = createFileRoute("/docs/")({
  component: Introduction,
  head: () => ({ meta: [{ title: "Introduction — shadcn/solid" }] }),
  loader: async () => {
    const document = await loadDocument("introduction");

    if (!document) {
      throw new Error("Introduction document is missing");
    }

    return document;
  },
});

function Introduction() {
  const data = Route.useLoaderData();

  return (
    <Article
      title="Introduction"
      description="Beautifully designed components that you can customize, extend, and build on. Start here then make it your own."
      sections={data().sections}
      rawText={data().raw}
      next={guides[1]}
    >
      <Loading fallback={<p>Loading documentation...</p>}>
        <Document slug="introduction" />
      </Loading>
    </Article>
  );
}
