/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/docs/layout.tsx and apps/v4/components/docs-sidebar.tsx.
 * Modified for Solid Aria: Solid 2 documentation inventory, framework guide groups, owner-scoped sidebar scroll restoration, and TanStack Router links.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Link, Outlet, useLocation } from "@tanstack/solid-router";
import { createEffect, For } from "solid-js";

import { components, frameworkGuideGroups, guides } from "../../lib/docs";

const scrollKey = "solid2-aria-docs-sidebar-scroll";

export function DocsLayout() {
  const location = useLocation();
  let content: HTMLDivElement | undefined;

  function saveScroll() {
    if (!content) {
      return;
    }

    try {
      sessionStorage.setItem(
        scrollKey,
        JSON.stringify({
          pathname: window.location.pathname,
          scrollTop: content.scrollTop,
        })
      );
    } catch {
      // Navigation still works when browser storage is unavailable.
    }
  }

  createEffect(
    () => location().pathname,
    (pathname) => {
      if (!content) {
        return;
      }

      try {
        const stored: unknown = JSON.parse(
          sessionStorage.getItem(scrollKey) ?? "null"
        );

        if (
          stored !== null &&
          typeof stored === "object" &&
          "pathname" in stored &&
          stored.pathname === pathname &&
          "scrollTop" in stored &&
          typeof stored.scrollTop === "number"
        ) {
          content.scrollTop = stored.scrollTop;

          return;
        }
      } catch {
        // Center the active page when no saved position is available.
      }

      const active = content.querySelector<HTMLElement>(
        '.sidebar-link[aria-current="page"]'
      );

      if (active) {
        const bounds = content.getBoundingClientRect();
        const item = active.getBoundingClientRect();

        if (item.top < bounds.top || item.bottom > bounds.bottom) {
          content.scrollTop +=
            item.top - bounds.top - (content.clientHeight - item.height) / 2;
        }
      }

      saveScroll();
    }
  );

  return (
    <div class="docs-layout">
      <aside class="docs-sidebar" aria-label="Documentation navigation">
        <div class="sidebar-rule" />
        <div
          class="docs-sidebar-content"
          ref={(element) => {
            content = element;
          }}
          onScroll={saveScroll}
        >
          <div class="sidebar-group sidebar-sections">
            <h2>Sections</h2>
            <Link
              to="/docs"
              class="sidebar-link"
              activeOptions={{ exact: true }}
              aria-current={
                location().pathname === "/docs" ? "page" : undefined
              }
            >
              Introduction
            </Link>
            <Link
              to="/docs/components"
              class="sidebar-link"
              activeOptions={{ exact: true }}
              data-active={
                location().pathname.startsWith("/docs/components")
                  ? "true"
                  : undefined
              }
            >
              Components
            </Link>
            <For each={guides.filter((guide) => guide.slug !== "introduction")}>
              {(page) => (
                <Link
                  to={page.href}
                  class="sidebar-link"
                  activeOptions={{ exact: true }}
                  aria-current={
                    location().pathname === page.href ? "page" : undefined
                  }
                >
                  {page.title}
                </Link>
              )}
            </For>
          </div>
          <For each={frameworkGuideGroups}>
            {(group) => (
              <div class="sidebar-group">
                <h2>{group.title}</h2>
                <For each={group.pages}>
                  {(page) => (
                    <Link
                      to={page.href}
                      class="sidebar-link"
                      activeOptions={{ exact: true }}
                      aria-current={
                        location().pathname === page.href ? "page" : undefined
                      }
                    >
                      {page.title}
                    </Link>
                  )}
                </For>
              </div>
            )}
          </For>
          <div class="sidebar-group">
            <h2>Components</h2>
            <For each={components}>
              {(page) => (
                <Link
                  to={page.href}
                  class="sidebar-link"
                  activeOptions={{ exact: true }}
                  aria-current={
                    location().pathname === page.href ? "page" : undefined
                  }
                >
                  {page.title}
                </Link>
              )}
            </For>
          </div>
        </div>
      </aside>
      <div class="docs-main">
        <Outlet />
      </div>
    </div>
  );
}
