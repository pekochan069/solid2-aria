/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview/cards/skeleton-loading.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Card, CardContent } from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

export function SkeletonLoading() {
  return (
    <Card>
      <CardContent class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <Skeleton class="size-10 rounded-full" />
          <div class="flex flex-1 flex-col gap-2">
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-4/5" />
        </div>
        <div class="flex gap-2">
          <Skeleton class="h-8 w-20" />
          <Skeleton class="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default SkeletonLoading;
