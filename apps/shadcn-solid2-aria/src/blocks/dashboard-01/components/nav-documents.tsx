/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/dashboard-01/components/nav-documents.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MoreHorizontalIcon, ShareIcon, FolderIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
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

export function NavDocuments(componentProps: {
  items: {
    name: string;
    url: string;
    icon: JSX.Element;
  }[];
}) {
  const sidebar = useSidebar();

  return (
    <SidebarGroup class="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {
          <For each={componentProps.items}>
            {(item) => (
              <SidebarMenuItem>
                <SidebarMenuButton href={item.url}>
                  {item.icon}
                  <span>{item.name}</span>
                </SidebarMenuButton>

                <DropdownMenuTrigger>
                  <SidebarMenuAction showOnHover class="aria-expanded:bg-muted">
                    <MoreHorizontalIcon />
                    <span class="sr-only">More</span>
                  </SidebarMenuAction>
                  <DropdownMenu
                    class="w-24"
                    placement={sidebar.isMobile ? "bottom end" : "right top"}
                  >
                    <DropdownMenuItem>
                      <FolderIcon />
                      <span>Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShareIcon />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <IconPlaceholder
                        lucide="Trash2Icon"
                        tabler="IconTrash"
                        hugeicons="Delete02Icon"
                        phosphor="TrashIcon"
                        remixicon="RiDeleteBinLine"
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
            <MoreHorizontalIcon class="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavDocuments;
