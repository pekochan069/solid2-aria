/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/radio-group.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
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
      class={cn("grid w-full gap-2", props.class)}
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
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary data-[selected]:bg-primary data-[selected]:text-primary-foreground dark:data-[selected]:bg-primary data-[selected]:border-primary data-focus-visible:border-ring data-focus-visible:ring-ring/50 data-invalid:data-[selected]:border-primary data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 dark:data-invalid:border-destructive/50 group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border outline-none group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 aria-invalid:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:ring-3 data-invalid:ring-3",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps0) => (
        <>
          <span
            data-slot="radio-group-indicator"
            class="flex size-4 items-center justify-center"
          >
            {renderProps0.isSelected && (
              <span class="bg-primary-foreground absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            )}
          </span>
          {children}
        </>
      ))}
    </RadioPrimitive>
  );
}

export { RadioGroup, RadioGroupItem };
