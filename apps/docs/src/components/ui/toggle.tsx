/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/toggle.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ToggleButton as TogglePrimitive } from "@solid2-aria/components";
import type { ToggleButtonProps } from "@solid2-aria/components";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

const toggleVariants = cva(
  "hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[state=on]:bg-muted data-selected:bg-muted group/toggle hover:bg-muted inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default:
          "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
      },
      variant: {
        default: "bg-transparent",
        outline: "border-input hover:bg-muted border bg-transparent",
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
