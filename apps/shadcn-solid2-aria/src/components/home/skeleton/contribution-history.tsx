/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/skeleton/contribution-history.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local registry imports, and native attributes.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

const bars = [60, 80, 65, 95, 50, 100];

export function ContributionHistory() {
  return (
    <Card>
      <CardHeader class="gap-2">
        <Skeleton class="h-5 w-44 rounded-md" />
        <Skeleton class="h-4 w-52 rounded-md" />
      </CardHeader>
      <CardContent>
        <div class="flex h-50 w-full items-end gap-3">
          <For each={bars}>
            {(height) => (
              <div class="flex h-full flex-1 flex-col justify-end gap-2">
                <Skeleton
                  class="w-full rounded-t-md rounded-b-none"
                  style={{ height: `${height}%` }}
                />
                <Skeleton class="mx-auto h-3 w-6 rounded-md" />
              </div>
            )}
          </For>
        </div>
      </CardContent>
      <CardContent>
        <div class="grid w-full grid-cols-1 gap-3 xl:grid-cols-2">
          <div class="bg-muted flex flex-col gap-2 rounded-xl p-4">
            <Skeleton class="bg-muted-foreground/15 h-3 w-20 rounded-md" />
            <Skeleton class="bg-muted-foreground/15 h-5 w-28 rounded-md" />
            <Skeleton class="bg-muted-foreground/15 h-3 w-24 rounded-md" />
          </div>
          <div class="bg-muted hidden flex-col gap-2 rounded-xl p-4 xl:flex">
            <Skeleton class="bg-muted-foreground/15 h-3 w-24 rounded-md" />
            <Skeleton class="bg-muted-foreground/15 h-5 w-32 rounded-md" />
            <Skeleton class="bg-muted-foreground/15 h-3 w-28 rounded-md" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton class="h-9 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}
