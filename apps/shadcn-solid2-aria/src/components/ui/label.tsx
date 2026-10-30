/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/label.tsx.
 * Modified for Solid Aria: Solid boolean data selectors, Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
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
          "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled]:pointer-events-none group-data-[disabled]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-disabled:opacity-50",
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
