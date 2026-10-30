/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/content/docs/components/index.mdx and apps/v4/components/components-list.tsx.
 * Modified for Solid Aria: Solid 2 component inventory and local documentation links.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

import { Article } from "../../../components/docs/article";
import { components } from "../../../lib/docs";

export const Route = createFileRoute("/docs/components/")({
  component: Components,
  head: () => ({ meta: [{ title: "Components — shadcn/solid" }] }),
});

function Components() {
  return (
    <Article
      title="Components"
      description="Here you can find all the components available in the library. We are working on adding more components."
      sections={[
        { id: "new-components", title: "New Components" },
        { id: "all-components", title: "All Components" },
      ]}
      next={{ href: "/docs/components/accordion", title: "Accordion" }}
    >
      <h2 id="new-components">New Components</h2>
      <div class="components-list" data-not-typeset>
        <Link
          to="/docs/components/$component"
          params={{ component: "code-block" }}
        >
          Code Block
        </Link>
        <Link to="/docs/components/$component" params={{ component: "trace" }}>
          Trace
        </Link>
      </div>
      <h2 id="all-components">All Components</h2>
      <section class="component-index" data-not-typeset>
        <For each={components}>
          {(component) => (
            <Link to={component.href} class="component-index-card">
              {component.title}
              <Show
                when={
                  component.href.endsWith("/code-block") ||
                  component.href.endsWith("/trace")
                }
              >
                <span class="component-new-dot" title="New" />
              </Show>
            </Link>
          )}
        </For>
      </section>
    </Article>
  );
}
