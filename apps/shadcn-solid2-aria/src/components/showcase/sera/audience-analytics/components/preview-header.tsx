/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/audience-analytics/components/preview-header.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive control state, and local Aria primitives.
 * Licensed under MIT. See ../../../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { ChevronDownIcon, DownloadIcon } from "@lucide/solid";
import { createSignal, createMemo, For } from "solid-js";

import { Button } from "../../../../../registry/ui/button";
import { ButtonGroup } from "../../../../../registry/ui/button-group";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../../../../../registry/ui/dropdown-menu";

const EXPORT_DATE_OPTIONS = [
  {
    label: "Last 7 days",
    value: "last-7-days",
  },
  {
    label: "Last 30 days",
    value: "last-30-days",
  },
  {
    label: "This month",
    value: "this-month",
  },
  {
    label: "Last month",
    value: "last-month",
  },
];

export function PreviewHeader() {
  const [selectedDateRange, setSelectedDateRange] =
    createSignal("last-30-days");

  const selectedDateRangeLabel = createMemo(() => {
    const selectedOption = EXPORT_DATE_OPTIONS.find(
      (option) => option.value === selectedDateRange()
    );

    if (!selectedOption) {
      return "Last 30 days";
    }

    return selectedOption.label;
  });

  return (
    <header>
      <div class="container flex flex-col items-center justify-center gap-(--gap) py-(--gap) sm:flex-row sm:justify-between">
        <div class="flex flex-col gap-2 text-center sm:text-left">
          <h1 class="font-heading line-clamp-1 text-3xl tracking-wide uppercase md:text-3xl lg:text-4xl">
            Audience Analytics
          </h1>
          <div class="text-muted-foreground line-clamp-1 text-sm font-medium tracking-wider uppercase">
            Editorial Performance Dashboard
          </div>
        </div>
        <ButtonGroup class="gap-2 sm:ml-auto md:gap-4">
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              class="bg-background hover:bg-background/80 data-popup-open:bg-background"
            >
              {selectedDateRangeLabel()}{" "}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={[selectedDateRange()]}
            >
              <DropdownMenuGroup>
                <DropdownMenuGroup>
                  <For each={EXPORT_DATE_OPTIONS}>
                    {(option) => (
                      <DropdownMenuItem
                        id={option.value}
                        onAction={() => {
                          setSelectedDateRange(option.value);
                        }}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    )}
                  </For>
                </DropdownMenuGroup>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
          <Button>
            <DownloadIcon data-icon="inline-start" />
            <span class="lg:hidden">Export</span>
            <span class="hidden lg:inline">Export Report</span>
          </Button>
        </ButtonGroup>
      </div>
    </header>
  );
}
