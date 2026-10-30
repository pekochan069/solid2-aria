/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-11/components/app-sidebar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { FolderIcon, ChevronRightIcon, FileIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { omit, For } from "solid-js";

import {
  Collapsible,
  CollapsibleContent,
} from "../../../registry/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "../../../registry/ui/sidebar";

// This is sample data.
const data = {
  changes: [
    {
      file: "README.md",
      state: "M",
    },
    {
      file: "api/hello/route.ts",
      state: "U",
    },
    {
      file: "app/layout.tsx",
      state: "M",
    },
  ],
  tree: [
    [
      "app",
      [
        "api",
        ["hello", ["route.ts"]],
        "page.tsx",
        "layout.tsx",
        ["blog", ["page.tsx"]],
      ],
    ],
    [
      "components",
      ["ui", "button.tsx", "card.tsx"],
      "header.tsx",
      "footer.tsx",
    ],
    ["lib", ["util.ts"]],
    ["public", "favicon.ico", "vercel.svg"],
    ".eslintrc.json",
    ".gitignore",
    "next.config.js",
    "tailwind.config.js",
    "package.json",
    "README.md",
  ],
};

export function AppSidebar(componentProps: ComponentProps<typeof Sidebar>) {
  const props = omit(componentProps);

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Changes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {
                <For each={data.changes}>
                  {(item, _index) => (
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FileIcon />
                        {item.file}
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{item.state}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  )}
                </For>
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {
                <For each={data.tree}>
                  {(item, _index) => <Tree item={item} />}
                </For>
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

type TreeItem = string | TreeItem[];

function Tree(componentProps: { item: TreeItem }) {
  const entries = () =>
    Array.isArray(componentProps.item)
      ? componentProps.item
      : [componentProps.item];

  const name = () => entries()[0];
  const items = () => entries().slice(1);

  return (
    <>
      {items().length ? (
        <SidebarMenuItem>
          <Collapsible
            class="group/collapsible [&[data-expanded]>button>svg:first-child]:rotate-90"
            defaultExpanded={name() === "components" || name() === "ui"}
          >
            <SidebarMenuButton slot="trigger">
              <ChevronRightIcon class="transition-transform" />
              <FolderIcon />
              {name()}
            </SidebarMenuButton>
            <CollapsibleContent>
              <SidebarMenuSub>
                {
                  <For each={items()}>
                    {(subItem, _index) => <Tree item={subItem} />}
                  </For>
                }
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      ) : (
        <SidebarMenuButton
          isActive={name() === "button.tsx"}
          class="data-[active=true]:bg-transparent"
        >
          <FileIcon />
          {name()}
        </SidebarMenuButton>
      )}
    </>
  );
}

export default AppSidebar;
