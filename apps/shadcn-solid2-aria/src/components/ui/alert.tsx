/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/alert.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { omit } from "solid-js";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
  }
);

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
        "[&_a]:hover:text-foreground font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
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
        "text-muted-foreground [&_a]:hover:text-foreground text-sm text-balance md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
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
      class={cn("absolute top-2 right-2", props.class)}
      {...rest}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
