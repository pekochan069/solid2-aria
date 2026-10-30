/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/button.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Button as ButtonPrimitive,
  Link as LinkPrimitive,
} from "@solid2-aria/components";
import type {
  ButtonProps as ButtonPrimitiveProps,
  LinkProps as LinkPrimitiveProps,
} from "@solid2-aria/components";
import type { JSX } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-lg": "size-9",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
      },
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        destructive:
          "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
      },
    },
  }
);

function Button(
  props: Omit<ButtonPrimitiveProps, "class"> &
    Pick<JSX.IntrinsicElements["button"], "ref"> &
    VariantProps<typeof buttonVariants> & {
      class?: string;
    }
) {
  const merged = merge({ size: "default", variant: "default" } as const, props);

  const rest = omit(merged, "class", "variant", "size");

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={merged.variant}
      data-size={merged.size}
      class={cn(
        buttonVariants({
          class: merged.class,
          size: merged.size,
          variant: merged.variant,
        })
      )}
      {...rest}
    />
  );
}

function LinkButton(
  props: Omit<LinkPrimitiveProps, "class"> &
    VariantProps<typeof buttonVariants> & {
      class?: string;
    }
) {
  const merged = merge({ size: "default", variant: "default" } as const, props);

  const rest = omit(merged, "class", "variant", "size");

  return (
    <LinkPrimitive
      data-slot="button"
      data-variant={merged.variant}
      data-size={merged.size}
      class={cn(
        buttonVariants({
          class: merged.class,
          size: merged.size,
          variant: merged.variant,
        })
      )}
      {...rest}
    />
  );
}

export { Button, LinkButton, buttonVariants };
