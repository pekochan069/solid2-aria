import { createFileRoute, notFound } from "@tanstack/solid-router";
import { Loading } from "solid-js";

import { Article } from "../../../components/docs/article";
import { componentDocuments, findComponent } from "../../../lib/docs";
import { Document, loadDocument } from "../../../lib/documents";

export const Route = createFileRoute("/docs/components/$component")({
  component: ComponentPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.component.title ?? "Component"} — shadcn/solid` },
      {
        content:
          loaderData?.component.description ??
          "Solid 2 component documentation.",
        name: "description",
      },
    ],
  }),
  loader: loadComponent,
});

async function loadComponent({ params }: { params: { component: string } }) {
  const component = findComponent(params.component);

  const document =
    component && (await loadDocument(`components/${component.slug}`));

  if (!component || !document) {
    // oxlint-disable-next-line typescript/only-throw-error
    throw notFound();
  }

  const index = componentDocuments.indexOf(component);

  return {
    component,
    ...document,
    next: componentDocuments[index + 1],
    previous: componentDocuments[index - 1],
  };
}

function ComponentPage() {
  const data = Route.useLoaderData();

  return (
    <Article
      title={data().component.title}
      description={data().component.description}
      component={data().component.slug}
      rawText={data().raw}
      sections={data().sections}
      previous={data().previous}
      next={data().next}
    >
      <Loading fallback={<p>Loading documentation...</p>}>
        <Document slug={`components/${data().component.slug}`} />
      </Loading>
    </Article>
  );
}
