/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/drawer.tsx.
 * Modified for Solid Aria: Solid 2 reactive props and Solid Aria sheets, preserving directional handle placement, content sizing, accessible title and description slots, and gradual backdrop blur and tint.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  SheetTrigger,
  SheetOverlay,
  Sheet as SheetPrimitive,
  SheetBackdrop,
  SheetContent,
  Heading,
  Text,
} from "@solid2-aria/components";
import type { ComponentProps, JSX } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  useContext,
  omit,
} from "solid-js";

import { cn } from "#lib/cn";

import { Button } from "./button";

const DrawerContext = createContext<{
  swipeDirection?: "down" | "up" | "left" | "right";
  snapPoints?: (number | string)[];
  showSwipeHandle?: boolean;
}>();

const DrawerContentContext = createContext<{
  setDescriptionId: (id: string | undefined) => void;
}>();

function Drawer(
  props: ComponentProps<typeof SheetTrigger> & {
    swipeDirection?: "down" | "up" | "left" | "right";
    snapPoints?: (number | string)[];
    showSwipeHandle?: boolean;
  }
) {
  const rest = omit(props, "swipeDirection", "snapPoints", "showSwipeHandle");

  return (
    <DrawerContext value={props}>
      <SheetTrigger {...rest} />
    </DrawerContext>
  );
}

function DrawerTrigger(props: ComponentProps<typeof Button>) {
  return <Button {...props} data-slot="drawer-trigger" />;
}

function DrawerClose(props: ComponentProps<typeof Button>) {
  return <Button {...props} slot="close" data-slot="drawer-close" />;
}

function DrawerPortal(props: { children?: JSX.Element }) {
  return <>{props.children}</>;
}

function DrawerOverlay(props: ComponentProps<typeof SheetBackdrop>) {
  return (
    <SheetBackdrop
      {...props}
      style={{
        "--drawer-swipe-progress": "var(--sheet-swipe-progress, 0)",
        "--drawer-swipe-strength": 1,
      }}
      data-slot="drawer-overlay"
      class={cn(
        "fixed inset-0 z-50 min-h-dvh bg-black/10 opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-entering:opacity-0 data-exiting:pointer-events-none data-exiting:opacity-0 data-exiting:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-snap-points:[--drawer-overlay-min-opacity:0.5] data-swiping:duration-0 supports-backdrop-filter:backdrop-blur-xs supports-[-webkit-touch-callout:none]:absolute",
        props.class
      )}
    />
  );
}

function DrawerSwipeHandle(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="drawer-swipe-handle"
      data-sheet-drag-handle
      aria-hidden="true"
      class={cn(
        "after:bg-muted relative z-10 flex shrink-0 cursor-grab touch-none transition-opacity duration-200 select-none group-data-descendants-swiping/drawer-popup:opacity-100 group-data-has-descendants/drawer-popup:opacity-0 group-data-[position=bottom]/drawer-popup:items-end group-data-[position=top]/drawer-popup:order-last group-data-[position=top]/drawer-popup:items-start group-data-[swipe-axis=x]/drawer-popup:h-full group-data-[swipe-axis=x]/drawer-popup:w-3 group-data-[swipe-axis=x]/drawer-popup:items-center group-data-[swipe-axis=y]/drawer-popup:h-3 group-data-[swipe-axis=y]/drawer-popup:w-full group-data-[swipe-axis=y]/drawer-popup:justify-center group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:justify-start group-data-[swipe-direction=right]/drawer-popup:justify-end after:block after:shrink-0 after:rounded-full group-data-[swipe-axis=x]/drawer-popup:after:h-24 group-data-[swipe-axis=x]/drawer-popup:after:w-1 group-data-[swipe-axis=y]/drawer-popup:after:h-1 group-data-[swipe-axis=y]/drawer-popup:after:w-24 active:cursor-grabbing",
        props.class
      )}
    />
  );
}

const drawerPositions = {
  down: "bottom",
  left: "left",
  right: "right",
  up: "top",
} as const;

