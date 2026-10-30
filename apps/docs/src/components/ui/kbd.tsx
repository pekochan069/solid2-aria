/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/kbd.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Keyboard as KbdPrimitive } from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { omit } from "solid-js";

import { cn } from "#lib/cn";

function Kbd(props: ComponentProps<"kbd">) {
  const rest = omit(props, "class");

  return (
    <KbdPrimitive
      data-slot="kbd"
      class={cn(
        "bg-muted text-muted-foreground in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none [&_svg:not([class*='size-'])]:size-3",
        props.class
      )}
      {...rest}
    />
  );
}

function KbdGroup(props: ComponentProps<typeof KbdPrimitive>) {
  const rest = omit(props, "class");

  return (
    <KbdPrimitive
      data-slot="kbd-group"
      class={cn("inline-flex items-center gap-1", props.class)}
      {...rest}
    />
  );
}

export { Kbd, KbdGroup };
