/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-10/components/team-switcher.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PlusIcon, ChevronDownIcon } from "@lucide/solid";
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
} from "../../../registry/ui/sidebar";

export function TeamSwitcher(componentProps: {
  teams: {
    name: string;
    logo: JSX.Element;
    plan: string;
  }[];
}) {
  const [activeTeam, setActiveTeam] = createSignal(
    () => componentProps.teams[0]
  );

  return (
    <>
      {activeTeam() ? (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenuTrigger>
              <SidebarMenuButton class="w-fit px-1.5">
                <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md">
                  {activeTeam()?.logo}
                </div>
                <span class="truncate font-medium">{activeTeam()?.name}</span>
                <ChevronDownIcon class="opacity-50" />
              </SidebarMenuButton>
              <DropdownMenu
                class="w-64 rounded-lg"
                placement="bottom start"
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
                          <div class="flex size-6 items-center justify-center rounded-xs border">
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
                    <div class="bg-background flex size-6 items-center justify-center rounded-md border">
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
