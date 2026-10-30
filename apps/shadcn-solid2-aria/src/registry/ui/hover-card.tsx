/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/hover-card.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
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
        "cn-hover-card-content-aria z-50 origin-(--trigger-anchor-point) outline-hidden",
        merged.class
      )}
      {...rest}
    />
  );
}

export { HoverCard, HoverCardTrigger };
