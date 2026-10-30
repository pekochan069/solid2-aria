/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/label.tsx.
 * Modified for Solid Aria: Solid boolean data selectors, Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { LabelContext, Label as LabelPrimitive } from "@solid2-aria/components";
import type { LabelProps } from "@solid2-aria/components";
import { cn } from "cn";
import { omit, useContext } from "solid-js";

function Label(props: LabelProps) {
  const rest = omit(props, "class", "for", "slot");
  const context = useContext(LabelContext);

  return (
    <LabelContext
      value={Boolean(props.for) && props.slot === undefined ? null : context}
    >
      <LabelPrimitive
        data-slot="label"
        class={cn(
          "cn-label cn-label-aria flex items-center select-none group-data-[disabled]:pointer-events-none peer-disabled:cursor-not-allowed",
          props.class
        )}
        {...rest}
        for={props.for}
        slot={props.slot}
      />
    </LabelContext>
  );
}

export { Label };
