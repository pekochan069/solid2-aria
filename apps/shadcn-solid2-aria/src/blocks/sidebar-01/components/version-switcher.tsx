/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-01/components/version-switcher.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  CheckIcon,
  ChevronsUpDownIcon,
  GalleryVerticalEndIcon,
} from "@lucide/solid";
import { createSignal, For } from "solid-js";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../registry/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../registry/ui/sidebar";

export function VersionSwitcher(componentProps: {
  versions: string[];
  defaultVersion: string;
}) {
  const [selectedVersion, setSelectedVersion] = createSignal(
    () => componentProps.defaultVersion
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton
            size="lg"
            class="aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground"
          >
            <div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEndIcon class="size-4" />
            </div>
            <div class="flex flex-col gap-0.5 leading-none">
              <span class="font-medium">Documentation</span>
              <span class="">v{selectedVersion()}</span>
            </div>
            <ChevronsUpDownIcon class="ml-auto" />
          </SidebarMenuButton>
          <DropdownMenu placement="bottom start">
            {
              <For each={componentProps.versions}>
                {(version) => (
                  <DropdownMenuItem
                    onAction={() => {
                      setSelectedVersion(version);
                    }}
                  >
                    v{version}{" "}
                    {version === selectedVersion() && (
                      <CheckIcon class="ml-auto" />
                    )}
                  </DropdownMenuItem>
                )}
              </For>
            }
          </DropdownMenu>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default VersionSwitcher;
