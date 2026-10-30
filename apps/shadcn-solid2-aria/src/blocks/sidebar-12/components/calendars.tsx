/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-12/components/calendars.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon, ChevronRightIcon } from "@lucide/solid";
import { For } from "solid-js";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../registry/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "../../../registry/ui/sidebar";
import { Fragment } from "../../_config";

export function Calendars(componentProps: {
  calendars: {
    name: string;
    items: string[];
  }[];
}) {
  return (
    <>
      {
        <For each={componentProps.calendars}>
          {(calendar, index) => (
            <Fragment>
              <SidebarGroup>
                <Collapsible
                  defaultExpanded={index() === 0}
                  class="group/collapsible"
                >
                  <CollapsibleTrigger class="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm">
                    {calendar.name}{" "}
                    <ChevronRightIcon class="ml-auto transition-transform group-data-expanded/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {
                          <For each={calendar.items}>
                            {(item, indexValue) => (
                              <SidebarMenuItem>
                                <SidebarMenuButton>
                                  <div
                                    data-active={indexValue() < 2}
                                    class="group/calendar-item border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border"
                                  >
                                    <CheckIcon class="hidden size-3 group-data-[active=true]/calendar-item:block" />
                                  </div>
                                  {item}
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )}
                          </For>
                        }
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
              <SidebarSeparator class="mx-0" />
            </Fragment>
          )}
        </For>
      }
    </>
  );
}

export default Calendars;
