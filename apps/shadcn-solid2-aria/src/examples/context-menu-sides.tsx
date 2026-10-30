/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/context-menu-sides.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Pressable } from "@solid2-aria/components";

import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../registry/ui/context-menu";

export function ContextMenuSides() {
  return (
    <div class="grid w-full max-w-sm grid-cols-2 gap-4">
      <ContextMenuTrigger>
        <Pressable>
          <div
            role="button"
            class="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm"
          >
            <span class="hidden pointer-fine:inline-block">
              Right click (top)
            </span>
            <span class="hidden pointer-coarse:inline-block">
              Long press (top)
            </span>
          </div>
        </Pressable>
        <ContextMenu placement="top start">
          <ContextMenuGroup>
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem>Forward</ContextMenuItem>
            <ContextMenuItem>Reload</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenu>
      </ContextMenuTrigger>
      <ContextMenuTrigger>
        <Pressable>
          <div
            role="button"
            class="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm"
          >
            <span class="hidden pointer-fine:inline-block">
              Right click (right)
            </span>
            <span class="hidden pointer-coarse:inline-block">
              Long press (right)
            </span>
          </div>
        </Pressable>
        <ContextMenu placement="right top">
          <ContextMenuGroup>
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem>Forward</ContextMenuItem>
            <ContextMenuItem>Reload</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenu>
      </ContextMenuTrigger>
      <ContextMenuTrigger>
        <Pressable>
          <div
            role="button"
            class="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm"
          >
            <span class="hidden pointer-fine:inline-block">
              Right click (bottom)
            </span>
            <span class="hidden pointer-coarse:inline-block">
              Long press (bottom)
            </span>
          </div>
        </Pressable>
        <ContextMenu placement="bottom start">
          <ContextMenuGroup>
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem>Forward</ContextMenuItem>
            <ContextMenuItem>Reload</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenu>
      </ContextMenuTrigger>
      <ContextMenuTrigger>
        <Pressable>
          <div
            role="button"
            class="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm"
          >
            <span class="hidden pointer-fine:inline-block">
              Right click (left)
            </span>
            <span class="hidden pointer-coarse:inline-block">
              Long press (left)
            </span>
          </div>
        </Pressable>
        <ContextMenu placement="left top">
          <ContextMenuGroup>
            <ContextMenuItem>Back</ContextMenuItem>
            <ContextMenuItem>Forward</ContextMenuItem>
            <ContextMenuItem>Reload</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenu>
      </ContextMenuTrigger>
    </div>
  );
}

export default ContextMenuSides;
