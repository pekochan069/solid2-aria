/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/dropdown-menu-checkboxes-icons.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { BellIcon, MailIcon, MessageSquareIcon } from "@lucide/solid";
import type { Selection } from "@solid2-aria/components";
import { createSignal } from "solid-js";

import { Button } from "../registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../registry/ui/dropdown-menu";

export function DropdownMenuCheckboxesIcons() {
  const [notifications, setNotifications] = createSignal<Selection>(
    new Set(["email", "push"])
  );

  return (
    <DropdownMenuTrigger>
      <Button variant="outline">Notifications</Button>
      <DropdownMenu class="w-48">
        <DropdownMenuGroup
          selectionMode="multiple"
          selectedKeys={notifications()}
          onSelectionChange={(value) => {
            setNotifications(value);
          }}
        >
          <DropdownMenuLabel>Notification Preferences</DropdownMenuLabel>
          <DropdownMenuItem id="email">
            <MailIcon />
            Email notifications
          </DropdownMenuItem>
          <DropdownMenuItem id="sms">
            <MessageSquareIcon />
            SMS notifications
          </DropdownMenuItem>
          <DropdownMenuItem id="push">
            <BellIcon />
            Push notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

export default DropdownMenuCheckboxesIcons;
