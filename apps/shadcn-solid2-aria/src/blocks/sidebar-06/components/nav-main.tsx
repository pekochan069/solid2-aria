/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-06/components/nav-main.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MoreHorizontalIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../../registry/ui/sidebar";

export function NavMain(componentProps: {
  items: {
    title: string;
    url: string;
    icon?: JSX.Element;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const sidebar = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {
          <For each={componentProps.items}>
            {(item) => (
              <SidebarMenuItem>
                <DropdownMenuTrigger>
                  <SidebarMenuButton class="aria-expanded:bg-muted">
                    {item.title} <MoreHorizontalIcon class="ml-auto" />
                  </SidebarMenuButton>
                  {(item.items?.length ?? 0) === 0 ? null : (
                    <DropdownMenu
                      placement={sidebar.isMobile ? "bottom end" : "right top"}
                      class="min-w-56 rounded-lg"
                    >
                      {
                        <For each={item.items}>
                          {(itemValue) => (
                            <DropdownMenuItem href={itemValue.url}>
                              {itemValue.title}
                            </DropdownMenuItem>
                          )}
                        </For>
                      }
                    </DropdownMenu>
                  )}
                </DropdownMenuTrigger>
              </SidebarMenuItem>
            )}
          </For>
        }
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
