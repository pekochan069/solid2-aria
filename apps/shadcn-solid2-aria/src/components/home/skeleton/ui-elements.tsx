/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/skeleton/ui-elements.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local registry imports, and native attributes.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Card, CardContent } from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

export function UIElements() {
  return (
    <Card class="w-full">
      <CardContent class="flex flex-col gap-6">
        <Skeleton class="h-8 w-full rounded-2xl" />
        <div class="flex flex-wrap gap-2">
          <Skeleton class="h-9 w-20 rounded-lg" />
          <Skeleton class="h-9 w-24 rounded-lg" />
          <Skeleton class="h-9 w-20 rounded-lg" />
        </div>
        <div class="flex flex-col gap-3">
          <Skeleton class="h-9 w-full rounded-lg" />
          <Skeleton class="h-20 w-full rounded-lg" />
        </div>
        <div class="flex items-center gap-2">
          <div class="flex gap-2">
            <Skeleton class="h-5 w-12 rounded-full" />
            <Skeleton class="h-5 w-16 rounded-full" />
            <Skeleton class="4xl:block hidden h-5 w-14 rounded-full" />
          </div>
          <div class="ml-auto flex gap-3">
            <Skeleton class="size-4 rounded-full" />
            <Skeleton class="size-4 rounded-full" />
          </div>
          <div class="flex gap-3">
            <Skeleton class="size-4 rounded-sm" />
            <Skeleton class="4xl:block hidden size-4 rounded-sm" />
          </div>
          <Skeleton class="4xl:hidden ml-auto h-5 w-9 rounded-full" />
        </div>
        <div class="flex items-center gap-4">
          <Skeleton class="h-9 w-24 rounded-lg" />
          <div class="flex">
            <Skeleton class="h-9 w-28 rounded-l-lg rounded-r-none" />
            <Skeleton class="ml-px h-9 w-9 rounded-l-none rounded-r-lg" />
          </div>
          <Skeleton class="4xl:block ml-auto hidden h-5 w-9 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
