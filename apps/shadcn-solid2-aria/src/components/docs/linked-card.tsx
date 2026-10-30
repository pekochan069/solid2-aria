/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/mdx-components.tsx (LinkedCard).
 * Modified for Solid Aria: native Solid 2 anchor props and reactive class merging.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

export function LinkedCard(props: JSX.IntrinsicElements["a"]) {
  const rest = omit(props, "class");

  return (
    <a
      data-not-typeset
      class={cn(
        "bg-surface text-surface-foreground hover:bg-surface/80 flex w-full flex-col items-center rounded-2xl p-6 transition-colors sm:p-10",
        props.class
      )}
      {...rest}
    />
  );
}
