/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-08/components/nav-projects.tsx.
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

export function NavProjects(componentProps: {
  projects: {
    name: string;
    url: string;
    icon: JSX.Element;
  }[];
}) {
  const sidebar = useSidebar();

  return (
    <SidebarGroup class="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {
          <For each={componentProps.projects}>
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
                    class="w-48"
                    placement={sidebar.isMobile ? "bottom end" : "right top"}
                  >
                    <DropdownMenuItem>
                      <FolderIcon class="text-muted-foreground" />
                      <span>View Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShareIcon class="text-muted-foreground" />
                      <span>Share Project</span>
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
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </SidebarMenuItem>
            )}
          </For>
        }
        <SidebarMenuItem>
          <SidebarMenuButton>
            <MoreHorizontalIcon />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavProjects;
