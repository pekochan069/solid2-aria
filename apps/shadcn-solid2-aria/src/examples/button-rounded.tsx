/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/button-rounded.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ArrowUpIcon } from "@lucide/solid";

import { Button } from "../registry/ui/button";

export default function ButtonRounded() {
  return (
    <div class="flex gap-2">
      <Button class="rounded-full">Get Started</Button>
      <Button variant="outline" size="icon" class="rounded-full">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}
