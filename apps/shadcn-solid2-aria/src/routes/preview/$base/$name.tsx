/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(create)/hooks/use-iframe-sync.tsx and components/design-system-provider.tsx.
 * Modified for Solid Aria: validated parent messages update the Solid preview route and styles in place.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { useHead } from "@solidjs/web";
import { createFileRoute, notFound } from "@tanstack/solid-router";
import type { SearchSchemaInput } from "@tanstack/solid-router";
import { onSettled } from "solid-js";

import { BlockPreview } from "../../../components/catalog/block-preview";
import { blocks } from "../../../components/catalog/inventory";
import { designThemeCss } from "../../../lib/design-theme";
import type { DesignConfig } from "../../../lib/tool-state";
import {
  designPreviewMessageSchema,
  designSchema,
} from "../../../lib/tool-state";

import "../../../styles/tools.css";

export const Route = createFileRoute("/preview/$base/$name")({
  component: Preview,
  loader: ({ params }) => {
    if (
      params.base !== "aria" ||
      !blocks.some((block) => block.name === params.name)
    ) {
      throw notFound();
    }

    return { name: params.name };
  },
  validateSearch: (search: SearchSchemaInput & Partial<DesignConfig>) =>
    designSchema.parse(search),
});

function Preview() {
  const data = Route.useLoaderData();
  const config = Route.useSearch();
  const navigate = Route.useNavigate();

  const receivePreview = (event: MessageEvent<unknown>) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== window.parent
    ) {
      return;
    }

    const message = designPreviewMessageSchema.safeParse(event.data);

    if (message.success) {
      void navigate({
        replace: true,
        resetScroll: false,
        search: message.data.data,
      });
    }
  };

  onSettled(() => {
    window.addEventListener("message", receivePreview);

    return () => {
      window.removeEventListener("message", receivePreview);
    };
  });

  useHead(() => ({
    props: { children: designThemeCss(config()), id: "design-system-theme" },
    tag: "style",
  }));

  return (
    <main
      id="main-content"
      class={`standalone-preview style-${config().style}`}
      data-menu-color={config().menuColor}
      data-menu-accent={config().menuAccent}
      dir={config().rtl === "true" ? "rtl" : "ltr"}
    >
      <BlockPreview name={data().name} />
    </main>
  );
}
