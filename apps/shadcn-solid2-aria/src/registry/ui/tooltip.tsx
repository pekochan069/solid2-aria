/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/tooltip.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Focusable,
  OverlayArrow,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

function TooltipTrigger(props: ComponentProps<typeof TooltipTriggerPrimitive>) {
  const merged = merge({ delay: 0 }, props);
  const rest = omit(merged, "children");

  return (
    <TooltipTriggerPrimitive data-slot="tooltip-trigger" {...rest}>
      <Focusable>{merged.children}</Focusable>
    </TooltipTriggerPrimitive>
  );
}

const arrowTransforms = {
  bottom: "translate(-50%, calc(50% + 2px)) rotate(45deg)",
  center: "translate(calc(50% + 2px), -50%) rotate(45deg)",
  left: "translate(calc(-50% - 2px), -50%) rotate(45deg)",
  right: "translate(calc(50% + 2px), -50%) rotate(45deg)",
  top: "translate(-50%, calc(-50% - 2px)) rotate(45deg)",
};

function Tooltip(
  props: Omit<ComponentProps<typeof TooltipPrimitive>, "children" | "class"> & {
    class?: string;
    children?: JSX.Element;
  }
) {
  const merged = merge(
    { crossOffset: 0, offset: 4, placement: "top" } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "placement",
    "offset",
    "crossOffset",
    "children"
  );

  return (
    <TooltipPrimitive
      data-slot="tooltip-content"
      placement={merged.placement}
      offset={merged.offset}
      crossOffset={merged.crossOffset}
      class={cn(
        "cn-tooltip-content-aria bg-foreground text-background z-50 w-fit max-w-xs origin-(--trigger-anchor-point)",
        merged.class
      )}
      {...rest}
    >
      {merged.children}
      <OverlayArrow
        class="cn-tooltip-arrow bg-foreground fill-foreground z-50"
        style={(renderProps0) => ({
          ...renderProps0.defaultStyle,
          rotate: "0deg",
          transform: arrowTransforms[renderProps0.placement ?? "right"],
          translate: "0 0",
        })}
      />
    </TooltipPrimitive>
  );
}

export { Tooltip, TooltipTrigger };
