/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/skeleton/empty-distribute-track.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local registry imports, and native attributes.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Card, CardContent } from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

export function EmptyDistributeTrack() {
  return (
    <Card>
      <CardContent>
        <div class="flex flex-col items-center gap-4 p-4">
          <Skeleton class="size-12 rounded-xl" />
          <div class="flex flex-col items-center gap-2">
            <Skeleton class="h-5 w-40 rounded-md" />
            <Skeleton class="h-3 w-64 rounded-md" />
            <Skeleton class="h-3 w-48 rounded-md" />
          </div>
          <Skeleton class="h-9 w-32 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
