/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/checkbox.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon } from "@lucide/solid";
import {
  Checkbox as CheckboxPrimitive,
  composeRenderProps,
} from "@solid2-aria/components";
import type { CheckboxProps } from "@solid2-aria/components";
import { omit } from "solid-js";

import { cn } from "#lib/cn";

function Checkbox(props: CheckboxProps) {
  const rest = omit(props, "class", "children");

  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      class={cn(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary data-selected:bg-primary data-selected:text-primary-foreground dark:data-selected:bg-primary data-selected:border-primary data-focus-visible:border-ring data-focus-visible:ring-ring/50 data-invalid:data-selected:border-primary data-invalid:border-destructive dark:data-invalid:border-destructive/50 data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 aria-invalid:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:ring-3 data-invalid:ring-3",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps0) => (
        <>
          <span
            data-slot="checkbox-indicator"
            class="grid place-content-center text-current transition-none [&>svg]:size-3.5"
          >
            {(renderProps0.isSelected || renderProps0.isIndeterminate) && (
              <CheckIcon />
            )}
          </span>
          {children}
        </>
      ))}
    </CheckboxPrimitive>
  );
}

export { Checkbox };
