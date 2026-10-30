/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(root)/cards/payments.tsx.
 * Modified for Solid Aria: Solid 2 JSX, local documentation links, native breadcrumbs, and upstream Hugeicons SVGs.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import Calendar03Icon from "@hugeicons/core-free-icons/Calendar03Icon";
import MoreHorizontalCircle01Icon from "@hugeicons/core-free-icons/MoreHorizontalCircle01Icon";
import RefreshIcon from "@hugeicons/core-free-icons/RefreshIcon";
import Settings01Icon from "@hugeicons/core-free-icons/Settings01Icon";
import { For } from "solid-js";

import { Button } from "../../registry/ui/button";
import { Card, CardContent, CardHeader } from "../../registry/ui/card";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../registry/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemGroup,
} from "../../registry/ui/item";
import { HugeIcon } from "../huge-icon";

const payments = [
  {
    description: "Adjust how much you can send from your balance.",
    href: "/docs/components/input",
    icon: Settings01Icon,
    title: "Change transfer limit",
  },
  {
    description: "Set up a transfer to send at a later date.",
    href: "/docs/components/calendar",
    icon: Calendar03Icon,
    title: "Scheduled transfers",
  },
  {
    description: "Manage your repeated card transactions.",
    href: "/docs/components/item",
    icon: RefreshIcon,
    title: "Recurring card payments",
  },
];

export function Payments() {
  return (
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3 text-sm">
          <span class="text-muted-foreground">Home</span>
          <HugeIcon icon={ArrowRight01Icon} size={14} />
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon-sm" aria-label="Account options">
              <HugeIcon icon={MoreHorizontalCircle01Icon} size={16} />
            </Button>
            <DropdownMenu placement="bottom start">
              <DropdownMenuGroup>
                <DropdownMenuItem id="profile">Profile</DropdownMenuItem>
                <DropdownMenuItem id="billing">Billing</DropdownMenuItem>
                <DropdownMenuItem id="settings">Settings</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
          <HugeIcon icon={ArrowRight01Icon} size={14} />
          <span>Payments</span>
        </div>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <For each={payments}>
            {(item) => (
              <Item variant="muted" href={item.href}>
                <ItemMedia variant="icon">
                  <HugeIcon icon={item.icon} size={20} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.description}</ItemDescription>
                </ItemContent>
                <HugeIcon icon={ArrowRight01Icon} size={16} />
              </Item>
            )}
          </For>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
