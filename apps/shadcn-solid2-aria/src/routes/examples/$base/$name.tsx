import { dynamic } from "@solidjs/web";
import { ClientOnly, createFileRoute, notFound } from "@tanstack/solid-router";
import { Loading } from "solid-js";

import { examples } from "../../../lib/examples";

export const Route = createFileRoute("/examples/$base/$name")({
  component: StandaloneExample,
  loader: ({ params }) => {
    if (params.base !== "aria" || !examples.has(params.name)) {
      throw notFound();
    }

    return { name: params.name };
  },
});

function StandaloneExample() {
  return (
    <main id="main-content" class="standalone-example">
      <ClientOnly fallback={<p>Loading example…</p>}>
        <ExampleContent />
      </ClientOnly>
    </main>
  );
}

function ExampleContent() {
  const data = Route.useLoaderData();
  const Example = dynamic(() => examples.get(data().name));

  return (
    <Loading fallback={<p>Loading example…</p>}>
      <Example />
    </Loading>
  );
}
