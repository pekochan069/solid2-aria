/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/switch.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
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
        "data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 data-[selected]:bg-primary not-data-[selected]:bg-input data-focus-visible:border-ring data-focus-visible:ring-ring/50 dark:not-data-[selected]:bg-input/80 data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 data-invalid:border-destructive dark:data-invalid:border-destructive/50 peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 aria-invalid:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:ring-3 data-invalid:ring-3 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        merged.class
      )}
      {...rest}
    >
      {composeRenderProps(merged.children, (children, renderProps0) => (
        <>
          <span
            data-slot="switch-thumb"
            data-selected={renderProps0.isSelected || undefined}
            class="bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground dark:not-data-[selected]:bg-foreground dark:data-[selected]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=default]/switch:not-data-[selected]:translate-x-0 group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:not-data-[selected]:translate-x-0 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 group-data-[size=default]/switch:data-[selected]:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-[selected]:translate-x-[calc(100%-2px)]"
          />
          {children}
        </>
      ))}
    </SwitchPrimitive>
  );
}

export { Switch };
