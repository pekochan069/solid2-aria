/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/skeleton/payments.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local registry imports, and native attributes.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Card, CardContent, CardHeader } from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

const rows = [0, 1, 2];

export function Payments() {
  return (
    <Card>
      <CardHeader class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Skeleton class="h-4 w-12 rounded-md" />
          <Skeleton class="size-1.5 rounded-full" />
          <Skeleton class="size-7 rounded-md" />
          <Skeleton class="size-1.5 rounded-full" />
          <Skeleton class="h-4 w-20 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-2">
          <For each={rows}>
            {() => (
              <div class="bg-muted flex items-center gap-3 rounded-xl p-3">
                <Skeleton class="bg-muted-foreground/15 size-9 rounded-lg" />
                <div class="flex flex-1 flex-col gap-2">
                  <Skeleton class="bg-muted-foreground/15 h-4 w-40 rounded-md" />
                  <Skeleton class="bg-muted-foreground/15 h-3 w-56 rounded-md" />
                </div>
                <Skeleton class="bg-muted-foreground/15 size-4 rounded-md" />
              </div>
            )}
          </For>
        </div>
      </CardContent>
    </Card>
  );
}
