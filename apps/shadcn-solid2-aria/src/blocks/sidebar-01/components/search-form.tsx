/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-01/components/search-form.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { SearchIcon } from "@lucide/solid";
import type { ComponentProps } from "@solidjs/web";
import { omit } from "solid-js";

import { Label } from "../../../registry/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "../../../registry/ui/sidebar";
import { toast } from "../../../registry/ui/sonner";

export function SearchForm(componentProps: ComponentProps<"form">) {
  const props = omit(componentProps);

  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        toast.success("Form submitted successfully");
      }}
    >
      <SidebarGroup class="py-0">
        <SidebarGroupContent class="relative">
          <Label for="search" class="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the docs..."
            class="pl-8"
          />
          <SearchIcon class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}

export default SearchForm;
