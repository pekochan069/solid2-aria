/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/page.tsx and components/image-preview.tsx.
 * Modified for Solid Aria: native Solid 2 sections, local previews, and local creation navigation.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowRightIcon } from "@lucide/solid";
import { For } from "solid-js";

import { PageHeader } from "../docs/page-header";
import { ArticleDirectory } from "./sera/article-directory";
import { AudienceAnalytics } from "./sera/audience-analytics";
import { ClientPreview } from "./sera/client-preview";
import { EditArticle } from "./sera/edit-article";
import { EmptyState } from "./sera/empty-state";
import { MediaLibrary } from "./sera/media-library";
import { MediaLibraryTable } from "./sera/media-library-table";

import "../../styles/showcase.css";
import "../../styles/sera.css";

export function SeraPage() {
  return (
    <main id="main-content" class="showcase-sera">
      <PageHeader
        class="sera-page-header"
        headingClass="sera-heading"
        announcement={false}
        title="Introducing Sera"
        description="Minimal. Editorial. Typographic. Underline Controls and Uppercase Headings. Shaped by Print Design Principles."
      >
        <a class="sera-create-link" href="/create?style=sera">
          Open in shadcn/create{" "}
          <ArrowRightIcon size={16} data-icon="inline-end" />
        </a>
      </PageHeader>
      <div class="sera-mobile-preview">
        <For each={["sera-01", "sera-03", "sera-02", "sera-06"]}>
          {(name) => (
            <div>
              <img
                src={`/images/${name}-light.png`}
                width="1440"
                height="900"
                alt={name}
                class="gallery-light"
              />
              <img
                src={`/images/${name}-dark.png`}
                width="1440"
                height="900"
                alt={name}
                class="gallery-dark"
              />
            </div>
          )}
        </For>
      </div>
      <div class="container-wrapper section-soft sera-desktop-previews">
        <div class="showcase-sera-content container">
          <AudienceAnalytics />
          <ClientPreview minHeight={760}>
            <ArticleDirectory />
          </ClientPreview>
          <ClientPreview minHeight={560}>
            <EmptyState />
          </ClientPreview>
          <ClientPreview minHeight={980}>
            <EditArticle />
          </ClientPreview>
          <ClientPreview minHeight={880}>
            <MediaLibrary />
          </ClientPreview>
          <ClientPreview minHeight={980}>
            <MediaLibraryTable />
          </ClientPreview>
        </div>
      </div>
    </main>
  );
}
