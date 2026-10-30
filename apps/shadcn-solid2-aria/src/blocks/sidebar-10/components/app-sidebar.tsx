/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-10/components/app-sidebar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  MessageCircleQuestionIcon,
  BlocksIcon,
  CalendarIcon,
  InboxIcon,
  HomeIcon,
  SparklesIcon,
  SearchIcon,
  TerminalIcon,
  AudioLinesIcon,
} from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { omit } from "solid-js";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "../../../registry/ui/sidebar";
import { IconPlaceholder } from "../../_icons";
import { NavFavorites } from "./nav-favorites";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavWorkspaces } from "./nav-workspaces";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.

export function AppSidebar(componentProps: ComponentProps<typeof Sidebar>) {
  const data = {
    favorites: [
      {
        emoji: "📊",
        name: "Project Management & Task Tracking",
        url: "#",
      },
      {
        emoji: "🍳",
        name: "Family Recipe Collection & Meal Planning",
        url: "#",
      },
      {
        emoji: "💪",
        name: "Fitness Tracker & Workout Routines",
        url: "#",
      },
      {
        emoji: "📚",
        name: "Book Notes & Reading List",
        url: "#",
      },
      {
        emoji: "🌱",
        name: "Sustainable Gardening Tips & Plant Care",
        url: "#",
      },
      {
        emoji: "🗣️",
        name: "Language Learning Progress & Resources",
        url: "#",
      },
      {
        emoji: "🏠",
        name: "Home Renovation Ideas & Budget Tracker",
        url: "#",
      },
      {
        emoji: "💰",
        name: "Personal Finance & Investment Portfolio",
        url: "#",
      },
      {
        emoji: "🎬",
        name: "Movie & TV Show Watchlist with Reviews",
        url: "#",
      },
      {
        emoji: "✅",
        name: "Daily Habit Tracker & Goal Setting",
        url: "#",
      },
    ],
    navMain: [
      {
        icon: <SearchIcon />,
        title: "Search",
        url: "#",
      },
      {
        icon: <SparklesIcon />,
        title: "Ask AI",
        url: "#",
      },
      {
        icon: <HomeIcon />,
        isActive: true,
        title: "Home",
        url: "#",
      },
      {
        badge: "10",
        icon: <InboxIcon />,
        title: "Inbox",
        url: "#",
      },
    ],
    navSecondary: [
      {
        icon: <CalendarIcon />,
        title: "Calendar",
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
        title: "Settings",
        url: "#",
      },
      {
        icon: <BlocksIcon />,
        title: "Templates",
        url: "#",
      },
      {
        icon: (
          <IconPlaceholder
            lucide="Trash2Icon"
            tabler="IconTrash"
            hugeicons="Delete02Icon"
            phosphor="TrashIcon"
            remixicon="RiDeleteBinLine"
          />
        ),
        title: "Trash",
        url: "#",
      },
      {
        icon: <MessageCircleQuestionIcon />,
        title: "Help",
        url: "#",
      },
    ],
    teams: [
      {
        logo: <TerminalIcon />,
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
    workspaces: [
      {
        emoji: "🏠",
        name: "Personal Life Management",
        pages: [
          {
            emoji: "📔",
            name: "Daily Journal & Reflection",
            url: "#",
          },
          {
            emoji: "🍏",
            name: "Health & Wellness Tracker",
            url: "#",
          },
          {
            emoji: "🌟",
            name: "Personal Growth & Learning Goals",
            url: "#",
          },
        ],
      },
      {
        emoji: "💼",
        name: "Professional Development",
        pages: [
          {
            emoji: "🎯",
            name: "Career Objectives & Milestones",
            url: "#",
          },
          {
            emoji: "🧠",
            name: "Skill Acquisition & Training Log",
            url: "#",
          },
          {
            emoji: "🤝",
            name: "Networking Contacts & Events",
            url: "#",
          },
        ],
      },
      {
        emoji: "🎨",
        name: "Creative Projects",
        pages: [
          {
            emoji: "✍️",
            name: "Writing Ideas & Story Outlines",
            url: "#",
          },
          {
            emoji: "🖼️",
            name: "Art & Design Portfolio",
            url: "#",
          },
          {
            emoji: "🎵",
            name: "Music Composition & Practice Log",
            url: "#",
          },
        ],
      },
      {
        emoji: "🏡",
        name: "Home Management",
        pages: [
          {
            emoji: "💰",
            name: "Household Budget & Expense Tracking",
            url: "#",
          },
          {
            emoji: "🔧",
            name: "Home Maintenance Schedule & Tasks",
            url: "#",
          },
          {
            emoji: "📅",
            name: "Family Calendar & Event Planning",
            url: "#",
          },
        ],
      },
      {
        emoji: "🧳",
        name: "Travel & Adventure",
        pages: [
          {
            emoji: "🗺️",
            name: "Trip Planning & Itineraries",
            url: "#",
          },
          {
            emoji: "🌎",
            name: "Travel Bucket List & Inspiration",
            url: "#",
          },
          {
            emoji: "📸",
            name: "Travel Journal & Photo Gallery",
            url: "#",
          },
        ],
      },
    ],
  };

  const props = omit(componentProps);

  return (
    <Sidebar class="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.favorites} />
        <NavWorkspaces workspaces={data.workspaces} />
        <NavSecondary items={data.navSecondary} class="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
