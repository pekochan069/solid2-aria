/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/sheet-side.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { For } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../registry/ui/sheet";

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const;

export default function SheetSide() {
  return (
    <div class="flex flex-wrap gap-2">
      {
        <For each={SHEET_SIDES}>
          {(side) => (
            <SheetTrigger>
              <Button variant="outline" class="capitalize">
                {side}
              </Button>
              <Sheet
                side={side}
                class="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
              >
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>
                    Make changes to your profile here. Click save when
                    you&apos;re done.
                  </SheetDescription>
                </SheetHeader>
                <div class="no-scrollbar overflow-y-auto px-4">
                  {
                    <For each={Array.from({ length: 10 })}>
                      {() => (
                        <p class="mb-2 leading-relaxed">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Sed do eiusmod tempor incididunt ut labore et
                          dolore magna aliqua. Ut enim ad minim veniam, quis
                          nostrud exercitation ullamco laboris nisi ut aliquip
                          ex ea commodo consequat. Duis aute irure dolor in
                          reprehenderit in voluptate velit esse cillum dolore eu
                          fugiat nulla pariatur. Excepteur sint occaecat
                          cupidatat non proident, sunt in culpa qui officia
                          deserunt mollit anim id est laborum.
                        </p>
                      )}
                    </For>
                  }
                </div>
                <SheetFooter>
                  <Button type="submit">Save changes</Button>
                  <SheetClose variant="outline">Cancel</SheetClose>
                </SheetFooter>
              </Sheet>
            </SheetTrigger>
          )}
        </For>
      }
    </div>
  );
}
