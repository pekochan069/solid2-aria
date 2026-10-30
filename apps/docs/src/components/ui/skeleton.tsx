/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/skeleton.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { omit } from "solid-js";

import { cn } from "#lib/cn";

function Skeleton(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="skeleton"
      class={cn("bg-muted animate-pulse rounded-md", props.class)}
      {...rest}
    />
  );
}

export { Skeleton };
