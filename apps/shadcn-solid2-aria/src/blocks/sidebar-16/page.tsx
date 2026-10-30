/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-16/page.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { SidebarInset, SidebarProvider } from "../../registry/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { SiteHeader } from "./components/site-header";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default function Page() {
  return (
    <div class="[--header-height:calc(--spacing(14))]">
      <SidebarProvider class="flex flex-col">
        <SiteHeader />
        <div class="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div class="flex flex-1 flex-col gap-4 p-4">
              <div class="grid auto-rows-min gap-4 md:grid-cols-3">
                <div class="bg-muted/50 aspect-video rounded-xl" />
                <div class="bg-muted/50 aspect-video rounded-xl" />
                <div class="bg-muted/50 aspect-video rounded-xl" />
              </div>
              <div class="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
