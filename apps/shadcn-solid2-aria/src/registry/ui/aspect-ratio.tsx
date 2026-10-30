/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/aspect-ratio.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

function AspectRatio(
  props: ComponentProps<"div"> & {
    ratio: number;
  }
) {
  const rest = omit(props, "ratio", "class");

  return (
    <div
      data-slot="aspect-ratio"
      style={{
        "--ratio": props.ratio,
      }}
      class={cn("relative aspect-(--ratio)", props.class)}
      {...rest}
    />
  );
}

export { AspectRatio };
