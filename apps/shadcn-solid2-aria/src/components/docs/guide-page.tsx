import { notFound } from "@tanstack/solid-router";
import { Loading } from "solid-js";

import { allGuides, guides, frameworkGuideGroups } from "../../lib/docs";
import { Document, loadDocument } from "../../lib/documents";
import { Article } from "./article";

export async function loadGuide(slug: string) {
  const page = allGuides.find(
    (guide) => guide.slug === slug && guide.slug !== "introduction"
  );

  const document = page && (await loadDocument(page.slug));

  if (!page || !document) {
    // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router handles its not-found sentinel.
    throw notFound();
  }

  const siblings =
    frameworkGuideGroups.find((group) => group.pages.includes(page))?.pages ??
    guides;

  const index = siblings.indexOf(page);

  return {
    page,
    ...document,
    next: siblings[index + 1],
    previous: siblings[index - 1],
  };
}

export function GuidePage(props: {
  data: Awaited<ReturnType<typeof loadGuide>>;
}) {
  return (
    <Article
      title={props.data.page.title}
      description={props.data.page.description}
      sections={props.data.sections}
      rawText={props.data.raw}
      previous={props.data.previous}
      next={props.data.next}
    >
      <Loading fallback={<p>Loading documentation...</p>}>
        <Document slug={props.data.page.slug} />
      </Loading>
    </Article>
  );
}
