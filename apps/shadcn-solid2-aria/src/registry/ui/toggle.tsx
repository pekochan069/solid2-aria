/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/toggle.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ToggleButton as TogglePrimitive } from "@solid2-aria/components";
import type { ToggleButtonProps } from "@solid2-aria/components";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { merge, omit } from "solid-js";

const toggleVariants = cva(
  "cn-toggle cn-toggle-aria group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "cn-toggle-size-default",
        lg: "cn-toggle-size-lg",
        sm: "cn-toggle-size-sm",
      },
      variant: {
        default: "cn-toggle-variant-default",
        outline: "cn-toggle-variant-outline",
      },
    },
  }
);

function Toggle(
  props: ToggleButtonProps & VariantProps<typeof toggleVariants>
) {
  const merged = merge({ size: "default", variant: "default" } as const, props);

  const rest = omit(merged, "class", "variant", "size");

  return (
    <TogglePrimitive
      data-slot="toggle"
      class={cn(
        toggleVariants({
          class: merged.class,
          size: merged.size,
          variant: merged.variant,
        })
      )}
      {...rest}
    />
  );
}

export { Toggle, toggleVariants };
