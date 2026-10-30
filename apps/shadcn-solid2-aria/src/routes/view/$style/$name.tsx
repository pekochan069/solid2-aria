/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(view)/view/[style]/[name]/page.tsx.
 * Modified for Solid Aria: local Solid block previews and style validation.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createFileRoute, notFound } from "@tanstack/solid-router";

import {
  BlockPreview,
  hasBlockPreview,
} from "../../../components/catalog/block-preview";

import "../../../styles/catalog.css";

const styles = new Set([
  "nova",
  "vega",
  "maia",
  "lyra",
  "mira",
  "luma",
  "sera",
  "rhea",
]);

export const Route = createFileRoute("/view/$style/$name")({
  beforeLoad: ({ params }) => {
    const style = params.style.replace(/^aria-/u, "");

    if (!styles.has(style) || !hasBlockPreview(params.name)) {
      throw notFound();
    }
  },
  component: View,
});

function View() {
  const params = Route.useParams();

  return (
    <main
      id="main-content"
      class={[
        "catalog-view",
        `style-${params().style.replace(/^aria-/u, "") === "new-york-v4" ? "nova" : params().style.replace(/^aria-/u, "")}`,
      ]}
    >
      <BlockPreview name={params().name} />
    </main>
  );
}
