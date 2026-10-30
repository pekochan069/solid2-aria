/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/context-menu-radio.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Pressable } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../registry/ui/context-menu";

export function ContextMenuRadio() {
  const [user, setUser] = createSignal("pedro");
  const [theme, setTheme] = createSignal("light");

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
          selectionMode="single"
          selectedKeys={[user()]}
          onSelectionChange={(keys) => {
            setUser(
              keys === "all"
                ? "pedro"
                : String(keys.values().next().value ?? "")
            );
          }}
        >
          <ContextMenuLabel>People</ContextMenuLabel>
          <ContextMenuItem id="pedro">Pedro Duarte</ContextMenuItem>
          <ContextMenuItem id="colm">Colm Tuite</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup
          selectionMode="single"
          selectedKeys={[theme()]}
          onSelectionChange={(keys) => {
            setTheme(
              keys === "all"
                ? "system"
                : String(keys.values().next().value ?? "")
            );
          }}
        >
          <ContextMenuLabel>Theme</ContextMenuLabel>
          <ContextMenuItem id="light">Light</ContextMenuItem>
          <ContextMenuItem id="dark">Dark</ContextMenuItem>
          <ContextMenuItem id="system">System</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenu>
    </ContextMenuTrigger>
  );
}

export default ContextMenuRadio;
