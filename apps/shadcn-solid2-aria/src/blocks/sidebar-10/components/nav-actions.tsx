/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-10/components/nav-actions.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  MoreHorizontalIcon,
  StarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BellIcon,
  TrashIcon,
  GalleryVerticalEndIcon,
  ChartLineIcon,
  CornerUpLeftIcon,
  CornerUpRightIcon,
  CopyIcon,
  LinkIcon,
  FileTextIcon,
} from "@lucide/solid";
import { onSettled, createSignal, For } from "solid-js";

import { Button } from "../../../registry/ui/button";
import { Popover, PopoverTrigger } from "../../../registry/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../registry/ui/sidebar";
import { IconPlaceholder } from "../../_icons";

export function NavActions() {
  const data = [
    [
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
        label: "Customize Page",
      },
      {
        icon: <FileTextIcon />,
        label: "Turn into wiki",
      },
    ],
    [
      {
        icon: <LinkIcon />,
        label: "Copy Link",
      },
      {
        icon: <CopyIcon />,
        label: "Duplicate",
      },
      {
        icon: <CornerUpRightIcon />,
        label: "Move to",
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
        label: "Move to Trash",
      },
    ],
    [
      {
        icon: <CornerUpLeftIcon />,
        label: "Undo",
      },
      {
        icon: <ChartLineIcon />,
        label: "View analytics",
      },
      {
        icon: <GalleryVerticalEndIcon />,
        label: "Version History",
      },
      {
        icon: <TrashIcon />,
        label: "Show delete pages",
      },
      {
        icon: <BellIcon />,
        label: "Notifications",
      },
    ],
    [
      {
        icon: <ArrowUpIcon />,
        label: "Import",
      },
      {
        icon: <ArrowDownIcon />,
        label: "Export",
      },
    ],
  ];

  const [isOpen, setIsOpen] = createSignal(false);
  onSettled(() => {
    setIsOpen(true);
  });

  return (
    <div class="flex items-center gap-2 text-sm">
      <div class="text-muted-foreground hidden font-medium md:inline-block">
        Edit Oct 08
      </div>
      <Button variant="ghost" size="icon" class="h-7 w-7">
        <StarIcon />
      </Button>
      <PopoverTrigger
        isOpen={isOpen()}
        onOpenChange={(value) => {
          setIsOpen(value);
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          class="aria-expanded:bg-accent h-7 w-7"
        >
          <MoreHorizontalIcon />
        </Button>
        <Popover
          class="w-56 overflow-hidden rounded-lg p-0"
          placement="bottom end"
        >
          <Sidebar collapsible="none" class="bg-transparent">
            <SidebarContent>
              {
                <For each={data}>
                  {(group, _index) => (
                    <SidebarGroup class="border-b last:border-none">
                      <SidebarGroupContent class="gap-0">
                        <SidebarMenu>
                          {
                            <For each={group}>
                              {(item, _indexValue) => (
                                <SidebarMenuItem>
                                  <SidebarMenuButton>
                                    {item.icon} <span>{item.label}</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              )}
                            </For>
                          }
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  )}
                </For>
              }
            </SidebarContent>
          </Sidebar>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

export default NavActions;
