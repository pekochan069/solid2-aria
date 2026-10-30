/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/skeleton-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Skeleton } from "../registry/ui/skeleton";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {},
  },
  en: {
    dir: "ltr",
    values: {},
  },
  he: {
    dir: "rtl",
    values: {},
  },
} satisfies Translations;

export function SkeletonRtl() {
  const { dir } = useTranslation(translations, "ar");

  return (
    <div class="flex items-center gap-4" dir={dir}>
      <Skeleton class="h-12 w-12 rounded-full" />
      <div class="space-y-2">
        <Skeleton class="h-4 w-[250px]" />
        <Skeleton class="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default SkeletonRtl;
