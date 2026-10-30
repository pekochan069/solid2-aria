/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/dashboard-01/components/nav-main.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MailIcon, CirclePlusIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { Button } from "../../../registry/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../registry/ui/sidebar";

export function NavMain(componentProps: {
  items: {
    title: string;
    url: string;
    icon?: JSX.Element;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent class="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem class="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              class="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <CirclePlusIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              class="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon />
              <span class="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {
            <For each={componentProps.items}>
              {(item) => (
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </For>
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default NavMain;
