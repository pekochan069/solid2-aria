/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/popover.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  DialogTrigger,
  Heading,
  Popover as PopoverPrimitive,
} from "@solid2-aria/components";
import type {
  DialogTriggerProps,
  PopoverProps as PopoverPrimitiveProps,
} from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

function PopoverTrigger(props: DialogTriggerProps) {
  const rest = omit(props, "children");

  return (
    <DialogTrigger data-slot="popover-trigger" {...rest}>
      {props.children}
    </DialogTrigger>
  );
}

function Popover(
  props: Omit<PopoverPrimitiveProps, "class"> & {
    class?: string;
  }
) {
  const merged = merge(
    { crossOffset: 0, offset: 4, placement: "bottom" } as const,
    props
  );

  const rest = omit(merged, "class", "placement", "offset", "crossOffset");

  return (
    <PopoverPrimitive
      data-slot="popover-content"
      placement={merged.placement}
      offset={merged.offset}
      crossOffset={merged.crossOffset}
      class={cn(
        "cn-popover-content-aria z-50 w-72 origin-(--trigger-anchor-point) outline-hidden",
        merged.class
      )}
      {...rest}
    />
  );
}

function PopoverHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="popover-header"
      class={cn("cn-popover-header", props.class)}
      {...rest}
    />
  );
}

function PopoverTitle(props: ComponentProps<typeof Heading>) {
  const rest = omit(props, "class");

  return (
    <Heading
      data-slot="popover-title"
      class={cn("cn-popover-title", props.class)}
      {...rest}
    />
  );
}

function PopoverDescription(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="popover-description"
      class={cn("cn-popover-description", props.class)}
      {...rest}
    />
  );
}

export {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
