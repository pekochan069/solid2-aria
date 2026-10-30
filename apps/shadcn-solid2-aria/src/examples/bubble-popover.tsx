/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/bubble-popover.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { InfoIcon } from "@lucide/solid";

import { Bubble, BubbleContent, BubbleReactions } from "../registry/ui/bubble";
import { Button } from "../registry/ui/button";
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../registry/ui/popover";

export function BubblePopoverDemo() {
  return (
    <div class="flex w-full max-w-sm flex-col gap-4 py-12">
      <Bubble align="end">
        <BubbleContent>Run the build script.</BubbleContent>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>Failed to run the command.</BubbleContent>
        <BubbleReactions>
          <PopoverTrigger>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Show error details"
              class="aria-expanded:text-destructive"
            >
              <InfoIcon />
            </Button>
            <Popover>
              <PopoverHeader>
                <PopoverTitle class="text-sm">
                  Command failed with exit code 1
                </PopoverTitle>
                <PopoverDescription class="text-sm">
                  ENOENT: no such file or directory, open pnpm-lock.yaml
                </PopoverDescription>
              </PopoverHeader>
            </Popover>
          </PopoverTrigger>
        </BubbleReactions>
      </Bubble>
    </div>
  );
}

export default BubblePopoverDemo;
