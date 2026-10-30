/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/button.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
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
import { cn } from "cn";
import { merge, omit } from "solid-js";

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "cn-button-size-default",
        icon: "cn-button-size-icon",
        "icon-lg": "cn-button-size-icon-lg",
        "icon-sm": "cn-button-size-icon-sm",
        "icon-xs": "cn-button-size-icon-xs",
        lg: "cn-button-size-lg",
        sm: "cn-button-size-sm",
        xs: "cn-button-size-xs",
      },
      variant: {
        default: "cn-button-variant-default",
        destructive: "cn-button-variant-destructive",
        ghost: "cn-button-variant-ghost",
        link: "cn-button-variant-link",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
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
