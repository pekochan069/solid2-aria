/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/alert.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { omit } from "solid-js";

const alertVariants = cva("cn-alert group/alert relative w-full", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "cn-alert-variant-default",
      destructive: "cn-alert-variant-destructive",
    },
  },
});

function Alert(
  props: ComponentProps<"div"> & VariantProps<typeof alertVariants>
) {
  const rest = omit(props, "class", "variant");

  return (
    <div
      data-slot="alert"
      role="alert"
      class={cn(alertVariants({ variant: props.variant }), props.class)}
      {...rest}
    />
  );
}

function AlertTitle(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="alert-title"
      class={cn(
        "cn-alert-title [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        props.class
      )}
      {...rest}
    />
  );
}

function AlertDescription(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="alert-description"
      class={cn(
        "cn-alert-description [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        props.class
      )}
      {...rest}
    />
  );
}

function AlertAction(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="alert-action"
      class={cn("cn-alert-action", props.class)}
      {...rest}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
