import { createFileRoute, notFound } from "@tanstack/solid-router";

import { ChartsPage } from "../../components/catalog/catalog-pages";
import { chartTypes } from "../../components/catalog/inventory";

export const Route = createFileRoute("/charts/$type")({
  beforeLoad: ({ params }) => {
    if (!chartTypes.includes(params.type)) {
      throw notFound();
    }
  },
  component: () => {
    const params = Route.useParams();

    return <ChartsPage type={params().type} />;
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.type.charAt(0).toUpperCase() + params.type.slice(1)} Charts — shadcn/solid`,
      },
    ],
  }),
});
