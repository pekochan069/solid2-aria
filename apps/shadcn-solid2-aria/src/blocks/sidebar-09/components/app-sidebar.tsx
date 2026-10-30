/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-09/components/app-sidebar.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  TerminalIcon,
  ArchiveXIcon,
  SendIcon,
  FileIcon,
  InboxIcon,
} from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { omit, createSignal, For } from "solid-js";

import { Label } from "../../../registry/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../../registry/ui/sidebar";
import { Switch } from "../../../registry/ui/switch";
import { IconPlaceholder } from "../../_icons";
import { NavUser } from "./nav-user";

// This is sample data

export function AppSidebar(componentProps: ComponentProps<typeof Sidebar>) {
  const data = {
    mails: [
      {
        date: "09:34 AM",
        email: "williamsmith@example.com",
        name: "William Smith",
        subject: "Meeting Tomorrow",
        teaser:
          "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
      },
      {
        date: "Yesterday",
        email: "alicesmith@example.com",
        name: "Alice Smith",
        subject: "Re: Project Update",
        teaser:
          "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
      },
      {
        date: "2 days ago",
        email: "bobjohnson@example.com",
        name: "Bob Johnson",
        subject: "Weekend Plans",
        teaser:
          "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
      },
      {
        date: "2 days ago",
        email: "emilydavis@example.com",
        name: "Emily Davis",
        subject: "Re: Question about Budget",
        teaser:
          "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
      },
      {
        date: "1 week ago",
        email: "michaelwilson@example.com",
        name: "Michael Wilson",
        subject: "Important Announcement",
        teaser:
          "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
      },
      {
        date: "1 week ago",
        email: "sarahbrown@example.com",
        name: "Sarah Brown",
        subject: "Re: Feedback on Proposal",
        teaser:
          "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
      },
      {
        date: "1 week ago",
        email: "davidlee@example.com",
        name: "David Lee",
        subject: "New Project Idea",
        teaser:
          "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
      },
      {
        date: "1 week ago",
        email: "oliviawilson@example.com",
        name: "Olivia Wilson",
        subject: "Vacation Plans",
        teaser:
          "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
      },
      {
        date: "1 week ago",
        email: "jamesmartin@example.com",
        name: "James Martin",
        subject: "Re: Conference Registration",
        teaser:
          "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
      },
      {
        date: "1 week ago",
        email: "sophiawhite@example.com",
        name: "Sophia White",
        subject: "Team Dinner",
        teaser:
          "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
      },
    ],
    navMain: [
      {
        icon: <InboxIcon />,
        isActive: true,
        title: "Inbox",
        url: "#",
      },
      {
        icon: <FileIcon />,
        isActive: false,
        title: "Drafts",
        url: "#",
      },
      {
        icon: <SendIcon />,
        isActive: false,
        title: "Sent",
        url: "#",
      },
      {
        icon: <ArchiveXIcon />,
        isActive: false,
        title: "Junk",
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
        isActive: false,
        title: "Trash",
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
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = createSignal(data.navMain[0]);
  const [mails, setMails] = createSignal(data.mails);
  const sidebar = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      class="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        class="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" size="lg" class="md:h-8 md:p-0">
                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <TerminalIcon class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">Acme Inc</span>
                  <span class="truncate text-xs">Enterprise</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent class="px-1.5 md:px-0">
              <SidebarMenu>
                {
                  <For each={data.navMain}>
                    {(item) => (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip={{
                            children: item.title,
                          }}
                          onClick={() => {
                            setActiveItem(item);

                            const mail = data.mails.toSorted(
                              () => Math.random() - 0.5
                            );

                            setMails(
                              mail.slice(
                                0,
                                Math.max(5, Math.floor(Math.random() * 10) + 1)
                              )
                            );
                            sidebar.setOpen(true);
                          }}
                          isActive={activeItem()?.title === item.title}
                          class="px-2.5 md:px-2"
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </For>
                }
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" class="hidden flex-1 md:flex">
        <SidebarHeader class="gap-3.5 border-b p-4">
          <div class="flex w-full items-center justify-between">
            <div class="text-foreground text-base font-medium">
              {activeItem()?.title}
            </div>
            <Label class="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch class="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup class="px-0">
            <SidebarGroupContent>
              {
                <For each={mails()}>
                  {(mail) => (
                    <a
                      href="#"
                      class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                    >
                      <div class="flex w-full items-center gap-2">
                        <span>{mail.name}</span>{" "}
                        <span class="ml-auto text-xs">{mail.date}</span>
                      </div>
                      <span class="font-medium">{mail.subject}</span>
                      <span class="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                        {mail.teaser}
                      </span>
                    </a>
                  )}
                </For>
              }
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}

export default AppSidebar;
