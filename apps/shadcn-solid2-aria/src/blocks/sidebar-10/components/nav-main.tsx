/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-10/components/nav-main.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../registry/ui/sidebar";

export function NavMain(componentProps: {
  items: {
    title: string;
    url: string;
    icon: JSX.Element;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarMenu>
      {
        <For each={componentProps.items}>
          {(item) => (
            <SidebarMenuItem>
              <SidebarMenuButton href={item.url} isActive={item.isActive}>
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </For>
      }
    </SidebarMenu>
  );
}

export default NavMain;
