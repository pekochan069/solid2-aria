/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/card.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

function Card(
  props: ComponentProps<"div"> & {
    size?: "default" | "sm";
  }
) {
  const merged = merge({ size: "default" } as const, props);
  const rest = omit(merged, "class", "size");

  return (
    <div
      data-slot="card"
      data-size={merged.size}
      class={cn(
        "ring-foreground/10 bg-card text-card-foreground group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm ring-1 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        merged.class
      )}
      {...rest}
    />
  );
}

function CardHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-header"
      class={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        props.class
      )}
      {...rest}
    />
  );
}

function CardTitle(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-title"
      class={cn(
        "font-[family-name:var(--font-heading,var(--font-sans))] text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        props.class
      )}
      {...rest}
    />
  );
}

function CardDescription(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-description"
      class={cn("text-muted-foreground text-sm", props.class)}
      {...rest}
    />
  );
}

function CardAction(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-action"
      class={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        props.class
      )}
      {...rest}
    />
  );
}

function CardContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-content"
      class={cn("px-(--card-spacing)", props.class)}
      {...rest}
    />
  );
}

function CardFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-footer"
      class={cn(
        "bg-muted/50 flex items-center rounded-b-xl border-t p-(--card-spacing)",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
