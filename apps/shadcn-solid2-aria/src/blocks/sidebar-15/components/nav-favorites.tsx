/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-15/components/nav-favorites.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  MoreHorizontalIcon,
  ArrowUpRightIcon,
  LinkIcon,
  StarOffIcon,
} from "@lucide/solid";
import { For } from "solid-js";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../../registry/ui/sidebar";
import { IconPlaceholder } from "../../_icons";

export function NavFavorites(componentProps: {
  favorites: {
    name: string;
    url: string;
    emoji: string;
  }[];
}) {
  const sidebar = useSidebar();

  return (
    <SidebarGroup class="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {
          <For each={componentProps.favorites}>
            {(item) => (
              <SidebarMenuItem>
                <SidebarMenuButton href={item.url} tooltip={item.name}>
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </SidebarMenuButton>

                <DropdownMenuTrigger>
                  <SidebarMenuAction showOnHover class="aria-expanded:bg-muted">
                    <MoreHorizontalIcon />
                    <span class="sr-only">More</span>
                  </SidebarMenuAction>
                  <DropdownMenu
                    class="w-56 rounded-lg"
                    placement={sidebar.isMobile ? "bottom end" : "right top"}
                  >
                    <DropdownMenuItem>
                      <StarOffIcon class="text-muted-foreground" />
                      <span>Remove from Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LinkIcon class="text-muted-foreground" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowUpRightIcon class="text-muted-foreground" />
                      <span>Open in New Tab</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <IconPlaceholder
                        lucide="Trash2Icon"
                        tabler="IconTrash"
                        hugeicons="Delete02Icon"
                        phosphor="TrashIcon"
                        remixicon="RiDeleteBinLine"
                        class="text-muted-foreground"
                      />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </SidebarMenuItem>
            )}
          </For>
        }
        <SidebarMenuItem>
          <SidebarMenuButton class="text-sidebar-foreground/70">
            <MoreHorizontalIcon />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavFavorites;
