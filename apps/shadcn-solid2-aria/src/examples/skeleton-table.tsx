/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/skeleton-table.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Skeleton } from "../registry/ui/skeleton";

export function SkeletonTable() {
  return (
    <div class="flex w-full max-w-sm flex-col gap-2">
      {
        <For each={Array.from({ length: 5 })}>
          {() => (
            <div class="flex gap-4">
              <Skeleton class="h-4 flex-1" />
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-4 w-20" />
            </div>
          )}
        </For>
      }
    </div>
  );
}

export default SkeletonTable;
