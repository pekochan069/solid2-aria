/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/blocks/sidebar-06/components/sidebar-opt-in-form.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../../../registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../registry/ui/card";
import { SidebarInput } from "../../../registry/ui/sidebar";
import { toast } from "../../../registry/ui/sonner";

export function SidebarOptInForm() {
  return (
    <Card class="gap-2 py-4 shadow-none">
      <CardHeader class="px-4">
        <CardTitle class="text-sm">Subscribe to our newsletter</CardTitle>
        <CardDescription>
          Opt-in to receive updates and news about the sidebar.
        </CardDescription>
      </CardHeader>
      <CardContent class="px-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            toast.success("Form submitted successfully");
          }}
        >
          <div class="grid gap-2.5">
            <SidebarInput type="email" placeholder="Email" />
            <Button class="bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none">
              Subscribe
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default SidebarOptInForm;
