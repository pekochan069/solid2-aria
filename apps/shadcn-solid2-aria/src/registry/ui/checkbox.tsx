/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/checkbox.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Checkbox as CheckboxPrimitive,
  composeRenderProps,
} from "@solid2-aria/components";
import type { CheckboxProps } from "@solid2-aria/components";
import { cn } from "cn";
import { omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";

function Checkbox(props: CheckboxProps) {
  const rest = omit(props, "class", "children");

  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      class={composeRenderProps(props.class, (className) =>
        cn(
          "cn-checkbox cn-checkbox-aria peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className
        )
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps0) => (
        <>
          <span
            data-slot="checkbox-indicator"
            class="cn-checkbox-indicator grid place-content-center text-current transition-none"
          >
            {(renderProps0.isSelected || renderProps0.isIndeterminate) && (
              <IconPlaceholder
                lucide="CheckIcon"
                tabler="IconCheck"
                hugeicons="Tick02Icon"
                phosphor="CheckIcon"
                remixicon="RiCheckLine"
              />
            )}
          </span>
          {children}
        </>
      ))}
    </CheckboxPrimitive>
  );
}

export { Checkbox };
