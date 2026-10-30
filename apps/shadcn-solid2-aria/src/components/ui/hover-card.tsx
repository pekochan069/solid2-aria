/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/hover-card.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Popover as PopoverPrimitive,
  PreviewTrigger as PreviewTriggerPrimitive,
} from "@solid2-aria/components";
import type {
  PopoverProps as PopoverPrimitiveProps,
  PreviewTriggerProps,
} from "@solid2-aria/components";
import { cn } from "cn";
import { merge, omit } from "solid-js";

function HoverCardTrigger(props: PreviewTriggerProps) {
  const rest = omit(props, "children");

  return (
    <PreviewTriggerPrimitive data-slot="hover-card-trigger" {...rest}>
      {props.children}
    </PreviewTriggerPrimitive>
  );
}

function HoverCard(
  props: Omit<PopoverPrimitiveProps, "class"> & {
    class?: string;
  }
) {
  const merged = merge(
    {
      crossOffset: 0,
      offset: 4,
      placement: "bottom",
      shouldSkipAnimation: false,
    } as const,
    props
  );

  const rest = omit(merged, "class", "placement", "offset", "crossOffset");

  return (
    <PopoverPrimitive
      data-slot="hover-card-content"
      placement={merged.placement}
      offset={merged.offset}
      crossOffset={merged.crossOffset}
      class={cn(
        "data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 data-exiting:zoom-out-95 data-entering:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground z-50 w-64 origin-(--trigger-anchor-point) rounded-lg p-2.5 text-sm shadow-md ring-1 outline-hidden duration-100",
        merged.class
      )}
      {...rest}
    />
  );
}

export { HoverCard, HoverCardTrigger };
