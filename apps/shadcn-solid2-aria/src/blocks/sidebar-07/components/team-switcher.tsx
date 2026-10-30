/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-07/components/team-switcher.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PlusIcon, ChevronsUpDownIcon } from "@lucide/solid";
import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";

import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../../registry/ui/sidebar";

export function TeamSwitcher(componentProps: {
  teams: {
    name: string;
    logo: JSX.Element;
    plan: string;
  }[];
}) {
  const sidebar = useSidebar();

  const [activeTeam, setActiveTeam] = createSignal(
    () => componentProps.teams[0]
  );

  return (
    <>
      {activeTeam() ? (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenuTrigger>
              <SidebarMenuButton
                size="lg"
                class="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
              >
                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {activeTeam()?.logo}
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{activeTeam()?.name}</span>
                  <span class="truncate text-xs">{activeTeam()?.plan}</span>
                </div>
                <ChevronsUpDownIcon class="ml-auto" />
              </SidebarMenuButton>
              <DropdownMenu
                class="w-fit"
                placement={sidebar.isMobile ? "bottom start" : "right top"}
                offset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel class="text-muted-foreground text-xs">
                    Teams
                  </DropdownMenuLabel>
                  {
                    <For each={componentProps.teams}>
                      {(team, index) => (
                        <DropdownMenuItem
                          onAction={() => {
                            setActiveTeam(team);
                          }}
                          class="gap-2 p-2"
                        >
                          <div class="flex size-6 items-center justify-center rounded-md border">
                            {team.logo}
                          </div>
                          {team.name}
                          <DropdownMenuShortcut>
                            ⌘{index() + 1}
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      )}
                    </For>
                  }
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem class="gap-2 p-2">
                    <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <PlusIcon class="size-4" />
                    </div>
                    <div class="text-muted-foreground font-medium">
                      Add team
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenu>
            </DropdownMenuTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
      ) : null}
    </>
  );
}

export default TeamSwitcher;
