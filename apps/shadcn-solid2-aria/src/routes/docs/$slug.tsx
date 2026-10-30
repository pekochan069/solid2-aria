import { createFileRoute } from "@tanstack/solid-router";

import { GuidePage, loadGuide } from "../../components/docs/guide-page";

export const Route = createFileRoute("/docs/$slug")({
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
  loader: loadGuideRoute,
});

async function loadGuideRoute({ params }: { params: { slug: string } }) {
  return await loadGuide(params.slug);
}

function GuideRoute() {
  const data = Route.useLoaderData();

  return <GuidePage data={data()} />;
}
