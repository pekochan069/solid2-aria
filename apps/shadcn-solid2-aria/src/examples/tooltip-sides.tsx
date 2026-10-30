/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/tooltip-sides.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../registry/ui/button";
import { Tooltip, TooltipTrigger } from "../registry/ui/tooltip";

export function TooltipSides() {
  return (
    <div class="flex flex-wrap gap-2">
      {
        <For each={["left", "top", "bottom", "right"] as const}>
          {(side) => (
            <TooltipTrigger>
              <Button variant="outline" class="w-fit capitalize">
                {side}
              </Button>
              <Tooltip placement={side}>
                <p>Add to library</p>
              </Tooltip>
            </TooltipTrigger>
          )}
        </For>
      }
    </div>
  );
}

export default TooltipSides;
