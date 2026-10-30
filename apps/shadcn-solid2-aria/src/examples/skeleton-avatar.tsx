/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/skeleton-avatar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Skeleton } from "../registry/ui/skeleton";

export function SkeletonAvatar() {
  return (
    <div class="flex w-fit items-center gap-4">
      <Skeleton class="size-10 shrink-0 rounded-full" />
      <div class="grid gap-2">
        <Skeleton class="h-4 w-[150px]" />
        <Skeleton class="h-4 w-[100px]" />
      </div>
    </div>
  );
}

export default SkeletonAvatar;
