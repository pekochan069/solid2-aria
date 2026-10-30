/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/components/site-header.tsx, apps/v4/components/main-nav.tsx, apps/v4/components/mobile-nav.tsx, and apps/v4/components/mode-switcher.tsx.
 * Modified for Solid Aria: Solid 2 navigation, native search dialog, local component search, and persistent color mode.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ArrowUpRightIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "@lucide/solid";
import { Link, useLocation } from "@tanstack/solid-router";
import { createMemo, createSignal, For, onSettled, Show } from "solid-js";

import { components, guides, pages } from "../../lib/docs";

export function Logo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="m5 12 7-7m-4 14L19 8" stroke="currentColor" stroke-width="2" />
    </svg>
  );
}

function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");

  try {
    localStorage.setItem("shadcn-solid2-theme", dark ? "dark" : "light");
  } catch {
    /* The current tab still updates when storage is unavailable. */
  }
}

export function SiteHeader() {
  const location = useLocation();
  const [query, setQuery] = createSignal("");
  const [menuOpen, setMenuOpen] = createSignal(false);

  const results = createMemo(() => {
    const initialTerm = query().trim().toLowerCase();

    const rank = (title: string) => {
      const normalized = title.toLowerCase();

      if (normalized === initialTerm) {
        return 0;
      }

      if (normalized.startsWith(initialTerm)) {
        return 1;
      }

      return 2;
    };

    const destinations = [
      ...pages,
      {
        description: "Copy Solid 2 page compositions.",
        href: "/blocks",
        title: "Blocks",
      },
      {
        description: "Native Solid SVG charts.",
        href: "/charts",
        title: "Charts",
      },
      {
        description: "Browse and copy Tailwind colors.",
        href: "/colors",
        title: "Colors",
      },
      {
        description: "Customize your design system.",
        href: "/create",
        title: "Create",
      },
      {
        description: "Customize typography.",
        href: "/typeset",
        title: "Typeset",
      },
      {
        description: "Explore Solid 2 applications.",
        href: "/examples/dashboard",
        title: "Examples",
      },
      {
        description: "Explore the editorial style.",
        href: "/sera",
        title: "Sera",
      },
    ];

    return destinations
      .filter((page) =>
        `${page.title} ${page.description}`.toLowerCase().includes(initialTerm)
      )
      .toSorted((left, right) => rank(left.title) - rank(right.title));
  });

  let searchDialog: HTMLDialogElement | undefined;
  let searchInput: HTMLInputElement | undefined;

  function openSearch() {
    setQuery("");
    searchDialog?.showModal();
    searchInput?.focus();
  }

  function shortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();

      if (searchDialog?.open === true) {
        searchDialog.close();
      } else {
        openSearch();
      }
    }
  }

  onSettled(() => {
    document.addEventListener("keydown", shortcut);

    return () => {
      document.removeEventListener("keydown", shortcut);
    };
  });

  return (
    <>
      <header class="site-header">
        <div class="container-wrapper header-wrapper">
          <div class="header-inner">
            <button
              type="button"
              class="mobile-menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen() ? "true" : "false"}
              aria-controls="mobile-navigation"
              onClick={() => {
                setMenuOpen((open) => !open);
              }}
            >
              {menuOpen() ? <XIcon size={18} /> : <MenuIcon size={18} />}
              <span>Menu</span>
            </button>
            <nav class="desktop-nav" aria-label="Main navigation">
              <Link
                to="/"
                data-active={location().pathname === "/" || undefined}
              >
                Home
              </Link>
              <Link
                to="/docs/$slug"
                params={{ slug: "installation" }}
                data-active={
                  location().pathname === "/docs/installation" || undefined
                }
              >
                Docs
              </Link>
              <Link
                to="/docs/components"
                data-active={
                  location().pathname === "/docs/components" || undefined
                }
              >
                Components
              </Link>
              <Link
                to="/blocks"
                data-active={location().pathname === "/blocks" || undefined}
              >
                Blocks
              </Link>
              <Link
                to="/charts"
                data-active={
                  location().pathname.startsWith("/charts") || undefined
                }
              >
                Charts
              </Link>
              <Link
                to="/typeset"
                data-active={location().pathname === "/typeset" || undefined}
              >
                Typeset
              </Link>
              <Link
                to="/create"
                data-active={location().pathname === "/create" || undefined}
              >
                Create
              </Link>
            </nav>
            <div class="header-actions">
              <button type="button" class="search-trigger" onClick={openSearch}>
                <span class="search-label-long">Search documentation...</span>
                <span class="search-label-short">Search...</span>
                <kbd>
                  <span>⌘</span> K
                </kbd>
              </button>
              <span class="header-divider desktop-divider" />
              <a
                class="icon-button github-link"
                href="https://github.com/pekochan069/solid2-aria"
                aria-label="shadcn-solid2-aria on GitHub"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.63 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.33-2.64 5.29-5.15 5.57.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
                </svg>
              </a>
              <span class="header-divider" />
              <button
                type="button"
                class="icon-button"
                aria-label="Toggle theme"
                onClick={toggleTheme}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M12 9l4.65-4.65M12 14.3l7.37-7.37M12 19.6l8.85-8.85" />
                </svg>
              </button>
              <div
                id="designer-header-actions"
                class="designer-header-actions"
              />
              <span class="header-divider" />
              <Link to="/create" class="header-new">
                <PlusIcon size={15} /> New
              </Link>
            </div>
          </div>
        </div>
        <Show when={menuOpen()}>
          <nav
            id="mobile-navigation"
            class="mobile-navigation"
            aria-label="Mobile navigation"
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            <div class="mobile-nav-group">
              <h2>Menu</h2>
              <Link to="/">Home</Link>
              <Link to="/docs/$slug" params={{ slug: "installation" }}>
                Docs
              </Link>
              <Link to="/docs/components">Components</Link>
              <Link
                to="/blocks"
                data-active={location().pathname === "/blocks" || undefined}
              >
                Blocks
              </Link>
              <Link
                to="/charts"
                data-active={
                  location().pathname.startsWith("/charts") || undefined
                }
              >
                Charts
              </Link>
              <Link to="/colors">Colors</Link>
              <Link
                to="/typeset"
                data-active={location().pathname === "/typeset" || undefined}
              >
                Typeset
              </Link>
              <Link
                to="/create"
                data-active={location().pathname === "/create" || undefined}
              >
                Create
              </Link>
              <Link to="/examples/dashboard">Examples</Link>
              <Link to="/sera">Sera</Link>
            </div>
            <div class="mobile-nav-group">
              <h2>Sections</h2>
              <For each={guides}>
                {(page) => <Link to={page.href}>{page.title}</Link>}
              </For>
            </div>
            <div class="mobile-nav-group">
              <h2>Components</h2>
              <For each={components}>
                {(page) => <Link to={page.href}>{page.title}</Link>}
              </For>
            </div>
          </nav>
        </Show>
      </header>
      <dialog
        ref={(element) => {
          searchDialog = element;
        }}
        class="search-dialog"
        aria-labelledby="search-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            searchDialog?.close();
          }
        }}
      >
        <div class="search-box">
          <h2 id="search-title" class="sr-only">
            Search documentation
          </h2>
          <div class="search-input-row">
            <SearchIcon size={18} />
            <input
              ref={(element) => {
                searchInput = element;
              }}
              value={query()}
              onInput={(event) => {
                setQuery(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  searchDialog
                    ?.querySelector<HTMLAnchorElement>(".search-result")
                    ?.focus();
                }
              }}
              placeholder="Search documentation..."
              aria-label="Search documentation"
            />
            <button
              type="button"
              class="icon-button"
              aria-label="Close search"
              onClick={() => searchDialog?.close()}
            >
              <XIcon size={16} />
            </button>
          </div>
          <div
            class="search-results"
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
                return;
              }

              const links = [
                ...event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"),
              ];

              const activeLink = document.activeElement;

              const index =
                activeLink instanceof HTMLAnchorElement
                  ? links.indexOf(activeLink)
                  : -1;

              event.preventDefault();
              const next = links[index + (event.key === "ArrowDown" ? 1 : -1)];

              if (next) {
                next.focus();
              } else {
                searchInput?.focus();
              }
            }}
          >
            <p class="search-category">
              Documentation{" "}
              <span aria-live="polite">{results().length} results</span>
            </p>
            <For
              each={results()}
              fallback={
                <p class="search-empty">
                  No results. Try a component name like “button”.
                </p>
              }
            >
              {(page) => (
                <Link
                  to={page.href}
                  class="search-result"
                  onClick={() => searchDialog?.close()}
                >
                  <span>
                    <strong>{page.title}</strong>
                    <small>{page.description}</small>
                  </span>
                  <ArrowUpRightIcon size={16} />
                </Link>
              )}
            </For>
          </div>
          <div class="search-footer">
            <span>↑ ↓ to navigate</span>
            <span>↵ to open</span>
            <span>esc to close</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
