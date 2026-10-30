/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/drawer-snap-points.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { SnapPoint } from "@solid2-aria/vaul";
import { createSignal } from "solid-js";

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

const SNAP_POINTS = ["496px", 1];

export function DrawerSnapPoints() {
  const [snap, setSnap] = createSignal<SnapPoint | null>(
    SNAP_POINTS[0] ?? null
  );

  return (
    <Drawer
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap()}
      setActiveSnapPoint={(value) => {
        setSnap(value);
      }}
      showSwipeHandle
    >
      <DrawerTrigger variant="outline">Open Snap Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Snap points</DrawerTitle>
          <DrawerDescription>
            Drag the drawer to snap between a compact peek and a near
            full-height view.
          </DrawerDescription>
        </DrawerHeader>
        <div class="flex-1 p-4">
          <div class="bg-muted rounded-2xl group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full" />
        </div>
        <DrawerFooter>
          <DrawerClose>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default DrawerSnapPoints;
