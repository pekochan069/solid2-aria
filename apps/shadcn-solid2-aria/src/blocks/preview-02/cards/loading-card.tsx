/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/preview-02/cards/loading-card.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Card, CardContent, CardHeader } from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton class="h-5 w-32" />
        <Skeleton class="h-4 w-48" />
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <Skeleton class="h-32 w-full rounded-lg" />
        <div class="flex flex-col gap-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </div>
        <div class="flex gap-2">
          <Skeleton class="h-9 flex-1 rounded-md" />
          <Skeleton class="h-9 flex-1 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default LoadingCard;
