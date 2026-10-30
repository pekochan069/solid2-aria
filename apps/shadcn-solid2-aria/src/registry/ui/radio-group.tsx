/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/radio-group.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  composeRenderProps,
  RadioGroup as RadioGroupPrimitive,
  Radio as RadioPrimitive,
} from "@solid2-aria/components";
import type { RadioGroupProps, RadioProps } from "@solid2-aria/components";
import { cn } from "cn";
import { omit } from "solid-js";

function RadioGroup(props: RadioGroupProps) {
  const rest = omit(props, "class");

  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      class={cn("cn-radio-group w-full", props.class)}
      {...rest}
    />
  );
}

function RadioGroupItem(props: RadioProps) {
  const rest = omit(props, "class", "children");

  return (
    <RadioPrimitive
      data-slot="radio-group-item"
      class={cn(
        "cn-radio-group-item cn-radio-group-item-aria group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps0) => (
        <>
          <span
            data-slot="radio-group-indicator"
            class="cn-radio-group-indicator"
          >
            {renderProps0.isSelected && (
              <span class="cn-radio-group-indicator-icon" />
            )}
          </span>
          {children}
        </>
      ))}
    </RadioPrimitive>
  );
}

export { RadioGroup, RadioGroupItem };
