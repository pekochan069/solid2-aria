/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-16/components/nav-main.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronRightIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import {
  Collapsible,
  CollapsibleContent,
} from "../../../registry/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../../registry/ui/sidebar";

export function NavMain(componentProps: {
  items: {
    title: string;
    url: string;
    icon: JSX.Element;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {
          <For each={componentProps.items}>
            {(item) => (
              <Collapsible
                defaultExpanded={item.isActive}
                render={(props) => <SidebarMenuItem {...props} />}
              >
                <SidebarMenuButton href={item.url} tooltip={item.title}>
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {(item.items?.length ?? 0) === 0 ? null : (
                  <>
                    <SidebarMenuAction
                      slot="trigger"
                      class="aria-expanded:rotate-90"
                    >
                      <ChevronRightIcon />
                      <span class="sr-only">Toggle</span>
                    </SidebarMenuAction>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {
                          <For each={item.items}>
                            {(subItem) => (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </For>
                        }
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                )}
              </Collapsible>
            )}
          </For>
        }
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
