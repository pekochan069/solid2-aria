/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/kbd.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Keyboard as KbdPrimitive } from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

function Kbd(props: ComponentProps<"kbd">) {
  const rest = omit(props, "class");

  return (
    <KbdPrimitive
      data-slot="kbd"
      class={cn(
        "cn-kbd pointer-events-none inline-flex items-center justify-center select-none",
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
      class={cn("cn-kbd-group inline-flex items-center", props.class)}
      {...rest}
    />
  );
}

export { Kbd, KbdGroup };
