/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/skeleton/new-milestone.tsx.
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

export function NewMilestone() {
  return (
    <Card>
      <CardHeader class="gap-2">
        <Skeleton class="h-5 w-44 rounded-md" />
        <Skeleton class="h-4 w-72 rounded-md" />
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <Skeleton class="h-3 w-20 rounded-md" />
          <Skeleton class="h-9 w-full rounded-lg" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-2">
            <Skeleton class="h-3 w-24 rounded-md" />
            <Skeleton class="h-9 w-full rounded-lg" />
          </div>
          <div class="flex flex-col gap-2">
            <Skeleton class="h-3 w-20 rounded-md" />
            <Skeleton class="h-9 w-full rounded-lg" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex-col gap-2">
        <Skeleton class="h-9 w-full rounded-lg" />
        <Skeleton class="h-9 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}
