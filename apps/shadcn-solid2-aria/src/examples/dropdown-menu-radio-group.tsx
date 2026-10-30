/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/dropdown-menu-radio-group.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and exclusive radio selection that cannot be cleared.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";

export function DropdownMenuRadioGroupDemo() {
  const [position, setPosition] = createSignal("bottom");

  return (
    <DropdownMenuTrigger>
      <Button variant="outline">Open</Button>
      <DropdownMenu class="w-32">
        <DropdownMenuGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[position()]}
          onSelectionChange={(keys) => {
            if (keys !== "all") {
              const [key] = keys;

              if (typeof key === "string") {
                setPosition(key);
              }
            }
          }}
        >
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuItem id="top">Top</DropdownMenuItem>
          <DropdownMenuItem id="bottom">Bottom</DropdownMenuItem>
          <DropdownMenuItem id="right">Right</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

export default DropdownMenuRadioGroupDemo;
