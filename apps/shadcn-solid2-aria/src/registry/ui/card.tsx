/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/card.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

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
      class={cn("cn-card group/card flex flex-col", merged.class)}
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
        "cn-card-header group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
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
      class={cn("cn-card-title cn-font-heading", props.class)}
      {...rest}
    />
  );
}

function CardDescription(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-description"
      class={cn("cn-card-description", props.class)}
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
        "cn-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end",
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
      class={cn("cn-card-content", props.class)}
      {...rest}
    />
  );
}

function CardFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="card-footer"
      class={cn("cn-card-footer flex items-center", props.class)}
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
