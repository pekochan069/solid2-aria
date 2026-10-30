/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/dashboard-01/components/app-sidebar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  CommandIcon,
  FileIcon,
  FileChartColumnIcon,
  DatabaseIcon,
  SearchIcon,
  CircleHelpIcon,
  FileTextIcon,
  CameraIcon,
  UsersIcon,
  FolderIcon,
  ChartBarIcon,
  ListIcon,
  LayoutDashboardIcon,
} from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { omit } from "solid-js";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../registry/ui/sidebar";
import { IconPlaceholder } from "../../_icons";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

export function AppSidebar(componentProps: ComponentProps<typeof Sidebar>) {
  const data = {
    documents: [
      {
        icon: <DatabaseIcon />,
        name: "Data Library",
        url: "#",
      },
      {
        icon: <FileChartColumnIcon />,
        name: "Reports",
        url: "#",
      },
      {
        icon: <FileIcon />,
        name: "Word Assistant",
        url: "#",
      },
    ],
    navClouds: [
      {
        icon: <CameraIcon />,
        isActive: true,
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
        title: "Capture",
        url: "#",
      },
      {
        icon: <FileTextIcon />,
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
        title: "Proposal",
        url: "#",
      },
      {
        icon: <FileTextIcon />,
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
        title: "Prompts",
        url: "#",
      },
    ],
    navMain: [
      {
        icon: <LayoutDashboardIcon />,
        title: "Dashboard",
        url: "#",
      },
      {
        icon: <ListIcon />,
        title: "Lifecycle",
        url: "#",
      },
      {
        icon: <ChartBarIcon />,
        title: "Analytics",
        url: "#",
      },
      {
        icon: <FolderIcon />,
        title: "Projects",
        url: "#",
      },
      {
        icon: <UsersIcon />,
        title: "Team",
        url: "#",
      },
    ],
    navSecondary: [
      {
        icon: (
          <IconPlaceholder
            lucide="Settings2Icon"
            tabler="IconSettings"
            hugeicons="Settings05Icon"
            phosphor="GearIcon"
            remixicon="RiSettingsLine"
          />
        ),
        title: "Settings",
        url: "#",
      },
      {
        icon: <CircleHelpIcon />,
        title: "Get Help",
        url: "#",
      },
      {
        icon: <SearchIcon />,
        title: "Search",
        url: "#",
      },
    ],
    user: {
      avatar: "/avatars/shadcn.jpg",
      email: "m@example.com",
      name: "shadcn",
    },
  };

  const props = omit(componentProps);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="#"
              class="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <CommandIcon class="size-5!" />
              <span class="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} class="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
