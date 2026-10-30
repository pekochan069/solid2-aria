/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/drawer-nested.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Drawer,
  DrawerNestedRoot,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../registry/ui/drawer";
import { useIsMobile } from "./_support";

export function DrawerNested() {
  const isMobile = useIsMobile();

  const direction = () => (isMobile() ? "bottom" : "right");

  return (
    <Drawer showSwipeHandle={isMobile()} direction={direction()}>
      <DrawerTrigger variant="secondary">Open Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer</DrawerTitle>
          <DrawerDescription>
            Open another drawer from the same direction.
          </DrawerDescription>
        </DrawerHeader>
        <div class="flex-1 p-4">
          <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
        </div>
        <DrawerFooter>
          <DrawerNestedRoot
            showSwipeHandle={isMobile()}
            direction={direction()}
          >
            <DrawerTrigger variant="outline">Open Nested Drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Nested Drawer</DrawerTitle>
                <DrawerDescription>
                  The parent drawer stays mounted behind this one.
                </DrawerDescription>
              </DrawerHeader>
              <div class="flex-1 p-4">
                <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
              </div>
              <DrawerFooter>
                <DrawerNestedRoot
                  showSwipeHandle={isMobile()}
                  direction={direction()}
                >
                  <DrawerTrigger variant="outline">
                    Open Third Drawer
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Third Drawer</DrawerTitle>
                      <DrawerDescription>
                        Two drawers are stacked behind this one.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div class="flex-1 p-4">
                      <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
                    </div>
                    <DrawerFooter>
                      <DrawerNestedRoot
                        showSwipeHandle={isMobile()}
                        direction={direction()}
                      >
                        <DrawerTrigger variant="outline">
                          Open Fourth Drawer
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Fourth Drawer</DrawerTitle>
                            <DrawerDescription>
                              This is the frontmost drawer in the stack.
                            </DrawerDescription>
                          </DrawerHeader>
                          <div class="flex-1 p-4">
                            <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
                          </div>
                          <DrawerFooter>
                            <DrawerClose variant="outline">Close</DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </DrawerNestedRoot>
                      <DrawerClose variant="outline">Close</DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </DrawerNestedRoot>
                <DrawerClose variant="outline">Close</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </DrawerNestedRoot>
          <DrawerClose variant="outline">Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default DrawerNested;
