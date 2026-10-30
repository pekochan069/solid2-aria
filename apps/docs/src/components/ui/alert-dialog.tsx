/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/alert-dialog.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Dialog as AlertDialogPrimitive,
  DialogTrigger as AlertDialogTriggerPrimitive,
  Heading,
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
} from "@solid2-aria/components";
import type {
  DialogTriggerProps as AlertDialogTriggerPrimitiveProps,
  ModalOverlayProps as ModalOverlayPrimitiveProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

import { Button } from "./button";

function AlertDialogTrigger(props: AlertDialogTriggerPrimitiveProps) {
  return (
    <AlertDialogTriggerPrimitive data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogOverlay(
  props: Omit<ModalOverlayPrimitiveProps, "class" | "children"> & {
    class?: string;
    children: JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <ModalOverlayPrimitive
      data-slot="alert-dialog-overlay"
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

function AlertDialog(
  props: Omit<ModalOverlayPrimitiveProps, "class" | "children"> &
    Pick<ComponentProps<typeof ModalPrimitive>, "isDismissable"> & {
      class?: string;
      size?: "default" | "sm";
      children: JSX.Element;
    }
) {
  const merged = merge({ size: "default" } as const, props);
  const rest = omit(merged, "class", "size", "children");

  return (
    <AlertDialogOverlay {...rest}>
      <ModalPrimitive
        data-slot="alert-dialog-content"
        data-size={merged.size}
        class={cn(
          "data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 data-exiting:zoom-out-95 data-entering:zoom-in-95 bg-popover text-popover-foreground ring-foreground/10 group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 ring-1 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm",
          merged.class
        )}
      >
        <AlertDialogPrimitive
          data-slot="alert-dialog"
          role="alertdialog"
          class="[display:inherit] gap-[inherit] outline-none"
        >
          {merged.children}
        </AlertDialogPrimitive>
      </ModalPrimitive>
    </AlertDialogOverlay>
  );
}

function AlertDialogContent(props: ComponentProps<typeof AlertDialog>) {
  const merged = merge({ size: "default" } as const, props);
  const rest = omit(merged, "class", "size", "children");

  return (
    <AlertDialog class={merged.class} size={merged.size} {...rest}>
      {merged.children}
    </AlertDialog>
  );
}

function AlertDialogHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="alert-dialog-header"
      class={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        props.class
      )}
      {...rest}
    />
  );
}

function AlertDialogFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="alert-dialog-footer"
      class={cn(
        "bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        props.class
      )}
      {...rest}
    />
  );
}

function AlertDialogMedia(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="alert-dialog-media"
      class={cn(
        "bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        props.class
      )}
      {...rest}
    />
  );
}

function AlertDialogTitle(props: Omit<ComponentProps<typeof Heading>, "slot">) {
  const rest = omit(props, "class");

  return (
    <Heading
      slot="title"
      data-slot="alert-dialog-title"
      class={cn(
        "font-[family-name:var(--font-heading,var(--font-sans))] text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        props.class
      )}
      {...rest}
    />
  );
}

function AlertDialogDescription(props: Omit<ComponentProps<"div">, "slot">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="alert-dialog-description"
      class={cn(
        "text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3",
        props.class
      )}
      {...rest}
    />
  );
}

function AlertDialogAction(props: ComponentProps<typeof Button>) {
  const rest = omit(props, "class");

  return (
    <Button
      slot="close"
      data-slot="alert-dialog-action"
      class={cn("", props.class)}
      {...rest}
    />
  );
}

function AlertDialogCancel(props: ComponentProps<typeof Button>) {
  const merged = merge({ size: "default", variant: "outline" } as const, props);

  const rest = omit(merged, "class", "variant", "size");

  return (
    <Button
      slot="close"
      data-slot="alert-dialog-cancel"
      class={cn("", merged.class)}
      variant={merged.variant}
      size={merged.size}
      {...rest}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger,
};
