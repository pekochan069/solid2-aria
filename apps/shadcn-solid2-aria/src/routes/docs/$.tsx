import { createFileRoute, redirect } from "@tanstack/solid-router";

import { GuidePage, loadGuide } from "../../components/docs/guide-page";
import { findComponent } from "../../lib/docs";

export const Route = createFileRoute("/docs/$")({
  component: GuideRoute,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.page.title ?? "Documentation"} — shadcn/solid` },
      {
        content: loaderData?.page.description ?? "Solid 2 documentation.",
        name: "description",
      },
    ],
  }),
  loader: loadNestedGuide,
});

async function loadNestedGuide({ params }: { params: { _splat?: string } }) {
  const component = /^components\/aria\/(?<component>[^/]+)$/u.exec(
    params._splat ?? ""
  )?.groups?.component;

  if (component !== undefined && findComponent(component)) {
    throw redirect({
      params: { component },
      to: "/docs/components/$component",
    });
  }

  return await loadGuide(params._splat ?? "");
}

function GuideRoute() {
  const data = Route.useLoaderData();

  return <GuidePage data={data()} />;
}
