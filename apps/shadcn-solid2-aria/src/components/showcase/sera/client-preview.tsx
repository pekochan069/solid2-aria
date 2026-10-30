/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/components/lazy-preview.tsx.
 * Modified for Solid Aria: retain browser-only preview boundaries and source placeholders with Solid 2 and TanStack ClientOnly.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX } from "@solidjs/web";
import { ClientOnly } from "@tanstack/solid-router";

export function ClientPreview(props: {
  minHeight: number;
  children: JSX.Element;
}) {
  return (
    <ClientOnly fallback={<PreviewPlaceholder minHeight={props.minHeight} />}>
      {props.children}
    </ClientOnly>
  );
}

function PreviewPlaceholder(props: { minHeight: number }) {
  return (
    <div
      aria-hidden="true"
      class="preview theme-taupe bg-muted ring-foreground/5 @container/preview w-full flex-1 p-4 font-sans ring-1 [--gap:--spacing(4)] sm:p-6 md:[--gap:--spacing(6)] xl:[--gap:--spacing(8)]"
      style={{ "min-height": `${props.minHeight}px` }}
    >
      <div class="container flex flex-col gap-(--gap) py-(--gap)">
        <div class="flex items-center justify-between gap-4">
          <div class="flex flex-col gap-3">
            <div class="bg-background/80 h-5 w-44" />
            <div class="bg-background/60 h-3 w-56 max-w-full" />
          </div>
          <div class="bg-background/70 hidden h-8 w-28 sm:block" />
        </div>
        <div class="grid grid-cols-1 gap-(--gap) md:grid-cols-3">
          <div class="bg-background/70 min-h-48 md:col-span-2" />
          <div class="bg-background/70 min-h-48" />
        </div>
      </div>
    </div>
  );
}
