/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/toggle-group.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  ToggleButtonGroup as ToggleGroupPrimitive,
  ToggleButton as TogglePrimitive,
} from "@solid2-aria/components";
import type {
  ToggleButtonGroupProps,
  ToggleButtonProps,
} from "@solid2-aria/components";
import type { JSX } from "@solidjs/web";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { merge, omit, useContext, createContext } from "solid-js";

import { toggleVariants } from "./toggle";

const ToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  orientation: "horizontal",
  size: "default",
  spacing: 2,
  variant: "default",
});

function ToggleGroup(
  props: Omit<ToggleButtonGroupProps, "children"> &
    VariantProps<typeof toggleVariants> & {
      spacing?: number;
      orientation?: "horizontal" | "vertical";
      children?: JSX.Element;
    }
) {
  const merged = merge(
    { orientation: "horizontal", spacing: 2 } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "variant",
    "size",
    "spacing",
    "orientation",
    "children"
  );

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={merged.variant}
      data-size={merged.size}
      data-spacing={merged.spacing}
      orientation={merged.orientation}
      style={{ "--gap": `calc(var(--spacing) * ${merged.spacing})` }}
      class={cn(
        "cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-(--gap) data-vertical:flex-col data-vertical:items-stretch",
        merged.class
      )}
      {...rest}
    >
      <ToggleGroupContext value={merged}>{merged.children}</ToggleGroupContext>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem(
  props: ToggleButtonProps & VariantProps<typeof toggleVariants>
) {
  const merged = merge({ size: "default", variant: "default" } as const, props);

  const rest = omit(merged, "class", "children", "variant", "size");
  const context = useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant ?? merged.variant}
      data-size={context.size ?? merged.size}
      data-spacing={context.spacing}
      class={cn(
        "cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          size: context.size ?? merged.size,
          variant: context.variant ?? merged.variant,
        }),
        merged.class
      )}
      {...rest}
    >
      {merged.children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
