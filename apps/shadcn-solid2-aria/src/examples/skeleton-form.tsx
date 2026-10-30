/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/skeleton-form.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Skeleton } from "../registry/ui/skeleton";

export function SkeletonForm() {
  return (
    <div class="flex w-full max-w-xs flex-col gap-7">
      <div class="flex flex-col gap-3">
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-8 w-full" />
      </div>
      <div class="flex flex-col gap-3">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-8 w-full" />
      </div>
      <Skeleton class="h-8 w-24" />
    </div>
  );
}

export default SkeletonForm;
