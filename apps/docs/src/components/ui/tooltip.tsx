/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/tooltip.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  OverlayArrow,
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

function TooltipTrigger(props: ComponentProps<typeof TooltipTriggerPrimitive>) {
  const merged = merge({ delay: 0 }, props);

  return <TooltipTriggerPrimitive data-slot="tooltip-trigger" {...merged} />;
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
        "data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 bg-foreground text-background z-50 inline-flex w-fit max-w-xs origin-(--trigger-anchor-point) items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
        merged.class
      )}
      {...rest}
    >
      {merged.children}
      <OverlayArrow
        class="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]"
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
