/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/sonner.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, @solid2-aria/sonner integration, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "@lucide/solid";
import { Toaster as Sonner } from "@solid2-aria/sonner";

import "@solid2-aria/sonner/styles.css";
import type { ToasterProps } from "@solid2-aria/sonner";

export { toast } from "@solid2-aria/sonner";

export type { ToasterProps } from "@solid2-aria/sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      class="toaster group"
      icons={{
        error: <OctagonXIcon class="size-4" />,
        info: <InfoIcon class="size-4" />,
        loading: <Loader2Icon class="size-4 animate-spin" />,
        success: <CircleCheckIcon class="size-4" />,
        warning: <TriangleAlertIcon class="size-4" />,
      }}
      style={{
        "--border-radius": "var(--radius)",
        "--normal-bg": "var(--popover)",
        "--normal-border": "var(--border)",
        "--normal-text": "var(--popover-foreground)",
      }}
      toastOptions={{
        classNames: {
          toast: "rounded-2xl",
        },
      }}
      {...props}
    />
  );
}
