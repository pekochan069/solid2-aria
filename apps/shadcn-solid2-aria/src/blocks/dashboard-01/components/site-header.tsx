/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/dashboard-01/components/site-header.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Separator } from "../../../registry/ui/separator";
import { SidebarTrigger } from "../../../registry/ui/sidebar";

export function SiteHeader() {
  return (
    <header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger class="-ml-1" />
        <Separator
          orientation="vertical"
          class="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 class="text-base font-medium">Documents</h1>
      </div>
    </header>
  );
}

export default SiteHeader;
