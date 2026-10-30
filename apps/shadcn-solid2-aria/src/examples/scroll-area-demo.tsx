/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/scroll-area-demo.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { ScrollArea } from "../registry/ui/scroll-area";
import { Separator } from "../registry/ui/separator";
import { Fragment } from "./_support";

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

export function ScrollAreaDemo() {
  return (
    <ScrollArea class="h-72 w-48 rounded-md border">
      <div class="p-4">
        <h4 class="mb-4 text-sm leading-none font-medium">Tags</h4>
        {
          <For each={tags}>
            {(tag) => (
              <Fragment>
                <div class="text-sm">{tag}</div>
                <Separator class="my-2" />
              </Fragment>
            )}
          </For>
        }
      </div>
    </ScrollArea>
  );
}

export default ScrollAreaDemo;
