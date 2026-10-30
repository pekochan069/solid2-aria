/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/spinner-custom.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { LoaderIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

function Spinner(componentProps: ComponentProps<typeof LoaderIcon>) {
  const props = omit(componentProps, "class");

  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      class={cn("size-4 animate-spin", componentProps.class)}
      {...props}
    />
  );
}

export function SpinnerCustom() {
  return (
    <div class="flex items-center gap-4">
      <Spinner />
    </div>
  );
}

export default SpinnerCustom;
