/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/sonner.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, @solid2-aria/sonner integration, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Toaster as Sonner } from "@solid2-aria/sonner";
import type { ToasterProps } from "@solid2-aria/sonner";

import "@solid2-aria/sonner/styles.css";

import { IconPlaceholder } from "../lib/icon-placeholder";

export { toast } from "@solid2-aria/sonner";

export type { ToasterProps } from "@solid2-aria/sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      class="toaster group"
      icons={{
        error: <IconPlaceholder lucide="OctagonXIcon" class="size-4" />,
        info: <IconPlaceholder lucide="InfoIcon" class="size-4" />,
        loading: (
          <IconPlaceholder lucide="Loader2Icon" class="size-4 animate-spin" />
        ),
        success: <IconPlaceholder lucide="CircleCheckIcon" class="size-4" />,
        warning: <IconPlaceholder lucide="TriangleAlertIcon" class="size-4" />,
      }}
      style={{
        "--border-radius": "var(--radius)",
        "--normal-bg": "var(--popover)",
        "--normal-border": "var(--border)",
        "--normal-text": "var(--popover-foreground)",
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
}
