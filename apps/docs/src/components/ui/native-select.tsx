/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/native-select.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

type NativeSelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

function NativeSelect(props: NativeSelectProps) {
  const merged = merge({ size: "default" } as const, props);
  const rest = omit(merged, "class", "size");

  return (
    <div
      class={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        merged.class
      )}
      data-slot="native-select-wrapper"
      data-size={merged.size}
    >
      <select
        data-slot="native-select"
        data-size={merged.size}
        class="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-8 w-full min-w-0 appearance-none rounded-lg border bg-transparent py-1 pr-8 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:ring-3 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-[size=sm]:py-0.5"
        {...rest}
      />
      <ChevronDownIcon
        class="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption(props: ComponentProps<"option">) {
  const rest = omit(props, "class");

  return (
    <option
      data-slot="native-select-option"
      class={cn("bg-[Canvas] text-[CanvasText]", props.class)}
      {...rest}
    />
  );
}

function NativeSelectOptGroup(props: ComponentProps<"optgroup">) {
  const rest = omit(props, "class");

  return (
    <optgroup
      data-slot="native-select-optgroup"
      class={cn("bg-[Canvas] text-[CanvasText]", props.class)}
      {...rest}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
