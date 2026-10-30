/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-04/components/app-sidebar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { GalleryVerticalEndIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { omit, For } from "solid-js";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../../registry/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
      title: "Getting Started",
      url: "#",
    },
    {
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          isActive: true,
          title: "Data Fetching",
          url: "#",
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
      title: "Build Your Application",
      url: "#",
    },
    {
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
      title: "API Reference",
      url: "#",
    },
    {
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Solid Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
      title: "Architecture",
      url: "#",
    },
    {
      items: [
        {
          title: "Contribution Guide",
          url: "#",
        },
      ],
      title: "Community",
      url: "#",
    },
  ],
};

export function AppSidebar(componentProps: ComponentProps<typeof Sidebar>) {
  const props = omit(componentProps);

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" size="lg">
              <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEndIcon class="size-4" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-medium">Documentation</span>
                <span class="">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu class="gap-2">
            {
              <For each={data.navMain}>
                {(item) => (
                  <SidebarMenuItem>
                    <SidebarMenuButton href={item.url} class="font-medium">
                      {item.title}
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <SidebarMenuSub class="ml-0 border-l-0 px-1.5">
                        {
                          <For each={item.items}>
                            {(itemValue) => (
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  href={itemValue.url}
                                  isActive={itemValue.isActive}
                                >
                                  {itemValue.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </For>
                        }
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                )}
              </For>
            }
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
