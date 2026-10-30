/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/docs/[[...slug]]/page.tsx, components/docs-toc.tsx, components/docs-base-switcher.tsx, and components/open-in-v0-cta.tsx.
 * Modified for Solid Aria: Solid 2 article layout, Markdown clipboard content, observed table of contents, and local TanStack navigation.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
} from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";
import { createEffect, createSignal, For, onSettled, Show } from "solid-js";

import { absoluteUrl } from "../../lib/site";

export function Article(props: {
  title: string;
  description: string;
  category?: string;
  component?: string;
  rawText?: string;
  sections: { id: string; title: string; depth?: number }[];
  children: JSX.Element;
  previous?: { href: string; title: string };
  next?: { href: string; title: string };
}) {
  const [copyStatus, setCopyStatus] = createSignal<
    "idle" | "copied" | "failed"
  >("idle");

  const [activeHeading, setActiveHeading] = createSignal<string | null>(null);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  onSettled(() => () => {
    clearTimeout(copyTimer);
  });

  createEffect(
    () => props.sections.map((section) => section.id),
    (ids) => {
      if (typeof IntersectionObserver === "undefined") {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveHeading(entry.target.id);
            }
          }
        },
        { rootMargin: "0% 0% -80% 0%" }
      );

      for (const id of ids) {
        const element = document.querySelector(`#${CSS.escape(id)}`);

        if (element) {
          observer.observe(element);
        }
      }

      // oxlint-disable-next-line typescript/consistent-return
      return () => {
        observer.disconnect();
      };
    }
  );

  async function copyPage() {
    const text =
      props.rawText ?? document.querySelector("#main-content")?.textContent;

    if (text === undefined) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      setCopyStatus("idle");
    }, 2000);
  }

  function viewMarkdown() {
    const text =
      props.rawText ??
      document.querySelector("#main-content")?.textContent ??
      "";

    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" })
    );

    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30_000);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        absoluteUrl(
          window.location.pathname +
            window.location.search +
            window.location.hash
        )
      );
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div class="article-layout" data-slot="docs">
      <div class="article-column">
        <div class="docs-top-spacing" />
        <main id="main-content" class="docs-article">
          <div class="article-heading">
            <div class="article-heading-row">
              <h1>{props.title}</h1>
              <div class="article-actions">
                <div class="article-copy-group">
                  <button
                    type="button"
                    class="article-copy"
                    onClick={() => {
                      void copyPage();
                    }}
                  >
                    {copyStatus() === "copied" ? (
                      <CheckIcon size={16} />
                    ) : (
                      <CopyIcon size={16} />
                    )}
                    {copyStatus() === "copied" ? "Copied" : "Copy Page"}
                  </button>
                  <details class="article-copy-menu">
                    <summary aria-label="Page actions">
                      <ChevronDownIcon size={14} />
                    </summary>
                    <div class="article-copy-options">
                      <button type="button" onClick={viewMarkdown}>
                        View as Markdown
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void copyLink();
                        }}
                      >
                        Copy link
                      </button>
                    </div>
                  </details>
                </div>
                <Show when={props.previous}>
                  {(page) => (
                    <Link
                      to={page().href}
                      class="article-arrow"
                      aria-label="Previous page"
                    >
                      <ArrowLeftIcon size={16} />
                    </Link>
                  )}
                </Show>
                <Show when={props.next}>
                  {(page) => (
                    <Link
                      to={page().href}
                      class="article-arrow"
                      aria-label="Next page"
                    >
                      <ArrowRightIcon size={16} />
                    </Link>
                  )}
                </Show>
              </div>
            </div>
            <span class="sr-only" role="status">
              {copyStatus() === "failed"
                ? "Could not copy this page. Select and copy its text manually."
                : ""}
              {copyStatus() === "copied" ? "Page copied to clipboard." : ""}
            </span>
            <p>{props.description}</p>
          </div>
          <div class="article-content typeset">
            <Show when={props.component}>
              <div class="docs-base-switcher" data-not-typeset>
                <span data-active="true">Solid2 Aria</span>
              </div>
            </Show>
            {props.children}
          </div>
          <nav class="page-pagination" aria-label="Documentation pages">
            <Show when={props.previous}>
              {(page) => (
                <Link to={page().href}>
                  <ArrowLeftIcon size={16} /> {page().title}
                </Link>
              )}
            </Show>
            <Show when={props.next}>
              {(page) => (
                <Link to={page().href} class="next-page">
                  {page().title} <ArrowRightIcon size={16} />
                </Link>
              )}
            </Show>
          </nav>
        </main>
      </div>
      <aside class="docs-toc" aria-label="On this page">
        <div class="docs-top-spacing" />
        <Show when={props.sections.length > 0}>
          <div class="docs-toc-scroll">
            <nav class="docs-toc-links" aria-label="Table of contents">
              <h2>On This Page</h2>
              <For each={props.sections}>
                {(section) => (
                  <a
                    href={`#${section.id}`}
                    data-depth={section.depth ?? 2}
                    data-active={
                      activeHeading() === section.id ? "true" : undefined
                    }
                  >
                    {section.title}
                  </a>
                )}
              </For>
            </nav>
          </div>
        </Show>
        <div class="toc-promotion">
          <div class="toc-note">
            <strong>Build your Solid 2 design system</strong>
            <p>Accessible components. Open source. Open code.</p>
            <p>
              Customize your style, colors, and typography with Solid2 Aria.
            </p>
            <span class="toc-deploy-button">Create your project</span>
            <a href="/create" aria-label="Create your Solid 2 project" />
          </div>
        </div>
      </aside>
    </div>
  );
}
