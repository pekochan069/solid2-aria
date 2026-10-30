/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/skeleton-card.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Card, CardContent, CardHeader } from "../registry/ui/card";
import { Skeleton } from "../registry/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card class="w-full max-w-xs">
      <CardHeader>
        <Skeleton class="h-4 w-2/3" />
        <Skeleton class="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton class="aspect-video w-full" />
      </CardContent>
    </Card>
  );
}

export default SkeletonCard;
