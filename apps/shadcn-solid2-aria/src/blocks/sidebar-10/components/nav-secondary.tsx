/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-10/components/nav-secondary.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { ComponentProps, JSX } from "@solidjs/web";
import { omit, For } from "solid-js";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../registry/ui/sidebar";

export function NavSecondary(
  componentProps: {
    items: {
      title: string;
      url: string;
      icon: JSX.Element;
      badge?: JSX.Element;
    }[];
  } & ComponentProps<typeof SidebarGroup>
) {
  const props = omit(componentProps, "items");

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            <For each={componentProps.items}>
              {(item) => (
                <SidebarMenuItem>
                  <SidebarMenuButton href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {Boolean(item.badge) && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              )}
            </For>
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default NavSecondary;
