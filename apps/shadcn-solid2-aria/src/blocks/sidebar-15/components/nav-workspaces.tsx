/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-15/components/nav-workspaces.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { MoreHorizontalIcon, PlusIcon, ChevronRightIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import {
  Collapsible,
  CollapsibleContent,
} from "../../../registry/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../../registry/ui/sidebar";

export function NavWorkspaces(componentProps: {
  workspaces: {
    name: string;
    emoji: JSX.Element;
    pages: {
      name: string;
      emoji: JSX.Element;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            <For each={componentProps.workspaces}>
              {(workspace) => (
                <Collapsible>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="#">
                      <span>{workspace.emoji}</span>
                      <span>{workspace.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      slot="trigger"
                      class="bg-sidebar-accent text-sidebar-accent-foreground left-2 data-open:rotate-90"
                      showOnHover
                    >
                      <ChevronRightIcon />
                    </SidebarMenuAction>
                    <SidebarMenuAction showOnHover>
                      <PlusIcon />
                    </SidebarMenuAction>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {
                          <For each={workspace.pages}>
                            {(page) => (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton href="#">
                                  <span>{page.emoji}</span>
                                  <span>{page.name}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </For>
                        }
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default NavWorkspaces;
