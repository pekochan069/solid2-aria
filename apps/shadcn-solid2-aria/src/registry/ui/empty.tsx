/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/empty.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { merge, omit } from "solid-js";

function Empty(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="empty"
      class={cn(
        "cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
        props.class
      )}
      {...rest}
    />
  );
}

function EmptyHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="empty-header"
      class={cn(
        "cn-empty-header flex max-w-sm flex-col items-center",
        props.class
      )}
      {...rest}
    />
  );
}

const emptyMediaVariants = cva(
  "cn-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "cn-empty-media-default",
        icon: "cn-empty-media-icon",
      },
    },
  }
);

function EmptyMedia(
  props: ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "variant");

  return (
    <div
      data-slot="empty-icon"
      data-variant={merged.variant}
      class={cn(
        emptyMediaVariants({ class: merged.class, variant: merged.variant })
      )}
      {...rest}
    />
  );
}

function EmptyTitle(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="empty-title"
      class={cn("cn-empty-title cn-font-heading", props.class)}
      {...rest}
    />
  );
}

function EmptyDescription(props: ComponentProps<"p">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="empty-description"
      class={cn(
        "cn-empty-description text-muted-foreground [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        props.class
      )}
      {...rest}
    />
  );
}

function EmptyContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="empty-content"
      class={cn(
        "cn-empty-content flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};
