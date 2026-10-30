import { createFileRoute, notFound } from "@tanstack/solid-router";

import { BlocksPage } from "../../components/catalog/catalog-pages";
import { blockCategories } from "../../components/catalog/inventory";

export const Route = createFileRoute("/blocks/$")({
  beforeLoad: ({ params }) => {
    if (
      params._splat === undefined ||
      params._splat === "" ||
      !params._splat
        .split("/")
        .every((category) => blockCategories.includes(category))
    ) {
      throw notFound();
    }
  },
  component: () => {
    const params = Route.useParams();

    return <BlocksPage category={params()._splat} />;
  },
  head: () => ({ meta: [{ title: "Blocks — shadcn/solid" }] }),
});