function DrawerContent(props: ComponentProps<typeof SheetContent>) {
  const context = useContext(DrawerContext);
  const [descriptionId, setDescriptionId] = createSignal<string>();

  const rest = omit(props, "children", "class");

  return (
    <SheetOverlay
      position={drawerPositions[context.swipeDirection ?? "down"]}
      snapPoints={
        context.swipeDirection === "left" || context.swipeDirection === "right"
          ? undefined
          : context.snapPoints?.map((point) =>
              typeof point === "number" && point <= 1
                ? `${Math.max(0, point) * 100}dvh`
                : point
            )
      }
      class="z-50"
      style={{
        height: `max(${typeof document === "undefined" ? 0 : document.documentElement.scrollHeight}px, 100dvh)`,
        width: "max(var(--page-width, 0px), 100vw)",
      }}
    >
      <DrawerOverlay
        data-snap-points={(context.snapPoints?.length ?? 0) > 0 || undefined}
      />
      <SheetPrimitive
        data-snap-points={(context.snapPoints?.length ?? 0) > 0 || undefined}
        style={{
          "--drawer-frontmost-height": "var(--sheet-frontmost-height)",
          "--drawer-snap-point-offset": "0px",
          "--drawer-swipe-movement-x": "0px",
          "--drawer-swipe-movement-y": "0px",
          "--drawer-swipe-progress": "var(--sheet-swipe-progress, 0)",
          "--drawer-swipe-strength": 1,
          "--nested-drawers": "var(--sheet-descendant-count, 0)",
        }}
        data-slot="drawer-popup"
        data-swipe-axis={
          context.swipeDirection === "left" ||
          context.swipeDirection === "right"
            ? "x"
            : "y"
        }
        class={cn(
          "bg-popover text-popover-foreground group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col overflow-clip text-sm transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [--bleed:3rem] [--drawer-content-height:var(--drawer-height,auto)] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05] [interpolate-size:allow-keywords] after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-descendants-swiping:duration-0 data-entering:transform-(--closed-transform) data-exiting:transform-(--closed-transform) data-exiting:opacity-[0.9999] data-exiting:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-exiting:data-descendants-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-has-descendants:overflow-hidden data-has-descendants:brightness-95 data-swiping:duration-0 data-exiting:data-swiping:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-[position=bottom]:bottom-0 data-[position=bottom]:origin-bottom data-[position=bottom]:rounded-t-xl data-[position=bottom]:border-t data-[position=bottom]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[position=bottom]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))] data-[position=bottom]:after:top-full data-[position=top]:top-0 data-[position=top]:origin-top data-[position=top]:rounded-b-xl data-[position=top]:border-b data-[position=top]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[position=top]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))] data-[position=top]:after:bottom-full data-[swipe-axis=x]:h-[calc(100dvh-2*var(--drawer-inset,0px))] data-[swipe-axis=x]:flex-row data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:w-[calc(100dvw-2*var(--drawer-inset,0px))] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-axis=y]:data-has-descendants:h-(--stack-height) data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))] data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))] data-[swipe-direction=right]:after:left-full data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]",
          props.class
        )}
      >
        {(context.showSwipeHandle ?? false) && <DrawerSwipeHandle />}
        <DrawerContentContext
          value={{
            setDescriptionId: (id) => {
              setDescriptionId(id);
            },
          }}
        >
          <SheetContent
            {...rest}
            aria-describedby={props["aria-describedby"] ?? descriptionId()}
            data-slot="drawer-content"
            class="cn-drawer-content-base flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-descendants-swiping/drawer-popup:opacity-100 group-data-has-descendants/drawer-popup:opacity-0 group-data-swiping/drawer-popup:select-none"
          >
            {props.children}
          </SheetContent>
        </DrawerContentContext>
      </SheetPrimitive>
    </SheetOverlay>
  );
}

function DrawerHeader(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="drawer-header"
      class={cn(
        "flex shrink-0 flex-col gap-0.5 p-4 pb-0 group-data-[swipe-axis=y]/drawer-popup:text-center md:gap-0.5 md:text-left",
        props.class
      )}
    />
  );
}

function DrawerFooter(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="drawer-footer"
      class={cn("mt-auto flex shrink-0 flex-col gap-2 p-4 pt-0", props.class)}
    />
  );
}

function DrawerTitle(props: ComponentProps<typeof Heading>) {
  const rest = omit(props, "class");

  return (
    <Heading
      {...rest}
      slot="title"
      level={props.level ?? 2}
      data-slot="drawer-title"
      class={cn(
        "text-foreground cn-font-heading text-base font-medium",
        props.class
      )}
    />
  );
}

function DrawerDescription(props: ComponentProps<typeof Text>) {
  const context = useContext(DrawerContentContext);
  const id = createUniqueId();
  const rest = omit(props, "class");

  createEffect(
    () => (props.id === false ? undefined : (props.id ?? id)),
    (value) => {
      context.setDescriptionId(value);

      return () => {
        context.setDescriptionId(undefined);
      };
    },
    { ssrSource: "client" }
  );

  return (
    <Text
      {...rest}
      id={props.id ?? id}
      slot="description"
      elementType={props.elementType ?? "p"}
      data-slot="drawer-description"
      class={cn("text-muted-foreground text-sm text-balance", props.class)}
    />
  );
}

export {
  Drawer,
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
