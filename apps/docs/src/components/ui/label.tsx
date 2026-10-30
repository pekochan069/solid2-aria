/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/label.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { LabelContext, Label as LabelPrimitive } from "@solid2-aria/components";
import type { LabelProps } from "@solid2-aria/components";
import { omit, useContext } from "solid-js";

import { cn } from "#lib/cn";

function Label(props: LabelProps) {
  const context = useContext(LabelContext);
  const rest = omit(props, "class", "for", "slot");

  const label = (
    <LabelPrimitive
      data-slot="label"
      class={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-disabled:opacity-50",
        props.class
      )}
      {...rest}
      for={props.for}
      slot={props.slot}
    />
  );

  return (
    <LabelContext
      value={
        props.for !== undefined && props.for !== "" && props.slot === undefined
          ? null
          : context
      }
    >
      {label}
    </LabelContext>
  );
}

export { Label };
