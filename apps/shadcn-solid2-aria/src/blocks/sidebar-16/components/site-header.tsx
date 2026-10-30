/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-16/components/site-header.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PanelLeftIcon } from "@lucide/solid";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../../../registry/ui/breadcrumb";
import { Button } from "../../../registry/ui/button";
import { Separator } from "../../../registry/ui/separator";
import { useSidebar } from "../../../registry/ui/sidebar";
import { SearchForm } from "./search-form";

export function SiteHeader() {
  const sidebar = useSidebar();

  return (
    <header class="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div class="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          class="h-8 w-8"
          variant="ghost"
          size="icon"
          onPress={sidebar.toggleSidebar}
        >
          <PanelLeftIcon />
        </Button>
        <Separator
          orientation="vertical"
          class="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb class="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm class="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}

export default SiteHeader;
