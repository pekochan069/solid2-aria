/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/skeleton/analytics-card.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local registry imports, and native attributes.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Card, CardAction, CardHeader } from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

export function AnalyticsCard() {
  return (
    <Card class="mx-auto w-full max-w-sm data-[size=sm]:pb-0" size="sm">
      <CardHeader class="gap-2">
        <Skeleton class="h-5 w-24 rounded-md" />
        <Skeleton class="h-4 w-40 rounded-md" />
        <CardAction>
          <Skeleton class="h-7 w-28 rounded-lg" />
        </CardAction>
      </CardHeader>
      <Skeleton class="mx-6 mb-6 aspect-[1/0.35] w-auto rounded-lg" />
    </Card>
  );
}
