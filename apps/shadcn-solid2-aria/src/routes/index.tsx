/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/page.tsx and apps/v4/components/announcement.tsx.
 * Modified for Solid Aria: Solid 2 routing, local Aria component gallery, and local documentation destinations.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ClientOnly, createFileRoute, Link } from "@tanstack/solid-router";

import { PageHeader } from "../components/docs/page-header";
import { CardsDemo } from "../components/home/cards";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "shadcn/solid — The Foundation for your Design System" },
      {
        content:
          "Composable, accessible components with thoughtful defaults. Build your own component library with code you can customize, extend, and make your own.",
        name: "description",
      },
    ],
  }),
});

function GalleryImage() {
  return (
    <div class="gallery-image">
      <img
        src="/images/full-light.png"
        width="2560"
        height="2764"
        alt="Component dashboard examples"
        class="gallery-light"
        fetchpriority="high"
      />
      <img
        src="/images/full-dark.png"
        width="2560"
        height="2764"
        alt="Component dashboard examples"
        class="gallery-dark"
        fetchpriority="high"
      />
    </div>
  );
}

function Home() {
  return (
    <main id="main-content" class="home-main">
      <PageHeader
        class="home-page-header"
        headingClass="home-heading"
        title="The Foundation for your Design System"
        description="Composable, accessible components with thoughtful defaults. Build your own component library with code you can customize, extend, and make your own."
      >
        <Link
          to="/docs/$slug"
          params={{ slug: "installation" }}
          class="primary-link"
        >
          Get Started
        </Link>
        <Link to="/docs/components" class="secondary-link">
          View Components
        </Link>
      </PageHeader>
      <section aria-label="Component examples" class="home-gallery">
        <div class="mobile-gallery">
          <GalleryImage />
        </div>
        <div class="desktop-gallery">
          <ClientOnly fallback={<GalleryImage />}>
            <CardsDemo />
          </ClientOnly>
        </div>
      </section>
    </main>
  );
}
