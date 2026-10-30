/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/drawer.tsx.
 * Modified for Solid Aria: Solid 2 reactive props and @solid2-aria/vaul primitives for portals, accessible dialogs, directional gestures, handles, nested drawers, and snap points.
 * Styled for docs and registry installation with Nova utilities.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Drawer as DrawerPrimitive } from "@solid2-aria/vaul";
import type { ComponentProps } from "@solidjs/web";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { createContext, omit, useContext } from "solid-js";

import { buttonVariants } from "./button";

import "@solid2-aria/vaul/style.css";

type DrawerProps = ComponentProps<typeof DrawerPrimitive.Root> & {
  showSwipeHandle?: boolean;
};

const DrawerContext = createContext<DrawerProps>();

function Drawer(props: DrawerProps) {
  const rest = omit(props, "showSwipeHandle");

  return (
    <DrawerContext value={props}>
      <DrawerPrimitive.Root {...rest} />
    </DrawerContext>
  );
}

function DrawerNestedRoot(props: DrawerProps) {
  const rest = omit(props, "showSwipeHandle");

  return (
    <DrawerContext value={props}>
      <DrawerPrimitive.NestedRoot {...rest} />
    </DrawerContext>
  );
}

function DrawerTrigger(
  props: ComponentProps<typeof DrawerPrimitive.Trigger> &
    VariantProps<typeof buttonVariants>
) {
  const rest = omit(props, "class", "variant", "size");

  return (
    <DrawerPrimitive.Trigger
      {...rest}
      data-slot="drawer-trigger"
      data-variant={props.variant ?? "default"}
      data-size={props.size ?? "default"}
      class={cn(
        buttonVariants({ size: props.size, variant: props.variant }),
        props.class
      )}
    />
  );
}

function DrawerClose(
  props: ComponentProps<typeof DrawerPrimitive.Close> &
    VariantProps<typeof buttonVariants>
) {
  const rest = omit(props, "class", "variant", "size");

  return (
    <DrawerPrimitive.Close
      {...rest}
      data-slot="drawer-close"
      data-variant={props.variant ?? "default"}
      data-size={props.size ?? "default"}
      class={cn(
        buttonVariants({ size: props.size, variant: props.variant }),
        props.class
      )}
    />
  );
}

function DrawerPortal(props: ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal {...props} />;
}

function DrawerOverlay(props: ComponentProps<typeof DrawerPrimitive.Overlay>) {
  const rest = omit(props, "class");

  return (
    <DrawerPrimitive.Overlay
      {...rest}
      data-slot="drawer-overlay"
      class={cn(
        "fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        props.class
      )}
    />
  );
}

function DrawerSwipeHandle(
  props: ComponentProps<typeof DrawerPrimitive.Handle>
) {
  const rest = omit(props, "class");

  return (
    <DrawerPrimitive.Handle
      {...rest}
      data-slot="drawer-swipe-handle"
      class={cn(
        "bg-muted! relative z-10 shrink-0 cursor-grab touch-none self-center group-data-[position=left]/drawer-popup:order-last group-data-[position=top]/drawer-popup:order-last group-data-[swipe-axis=x]/drawer-popup:mx-3! group-data-[swipe-axis=x]/drawer-popup:my-auto! group-data-[swipe-axis=x]/drawer-popup:h-24! group-data-[swipe-axis=x]/drawer-popup:w-1! group-data-[swipe-axis=y]/drawer-popup:my-3! group-data-[swipe-axis=y]/drawer-popup:h-1! group-data-[swipe-axis=y]/drawer-popup:w-24! active:cursor-grabbing",
        props.class
      )}
    />
  );
}

function DrawerContent(props: ComponentProps<typeof DrawerPrimitive.Content>) {
  const context = useContext(DrawerContext);
  const rest = omit(props, "children", "class");
  const direction = () => context.direction ?? "bottom";
  const horizontal = () => direction() === "left" || direction() === "right";

  return (
    <DrawerPortal forceMount={props.forceMount}>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        {...rest}
        data-slot="drawer-popup"
        data-position={direction()}
        data-swipe-direction={direction()}
        data-swipe-axis={horizontal() ? "x" : "y"}
        data-snap-points={(context.snapPoints?.length ?? 0) > 0 || undefined}
        class={cn(
          "bg-popover text-popover-foreground group/drawer-popup fixed z-50 flex min-h-0 flex-col text-sm outline-none data-[position=bottom]:inset-x-0 data-[position=bottom]:bottom-0 data-[position=bottom]:rounded-t-xl data-[position=bottom]:border-t data-[position=left]:inset-y-0 data-[position=left]:left-0 data-[position=right]:inset-y-0 data-[position=right]:right-0 data-[position=top]:inset-x-0 data-[position=top]:top-0 data-[position=top]:rounded-b-xl data-[position=top]:border-b data-[swipe-axis=x]:h-dvh data-[swipe-axis=x]:w-3/4 data-[swipe-axis=x]:flex-row data-[swipe-axis=x]:data-snap-points:w-dvw data-[swipe-axis=x]:data-snap-points:max-w-none data-[swipe-axis=y]:max-h-[calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:h-dvh data-[swipe-axis=y]:data-snap-points:max-h-dvh data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l data-[swipe-axis=x]:sm:max-w-sm",
          props.class
        )}
      >
        {context.showSwipeHandle === true && <DrawerSwipeHandle />}
        <div
          data-slot="drawer-content"
          class="cn-drawer-content-base flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] select-text"
        >
          {props.children}
        </div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      {...rest}
      data-slot="drawer-header"
      class={cn(
        "flex shrink-0 flex-col gap-0.5 p-4 pb-0 group-data-[swipe-axis=y]/drawer-popup:text-center md:gap-0.5 md:text-left",
        props.class
      )}
    />
  );
}

function DrawerFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      {...rest}
      data-slot="drawer-footer"
      class={cn("mt-auto flex shrink-0 flex-col gap-2 p-4 pt-0", props.class)}
    />
  );
}

function DrawerTitle(props: ComponentProps<typeof DrawerPrimitive.Title>) {
  const rest = omit(props, "class");

  return (
    <DrawerPrimitive.Title
      {...rest}
      data-slot="drawer-title"
      class={cn(
        "text-foreground cn-font-heading text-base font-medium",
        props.class
      )}
    />
  );
}

function DrawerDescription(
  props: ComponentProps<typeof DrawerPrimitive.Description>
) {
  const rest = omit(props, "class");

  return (
    <DrawerPrimitive.Description
      {...rest}
      data-slot="drawer-description"
      class={cn("text-muted-foreground text-sm text-balance", props.class)}
    />
  );
}

export {
  Drawer,
  DrawerNestedRoot,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerOverlay,
  DrawerSwipeHandle,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

export type { DrawerProps };
