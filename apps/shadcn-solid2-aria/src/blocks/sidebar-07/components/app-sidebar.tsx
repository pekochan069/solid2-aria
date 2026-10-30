/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-07/components/app-sidebar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  MapIcon,
  PieChartIcon,
  FrameIcon,
  BookOpenIcon,
  BotIcon,
  TerminalSquareIcon,
  TerminalIcon,
  AudioLinesIcon,
  GalleryVerticalEndIcon,
} from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { omit } from "solid-js";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../../../registry/ui/sidebar";
import { IconPlaceholder } from "../../_icons";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.

export function AppSidebar(componentProps: ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        icon: <TerminalSquareIcon />,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
        title: "Playground",
        url: "#",
      },
      {
        icon: <BotIcon />,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
        title: "Models",
        url: "#",
      },
      {
        icon: <BookOpenIcon />,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
        title: "Documentation",
        url: "#",
      },
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
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
        title: "Settings",
        url: "#",
      },
    ],
    projects: [
      {
        icon: <FrameIcon />,
        name: "Design Engineering",
        url: "#",
      },
      {
        icon: <PieChartIcon />,
        name: "Sales & Marketing",
        url: "#",
      },
      {
        icon: <MapIcon />,
        name: "Travel",
        url: "#",
      },
    ],
    teams: [
      {
        logo: <GalleryVerticalEndIcon />,
        name: "Acme Inc",
        plan: "Enterprise",
      },
      {
        logo: <AudioLinesIcon />,
        name: "Acme Corp.",
        plan: "Startup",
      },
      {
        logo: <TerminalIcon />,
        name: "Evil Corp.",
        plan: "Free",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
