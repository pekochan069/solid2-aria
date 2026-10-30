/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/textarea.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  composeRenderProps,
  TextArea as TextareaPrimitive,
} from "@solid2-aria/components";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

function Textarea(props: ComponentProps<typeof TextareaPrimitive>) {
  const rest = omit(props, "class");

  return (
    <TextareaPrimitive
      data-slot="textarea"
      class={composeRenderProps(props.class, (classValue) =>
        cn(
          "cn-textarea placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
          classValue
        )
      )}
      {...rest}
    />
  );
}

export { Textarea };
