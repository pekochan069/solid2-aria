/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/popover.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
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
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

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
        "bg-popover text-popover-foreground data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 data-exiting:zoom-out-95 data-entering:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 ring-foreground/10 z-50 flex w-72 origin-(--trigger-anchor-point) flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 outline-hidden duration-100",
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
      class={cn("flex flex-col gap-0.5 text-sm", props.class)}
      {...rest}
    />
  );
}

function PopoverTitle(props: ComponentProps<typeof Heading>) {
  const rest = omit(props, "class");

  return (
    <Heading
      data-slot="popover-title"
      class={cn("font-medium", props.class)}
      {...rest}
    />
  );
}

function PopoverDescription(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="popover-description"
      class={cn("text-muted-foreground", props.class)}
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
