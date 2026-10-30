/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/dialog.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
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
        "cn-dialog-overlay-aria fixed inset-0 isolate z-50",
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
          "cn-dialog-content-aria fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          merged.class
        )}
      >
        <DialogPrimitive
          data-slot="dialog"
          class="[display:inherit] gap-[inherit] outline-none"
        >
          {merged.children}
          {merged.showCloseButton && (
            <DialogClose variant="ghost" class="cn-dialog-close" size="icon-sm">
              <IconPlaceholder
                lucide="XIcon"
                tabler="IconX"
                hugeicons="Cancel01Icon"
                phosphor="XIcon"
                remixicon="RiCloseLine"
              />
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
      class={cn("cn-dialog-header flex flex-col", props.class)}
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
        "cn-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
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
      class={cn("cn-dialog-title cn-font-heading", props.class)}
      {...rest}
    />
  );
}

function DialogDescription(props: Omit<ComponentProps<"div">, "slot">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="dialog-description"
      class={cn("cn-dialog-description", props.class)}
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
