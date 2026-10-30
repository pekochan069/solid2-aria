/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/context-menu-checkboxes.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Pressable } from "@solid2-aria/components";
import type { Selection } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../registry/ui/context-menu";

export function ContextMenuCheckboxes() {
  const [selectedKeys, setSelectedKeys] = createSignal<Selection>(
    new Set(["bookmarks-bar", "developer-tools"])
  );

  return (
    <ContextMenuTrigger>
      <Pressable>
        <div
          role="button"
          class="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm"
        >
          <span class="hidden pointer-fine:inline-block">Right click here</span>
          <span class="hidden pointer-coarse:inline-block">
            Long press here
          </span>
        </div>
      </Pressable>
      <ContextMenu>
        <ContextMenuGroup
          selectionMode="multiple"
          selectedKeys={selectedKeys()}
          onSelectionChange={(value) => {
            setSelectedKeys(value);
          }}
        >
          <ContextMenuItem id="bookmarks-bar">
            Show Bookmarks Bar
          </ContextMenuItem>
          <ContextMenuItem>Show Full URLs</ContextMenuItem>
          <ContextMenuItem id="developer-tools">
            Show Developer Tools
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenu>
    </ContextMenuTrigger>
  );
}

export default ContextMenuCheckboxes;
