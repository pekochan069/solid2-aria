/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/sheet.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Heading,
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
  Dialog as SheetPrimitive,
  DialogTrigger as SheetTriggerPrimitive,
} from "@solid2-aria/components";
import type {
  ModalOverlayProps as ModalOverlayPrimitiveProps,
  DialogTriggerProps as SheetTriggerPrimitiveProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
import { Button } from "./button";

function SheetTrigger(props: SheetTriggerPrimitiveProps) {
  return <SheetTriggerPrimitive data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: ComponentProps<typeof Button>) {
  const merged = merge({ size: "default", variant: "outline" } as const, props);

  const rest = omit(merged, "class", "variant", "size");

  return (
    <Button
      slot="close"
      data-slot="sheet-close"
      variant={merged.variant}
      size={merged.size}
      class={cn(merged.class)}
      {...rest}
    />
  );
}

function SheetOverlay(
  props: Omit<ModalOverlayPrimitiveProps, "class" | "children"> & {
    class?: string;
    children: JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <ModalOverlayPrimitive
      data-slot="sheet-overlay"
      isDismissable
      class={cn(
        "cn-sheet-overlay fixed inset-0 z-50 transition-opacity duration-150 data-entering:opacity-0 data-exiting:opacity-0",
        props.class
      )}
      {...rest}
    >
      {props.children}
    </ModalOverlayPrimitive>
  );
}

function Sheet(
  props: Omit<ModalOverlayPrimitiveProps, "class" | "children"> &
    Pick<ComponentProps<typeof ModalPrimitive>, "isDismissable"> & {
      class?: string;
      children: JSX.Element;
      side?: "top" | "right" | "bottom" | "left";
      showCloseButton?: boolean;
    }
) {
  const merged = merge(
    { showCloseButton: true, side: "right" } as const,
    props
  );

  const rest = omit(merged, "class", "children", "side", "showCloseButton");

  return (
    <SheetOverlay {...rest}>
      <ModalPrimitive
        data-slot="sheet-content"
        data-side={merged.side}
        class={cn(
          "cn-sheet-content data-entering:opacity-0 data-exiting:opacity-0 data-[side=bottom]:data-entering:translate-y-10 data-[side=bottom]:data-exiting:translate-y-10 data-[side=left]:data-entering:-translate-x-10 data-[side=left]:data-exiting:-translate-x-10 data-[side=right]:data-entering:translate-x-10 data-[side=right]:data-exiting:translate-x-10 data-[side=top]:data-entering:-translate-y-10 data-[side=top]:data-exiting:-translate-y-10",
          merged.class
        )}
      >
        <SheetPrimitive
          data-slot="sheet"
          class="[display:inherit] h-full max-h-[inherit] [flex-direction:inherit] gap-[inherit] outline-none"
        >
          {merged.children}
          {merged.showCloseButton && (
            <SheetClose variant="ghost" class="cn-sheet-close" size="icon-sm">
              <IconPlaceholder
                lucide="XIcon"
                tabler="IconX"
                hugeicons="Cancel01Icon"
                phosphor="XIcon"
                remixicon="RiCloseLine"
              />
              <span class="sr-only">Close</span>
            </SheetClose>
          )}
        </SheetPrimitive>
      </ModalPrimitive>
    </SheetOverlay>
  );
}

function SheetContent(
  props: ComponentProps<typeof Sheet> & {
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
  }
) {
  const merged = merge(
    { showCloseButton: true, side: "right" } as const,
    props
  );

  const rest = omit(merged, "class", "children", "side", "showCloseButton");

  return (
    <Sheet
      class={merged.class}
      side={merged.side}
      showCloseButton={merged.showCloseButton}
      {...rest}
    >
      {merged.children}
    </Sheet>
  );
}

function SheetHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sheet-header"
      class={cn("cn-sheet-header flex flex-col", props.class)}
      {...rest}
    />
  );
}

function SheetFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sheet-footer"
      class={cn("cn-sheet-footer mt-auto flex flex-col", props.class)}
      {...rest}
    />
  );
}

function SheetTitle(props: Omit<ComponentProps<typeof Heading>, "slot">) {
  const rest = omit(props, "class");

  return (
    <Heading
      slot="title"
      data-slot="sheet-title"
      class={cn("cn-sheet-title cn-font-heading", props.class)}
      {...rest}
    />
  );
}

function SheetDescription(props: Omit<ComponentProps<"div">, "slot">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sheet-description"
      class={cn("cn-sheet-description", props.class)}
      {...rest}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

export {
  type DialogProps as SheetPrimitiveProps,
  type DialogTriggerProps as SheetTriggerPrimitiveProps,
} from "@solid2-aria/components";
