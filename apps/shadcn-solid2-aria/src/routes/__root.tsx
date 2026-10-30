/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/{layout.tsx,(app)/layout.tsx} and apps/v4/components/site-footer.tsx.
 * Modified for Solid Aria: Solid 2 document shell, TanStack Router, per-page component styles, local theme persistence, and Solid Aria attribution.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { useHead } from "@solidjs/web";
import {
  HeadContent,
  ClientOnly,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from "@tanstack/solid-router";
import { createMemo, onSettled, Show } from "solid-js";

import { PackageManagerProvider } from "../components/docs/package-manager";
import { SiteHeader } from "../components/docs/site-header";
import { exampleStyles } from "../lib/example-styles";
import { absoluteUrl } from "../lib/site";
import { getThemeStylesheet } from "../lib/theme-stylesheets";
import { designFields } from "../lib/tool-state";
import { Toaster } from "../registry/ui/sonner";

import appCss from "../styles/global.css?url";

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      { href: appCss, rel: "stylesheet" },
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      {
        as: "font",
        crossOrigin: "anonymous",
        href: "/fonts/geist-latin.woff2",
        rel: "preload",
        type: "font/woff2",
      },
    ],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1.0", name: "viewport" },
      { title: "shadcn/solid — Solid2 Aria" },
      {
        content:
          "Beautiful, accessible UI components for Solid 2, built with Solid2 Aria and Tailwind CSS.",
        name: "description",
      },
    ],
  }),
  notFoundComponent: () => (
    <main id="main-content" class="not-found page-width">
      <span class="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>A little off the beaten path.</h1>
      <p>Let’s get you back to building.</p>
      <Link to="/docs" class="primary-link">
        Back to documentation →
      </Link>
    </main>
  ),
});

function RootComponent() {
  const location = useLocation();

  onSettled(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function storageTheme(event: StorageEvent) {
      if (event.key === "shadcn-solid2-theme" || event.key === null) {
        document.documentElement.classList.toggle(
          "dark",
          event.newValue === "dark" ||
            (event.newValue === null && media.matches)
        );
      }
    }

    function systemTheme() {
      try {
        if (localStorage.getItem("shadcn-solid2-theme") === null) {
          document.documentElement.classList.toggle("dark", media.matches);
        }
      } catch {
        document.documentElement.classList.toggle("dark", media.matches);
      }
    }

    window.addEventListener("storage", storageTheme);
    media.addEventListener("change", systemTheme);

    return () => {
      window.removeEventListener("storage", storageTheme);
      media.removeEventListener("change", systemTheme);
    };
  });

  const standalone = createMemo(
    () =>
      /^\/(?:preview|view)\//u.test(location().pathname) ||
      /^\/examples\/[^/]+\/[^/]+\/?$/u.test(location().pathname)
  );

  const pageKind = createMemo(() => {
    const { pathname } = location();

    if (/^\/(?:create|typeset)(?:\/|$)/u.test(pathname)) {
      return "designer";
    }

    if (/^\/docs(?:\/|$)/u.test(pathname)) {
      return "docs";
    }

    return /^\/(?:examples|blocks|sera)(?:\/|$)/u.test(pathname)
      ? "soft"
      : "default";
  });

  const style = createMemo(() => {
    const { pathname } = location();

    if (pathname.startsWith("/preview/aria/")) {
      return designFields.shape.style.parse(location().search.style);
    }

    if (pathname === "/") {
      return "rhea";
    }

    if (pathname === "/sera") {
      return "sera";
    }

    const example = /^\/examples\/[^/]+\/(?<name>[^/]+)\/?$/u.exec(pathname)
      ?.groups?.name;

    if (example !== undefined) {
      return exampleStyles.get(example) ?? "nova";
    }

    const viewStyle = /^\/view\/(?:aria-|base-|radix-)?(?<style>[^/]+)\//u.exec(
      pathname
    )?.groups?.style;

    return viewStyle !== undefined && viewStyle !== "new-york-v4"
      ? viewStyle
      : "nova";
  });

  useHead(() => ({
    props: { href: getThemeStylesheet(style()), rel: "stylesheet" },
    tag: "link",
  }));

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="canonical" href={absoluteUrl(location().pathname)} />
        <meta property="og:url" content={absoluteUrl(location().pathname)} />
        <script>{`try{var t=localStorage.getItem('shadcn-solid2-theme');document.documentElement.classList.toggle('dark',t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))}catch{}`}</script>
      </head>
      <body class={[`style-${style()}`, "site-body"]}>
        <div class="site-layout" data-slot="layout" data-page-kind={pageKind()}>
          <Show when={!standalone()}>
            <a class="skip-link" href="#main-content">
              Skip to content
            </a>
            <SiteHeader />
          </Show>
          <PackageManagerProvider>
            <Outlet />
          </PackageManagerProvider>
          <ClientOnly>
            <Toaster />
          </ClientOnly>
          <Show when={!standalone()}>
            <footer class="site-footer">
              <div class="container-wrapper">
                <div class="site-footer-inner">
                  <p>
                    Built by{" "}
                    <a
                      href="https://shadcn.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      shadcn
                    </a>
                    . Adapted for <a href="/docs">Solid 2</a> with{" "}
                    <a href="/docs/accessibility">Solid2 Aria</a>. The source
                    code is available on{" "}
                    <a
                      href="https://github.com/pekochan069/solid2-aria"
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                    .
                  </p>
                </div>
              </div>
            </footer>
          </Show>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
