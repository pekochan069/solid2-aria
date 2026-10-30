/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/layout.tsx and components/theme-selector.tsx.
 * Modified for Solid Aria: Solid 2 route outlet, local example navigation, reactive theme selection, and responsive previews.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createFileRoute, Outlet, useLocation } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";

import { CopyButton } from "../components/docs/code";
import { PageHeader, PageNav } from "../components/docs/page-header";
import { examplePages } from "../components/showcase/example-page";
import { themeColors } from "../lib/tool-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../registry/ui/select";

export const Route = createFileRoute("/examples")({
  component: ExamplesLayout,
});

function ExamplesLayout() {
  const location = useLocation();

  const themes = [
    "neutral",
    "blue",
    "green",
    "orange",
    "rose",
    "violet",
  ] as const;

  const [theme, setTheme] = createSignal<(typeof themes)[number]>("neutral");

  return (
    <Show
      when={location().pathname.split("/").filter(Boolean).length < 3}
      fallback={<Outlet />}
    >
      <main id="main-content" class="showcase-layout">
        <PageHeader
          headingClass="home-heading"
          title="The Foundation for your Design System"
          description="A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code."
        >
          <a class="primary-link" href="/docs/installation">
            Get Started
          </a>
          <a class="secondary-link" href="/docs/components">
            View Components
          </a>
        </PageHeader>
        <PageNav
          id="examples"
          label="Example pages"
          actions={
            <div class="showcase-theme-selector">
              <Select
                aria-label="Example theme"
                value={theme()}
                onChange={(value) => {
                  const selected = themes.find((item) => item === value);

                  if (selected) {
                    setTheme(selected);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <For each={themes}>
                    {(item) => (
                      <SelectItem id={item}>
                        {item[0]?.toUpperCase()}
                        {item.slice(1)}
                      </SelectItem>
                    )}
                  </For>
                </SelectContent>
              </Select>
              <CopyButton
                value={`:root {\n  --primary: ${themeColors[theme()]};\n  --primary-foreground: white;\n}`}
              />
            </div>
          }
        >
          <a href="/">Examples</a>
          <For each={examplePages}>
            {(example) => (
              <a
                href={`/examples/${example.name}`}
                aria-current={
                  location().pathname === `/examples/${example.name}`
                    ? "page"
                    : undefined
                }
              >
                {example.title}
              </a>
            )}
          </For>
        </PageNav>
        <div class="container-wrapper showcase-content section-soft">
          <div class="container">
            <div
              class="showcase-preview"
              style={
                theme() === "neutral"
                  ? undefined
                  : {
                      "--primary": themeColors[theme()],
                      "--primary-foreground": "white",
                    }
              }
            >
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </Show>
  );
}
