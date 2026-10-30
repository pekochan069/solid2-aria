/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/skeleton/claimable-balance.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local registry imports, and native attributes.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../registry/ui/card";
import { Skeleton } from "../../../registry/ui/skeleton";

export function ClaimableBalance() {
  return (
    <Card>
      <CardHeader class="gap-3">
        <Skeleton class="h-4 w-36 rounded-md" />
        <Skeleton class="h-12 w-56 rounded-lg" />
        <Skeleton class="h-6 w-32 rounded-full" />
      </CardHeader>
      <CardContent class="flex flex-1 flex-col justify-end">
        <div class="bg-muted flex flex-col gap-3 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <Skeleton class="bg-muted-foreground/15 h-4 w-28 rounded-md" />
            <Skeleton class="bg-muted-foreground/15 h-4 w-20 rounded-md" />
          </div>
          <div class="flex items-center justify-between">
            <Skeleton class="bg-muted-foreground/15 h-4 w-32 rounded-md" />
            <Skeleton class="bg-muted-foreground/15 h-4 w-16 rounded-md" />
          </div>
          <Skeleton class="bg-muted-foreground/15 h-px w-full rounded-none" />
          <div class="flex items-center justify-between">
            <Skeleton class="bg-muted-foreground/15 h-4 w-36 rounded-md" />
            <Skeleton class="bg-muted-foreground/15 h-4 w-24 rounded-md" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex-col gap-2">
        <Skeleton class="h-3 w-full rounded-md" />
        <Skeleton class="h-3 w-11/12 rounded-md" />
        <Skeleton class="h-3 w-3/4 rounded-md" />
      </CardFooter>
    </Card>
  );
}
