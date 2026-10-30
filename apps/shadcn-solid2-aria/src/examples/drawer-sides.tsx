/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/drawer-sides.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { DrawerDirection } from "@solid2-aria/vaul";
import { For } from "solid-js";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../registry/ui/drawer";

export function DrawerWithSides() {
  return (
    <div class="flex flex-wrap justify-center gap-2">
      <For
        each={["top", "right", "bottom", "left"] satisfies DrawerDirection[]}
      >
        {(direction) => (
          <Drawer direction={direction} showSwipeHandle>
            <DrawerTrigger variant="secondary">
              Open {direction} drawer
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Move Goal</DrawerTitle>
                <DrawerDescription>
                  Set your daily activity goal.
                </DrawerDescription>
              </DrawerHeader>
              <div class="min-h-32 flex-1 p-4">
                <div class="bg-muted size-full rounded-2xl" />
              </div>
              <DrawerFooter>
                <DrawerClose>Close</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </For>
    </div>
  );
}

export default DrawerWithSides;
