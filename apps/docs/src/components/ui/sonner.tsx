/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/sonner.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "@lucide/solid";
import {
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  ToastQueue,
  Text,
  Heading,
} from "@solid2-aria/components";
import type { ToastOptions } from "@solid2-aria/components";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

import { cn } from "#lib/cn";

import { Button } from "./button";

export interface ToastMessage {
  title: JSX.Element;
  description?: JSX.Element;
  variant?: "default" | "success" | "info" | "warning" | "error" | "loading";
}

export function createToaster() {
  const queue = new ToastQueue<ToastMessage>({ maxVisibleToasts: 3 });

  return {
    dismiss: (key: string) => {
      queue.close(key);
    },
    queue,
    toast: (
      title: JSX.Element,
      options?: ToastOptions & Omit<ToastMessage, "title">
    ) =>
      queue.add(
        { description: options?.description, title, variant: options?.variant },
        { timeout: 5000, ...options }
      ),
  };
}

export interface ToasterProps {
  queue: ToastQueue<ToastMessage>;
  class?: JSX.ClassValue;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const toastIcons = {
  default: InfoIcon,
  error: OctagonXIcon,
  info: InfoIcon,
  loading: Loader2Icon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
} as const;

export function Toaster(props: ToasterProps) {
  return (
    <ToastRegion
      queue={props.queue}
      aria-label="Notifications"
      class={cn(
        "toaster group fixed z-100 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 p-4",
        (props.position ?? "bottom-right").startsWith("top")
          ? "top-0"
          : "bottom-0",
        (props.position ?? "bottom-right").endsWith("left")
          ? "left-0"
          : "right-0",
        props.class
      )}
    >
      {(state) => {
        const Icon = dynamic(
          () => toastIcons[state.toast.content.variant ?? "default"]
        );

        return (
          <Toast
            toast={state.toast}
            data-slot="toast"
            data-variant={state.toast.content.variant ?? "default"}
            class="bg-popover text-popover-foreground flex items-start gap-3 rounded-lg border p-4 shadow-lg"
          >
            <Icon aria-hidden="true" class="size-4 shrink-0" />
            <ToastContent>
              <Heading slot="title" class="font-medium">
                {state.toast.content.title}
              </Heading>
              {Boolean(state.toast.content.description) && (
                <Text slot="description" class="text-muted-foreground text-sm">
                  {state.toast.content.description}
                </Text>
              )}
            </ToastContent>
            <Button
              slot="close"
              variant="ghost"
              size="icon-xs"
              aria-label="Dismiss notification"
            >
              <XIcon />
            </Button>
          </Toast>
        );
      }}
    </ToastRegion>
  );
}
