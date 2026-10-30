/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/dialog.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { XIcon } from "@lucide/solid";
import {
  Dialog as DialogPrimitive,
  DialogTrigger as DialogTriggerPrimitive,
  Heading,
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
} from "@solid2-aria/components";
import type {
  DialogTriggerProps as DialogTriggerPrimitiveProps,
  ModalOverlayProps as ModalOverlayPrimitiveProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

import { Button } from "./button";

export {
  type DialogProps as DialogPrimitiveProps,
  type DialogTriggerProps as DialogTriggerPrimitiveProps,
} from "@solid2-aria/components";

function DialogTrigger(props: DialogTriggerPrimitiveProps) {
  return <DialogTriggerPrimitive data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: ComponentProps<typeof Button>) {
  const merged = merge({ size: "default", variant: "outline" } as const, props);

  const rest = omit(merged, "class", "variant", "size");

  return (
    <Button
      slot="close"
      data-slot="dialog-close"
      variant={merged.variant}
      size={merged.size}
      class={cn(merged.class)}
      {...rest}
    />
  );
}

function DialogOverlay(
  props: Omit<ModalOverlayPrimitiveProps, "class" | "children"> & {
    class?: string;
    children: JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <ModalOverlayPrimitive
      data-slot="dialog-overlay"
      class={cn(
        "data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs",
        props.class
      )}
      {...rest}
    >
      {props.children}
    </ModalOverlayPrimitive>
  );
}

function Dialog(
  props: Omit<ModalOverlayPrimitiveProps, "class" | "children"> &
    Pick<ComponentProps<typeof ModalPrimitive>, "isDismissable"> & {
      class?: string;
      children: JSX.Element;
      showCloseButton?: boolean;
    }
) {
  const merged = merge(
    { isDismissable: true, showCloseButton: true } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "children",
    "showCloseButton",
    "isDismissable"
  );

  return (
    <DialogOverlay isDismissable={merged.isDismissable} {...rest}>
      <ModalPrimitive
        data-slot="dialog-content"
        class={cn(
          "bg-popover text-popover-foreground data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 data-exiting:zoom-out-95 data-entering:zoom-in-95 ring-foreground/10 fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 text-sm ring-1 duration-100 outline-none sm:max-w-sm",
          merged.class
        )}
      >
        <DialogPrimitive
          data-slot="dialog"
          class="[display:inherit] gap-[inherit] outline-none"
        >
          {merged.children}
          {merged.showCloseButton && (
            <DialogClose
              variant="ghost"
              class="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon />
              <span class="sr-only">Close</span>
            </DialogClose>
          )}
        </DialogPrimitive>
      </ModalPrimitive>
    </DialogOverlay>
  );
}

function DialogHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="dialog-header"
      class={cn("flex flex-col gap-2", props.class)}
      {...rest}
    />
  );
}

function DialogFooter(
  props: ComponentProps<"div"> & {
    showCloseButton?: boolean;
  }
) {
  const merged = merge({ showCloseButton: false } as const, props);
  const rest = omit(merged, "class", "showCloseButton", "children");

  return (
    <div
      data-slot="dialog-footer"
      class={cn(
        "bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 sm:flex-row sm:justify-end",
        merged.class
      )}
      {...rest}
    >
      {merged.children}
      {merged.showCloseButton && (
        <DialogClose variant="outline">Close</DialogClose>
      )}
    </div>
  );
}

function DialogTitle(props: Omit<ComponentProps<typeof Heading>, "slot">) {
  const rest = omit(props, "class");

  return (
    <Heading
      slot="title"
      data-slot="dialog-title"
      class={cn(
        "font-[family-name:var(--font-heading,var(--font-sans))] text-base leading-none font-medium",
        props.class
      )}
      {...rest}
    />
  );
}

function DialogDescription(props: Omit<ComponentProps<"div">, "slot">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="dialog-description"
      class={cn(
        "text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
};
