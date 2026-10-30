/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/switch.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  composeRenderProps,
  Switch as SwitchPrimitive,
} from "@solid2-aria/components";
import type { SwitchProps as SwitchPrimitiveProps } from "@solid2-aria/components";
import { cn } from "cn";
import { merge, omit } from "solid-js";

function Switch(
  props: SwitchPrimitiveProps & {
    size?: "sm" | "default";
  }
) {
  const merged = merge({ size: "default" } as const, props);
  const rest = omit(merged, "class", "size", "children");

  return (
    <SwitchPrimitive
      data-slot="switch"
      data-size={merged.size}
      class={cn(
        "cn-switch cn-switch-aria peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        merged.class
      )}
      {...rest}
    >
      {composeRenderProps(merged.children, (children, renderProps0) => (
        <>
          <span
            data-slot="switch-thumb"
            data-selected={renderProps0.isSelected || undefined}
            class="cn-switch-thumb cn-switch-thumb-aria pointer-events-none block ring-0 transition-transform"
          />
          {children}
        </>
      ))}
    </SwitchPrimitive>
  );
}

export { Switch };
