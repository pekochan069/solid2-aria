/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/sidebar.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { PanelLeftIcon } from "@lucide/solid";
import {
  Button as ButtonPrimitive,
  Link as LinkPrimitive,
} from "@solid2-aria/components";
import type { ButtonProps, LinkProps } from "@solid2-aria/components";
import { dynamic } from "@solidjs/web";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import {
  createSignal,
  onSettled,
  Show,
  merge,
  omit,
  useContext,
  createContext,
} from "solid-js";

import { cn } from "#lib/cn";

import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from "./sheet";
import { Skeleton } from "./skeleton";
import { Tooltip, TooltipTrigger } from "./tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

interface SidebarContextProps {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

type SidebarButtonProps =
  | (Omit<LinkProps, "class"> & {
      class?: JSX.ClassValue;
      href: string;
    })
  | (Omit<ButtonProps, "class"> & {
      class?: JSX.ClassValue;
      href?: never;
    });

const SidebarContext = createContext<SidebarContextProps>();

function useSidebar() {
  return useContext(SidebarContext);
}

function SidebarProvider(
  props: ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
) {
  const [mobile, setMobile] = createSignal(false);
  const [openMobile, setOpenMobile] = createSignal(false);

  const [internalOpen, setInternalOpen] = createSignal(
    () => props.defaultOpen ?? true
  );

  const open = () => props.open ?? internalOpen();

  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    props.onOpenChange?.(value);
    // oxlint-disable-next-line unicorn/no-document-cookie -- Keep synchronous persistence in browsers without the Cookie Store API.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  const toggleSidebar = () => {
    if (mobile()) {
      setOpenMobile((v) => !v);
    } else {
      setOpen(!open());
    }
  };

  const keydown = (event: KeyboardEvent) => {
    if (
      event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      toggleSidebar();
    }
  };

  onSettled(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const update = () => {
      setMobile(media.matches);
    };

    update();
    media.addEventListener("change", update);
    window.addEventListener("keydown", keydown);

    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("keydown", keydown);
    };
  });

  const context: SidebarContextProps = {
    get isMobile() {
      return mobile();
    },
    get open() {
      return open();
    },
    get openMobile() {
      return openMobile();
    },
    setOpen,
    setOpenMobile: (value) => {
      setOpenMobile(value);
    },
    get state() {
      return open() ? "expanded" : "collapsed";
    },
    toggleSidebar,
  };

  const rest = omit(
    props,
    "defaultOpen",
    "open",
    "onOpenChange",
    "class",
    "style",
    "children"
  );

  const style = () => {
    const css: JSX.CSSProperties = {
      "--sidebar-width": SIDEBAR_WIDTH,
      "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
    };

    if (typeof props.style === "object") {
      Object.assign(css, props.style);
    }

    return css;
  };

  return (
    <SidebarContext value={context}>
      <div
        {...rest}
        data-slot="sidebar-wrapper"
        style={style()}
        class={cn(
          "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
          props.class
        )}
      >
        {props.children}
      </div>
    </SidebarContext>
  );
}

function Sidebar(
  props: ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
) {
  const merged = merge(
    { collapsible: "offcanvas", side: "left", variant: "sidebar" } as const,
    props
  );

  const rest = omit(
    merged,
    "side",
    "variant",
    "collapsible",
    "class",
    "children",
    "dir"
  );

  const sidebar = useSidebar();

  return (
    <Show
      when={merged.collapsible === "none"}
      fallback={
        <Show
          when={sidebar.isMobile}
          fallback={
            <div
              class="group peer text-sidebar-foreground hidden md:block"
              data-state={sidebar.state}
              data-collapsible={
                sidebar.state === "collapsed" ? merged.collapsible : ""
              }
              data-variant={merged.variant}
              data-side={merged.side}
              data-slot="sidebar"
            >
              {/* This is what handles the sidebar gap on desktop */}
              <div
                data-slot="sidebar-gap"
                class={cn(
                  "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                  "group-data-[collapsible=offcanvas]:w-0",
                  "group-data-[side=right]:rotate-180",
                  merged.variant === "floating" || merged.variant === "inset"
                    ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                    : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
                )}
              />
              <div
                data-slot="sidebar-container"
                data-side={merged.side}
                class={cn(
                  "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:-left-(--sidebar-width) data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:-right-(--sidebar-width) md:flex",
                  // Adjust the padding for floating and inset variants.
                  merged.variant === "floating" || merged.variant === "inset"
                    ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                    : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
                  merged.class
                )}
                {...rest}
              >
                <div
                  data-sidebar="sidebar"
                  data-slot="sidebar-inner"
                  class="bg-sidebar group-data-[variant=floating]:ring-sidebar-border flex size-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1"
                >
                  {merged.children}
                </div>
              </div>
            </div>
          }
        >
          {
            <Sheet
              isOpen={sidebar.openMobile}
              onOpenChange={sidebar.setOpenMobile}
              data-sidebar="sidebar"
              data-slot="sidebar"
              data-mobile="true"
              class="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
              style={{
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              }}
              side={merged.side}
              {...rest}
            >
              <SheetHeader class="sr-only">
                <SheetTitle>Sidebar</SheetTitle>
                <SheetDescription>
                  Displays the mobile sidebar.
                </SheetDescription>
              </SheetHeader>
              <div class="flex h-full w-full flex-col">{merged.children}</div>
            </Sheet>
          }
        </Show>
      }
    >
      {
        <div
          data-slot="sidebar"
          class={cn(
            "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
            merged.class
          )}
          {...rest}
        >
          {merged.children}
        </div>
      }
    </Show>
  );
}

function SidebarTrigger(props: ComponentProps<typeof Button>) {
  const rest = omit(props, "class", "onPress");
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      class={cn("", props.class)}
      onPress={(event) => {
        props.onPress?.(event);
        toggleSidebar();
      }}
      {...rest}
    >
      <PanelLeftIcon class="rtl:rotate-180" />
      <span class="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail(props: ComponentProps<"button">) {
  const rest = omit(props, "class");
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabindex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      class={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:inset-s-1/2 after:w-0.5 sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        props.class
      )}
      {...rest}
    />
  );
}

function SidebarInset(props: ComponentProps<"main">) {
  const rest = omit(props, "class");

  return (
    <main
      data-slot="sidebar-inset"
      class={cn(
        "bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        props.class
      )}
      {...rest}
    />
  );
}

function SidebarInput(props: ComponentProps<typeof Input>) {
  const rest = omit(props, "class");

  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      class={cn("bg-background h-8 w-full shadow-none", props.class)}
      {...rest}
    />
  );
}

function SidebarHeader(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      class={cn("flex flex-col gap-2 p-2", props.class)}
      {...rest}
    />
  );
}

function SidebarFooter(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      class={cn("flex flex-col gap-2 p-2", props.class)}
      {...rest}
    />
  );
}

function SidebarSeparator(props: ComponentProps<typeof Separator>) {
  const rest = omit(props, "class");

  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      class={cn("bg-sidebar-border mx-2 w-auto", props.class)}
      {...rest}
    />
  );
}

function SidebarContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      class={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        props.class
      )}
      {...rest}
    />
  );
}

function SidebarGroup(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      class={cn("relative flex w-full min-w-0 flex-col p-2", props.class)}
      {...rest}
    />
  );
}

function SidebarGroupLabel(
  props: JSX.HTMLAttributes<HTMLElement> & {
    elementType?: "div" | "span" | "h2" | "h3";
  }
) {
  const merged = merge({ elementType: "div" } as const, props);
  const rest = omit(merged, "class", "elementType");
  const Label = dynamic(() => merged.elementType);

  return (
    <Label
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      class={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        merged.class
      )}
      {...rest}
    />
  );
}

function SidebarGroupAction(props: ComponentProps<"button">) {
  const rest = omit(props, "class");

  return (
    <button
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      class={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
        props.class
      )}
      {...rest}
    />
  );
}

function SidebarGroupContent(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      class={cn("w-full text-sm", props.class)}
      {...rest}
    />
  );
}

function SidebarMenu(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-menu"
      data-sidebar="menu"
      class={cn("flex w-full min-w-0 flex-col gap-0", props.class)}
      {...rest}
    />
  );
}

function SidebarMenuItem(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      class={cn("group/menu-item relative", props.class)}
      {...rest}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground aria-expanded:hover:bg-sidebar-accent aria-expanded:hover:text-sidebar-accent-foreground peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:font-medium [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-8 text-sm",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
        sm: "h-7 text-xs",
      },
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_var(--sidebar-border)] hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
    },
  }
);

function SidebarMenuButton(
  props: SidebarButtonProps & {
    isActive?: boolean;
    tooltip?: string | ComponentProps<typeof Tooltip>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
) {
  const merged = merge(
    { isActive: false, size: "default", variant: "default" } as const,
    props
  );

  const rest = omit(merged, "isActive", "variant", "size", "tooltip", "class");
  const sidebar = useSidebar();

  const MenuButton = dynamic(() =>
    merged.href === undefined ? ButtonPrimitive : LinkPrimitive
  );

  const button = () => (
    <MenuButton
      {...rest}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={merged.size}
      data-active={merged.isActive}
      class={cn(
        sidebarMenuButtonVariants({
          size: merged.size,
          variant: merged.variant,
        }),
        merged.class
      )}
    />
  );

  return (
    <Show when={merged.tooltip} fallback={button()}>
      <TooltipTrigger
        isDisabled={sidebar.state !== "collapsed" || sidebar.isMobile}
      >
        {button()}
        <Tooltip
          placement="right"
          {...(typeof merged.tooltip === "string"
            ? { children: merged.tooltip }
            : merged.tooltip)}
        />
      </TooltipTrigger>
    </Show>
  );
}

function SidebarMenuAction(
  props: ButtonProps & {
    showOnHover?: boolean;
  }
) {
  const merged = merge({ showOnHover: false } as const, props);
  const rest = omit(merged, "class", "showOnHover");

  return (
    <ButtonPrimitive
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      class={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
        merged.showOnHover &&
          "peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 md:opacity-0",
        merged.class
      )}
      {...rest}
    />
  );
}

function SidebarMenuBadge(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      class={cn(
        "text-sidebar-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1",
        props.class
      )}
      {...rest}
    />
  );
}

function SidebarMenuSkeleton(
  props: ComponentProps<"div"> & {
    showIcon?: boolean;
  }
) {
  const merged = merge({ showIcon: false } as const, props);
  const rest = omit(merged, "class", "showIcon");
  // Random width between 50 to 90%.
  const width = "70%";

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      class={cn("flex h-8 items-center gap-2 rounded-md px-2", merged.class)}
      {...rest}
    >
      {merged.showIcon && (
        <Skeleton class="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        class="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={{
          "--skeleton-width": width,
        }}
      />
    </div>
  );
}

function SidebarMenuSub(props: ComponentProps<"ul">) {
  const rest = omit(props, "class");

  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      class={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        props.class
      )}
      {...rest}
    />
  );
}

function SidebarMenuSubItem(props: ComponentProps<"li">) {
  const rest = omit(props, "class");

  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      class={cn("group/menu-sub-item relative", props.class)}
      {...rest}
    />
  );
}

function SidebarMenuSubButton(
  props: SidebarButtonProps & {
    size?: "sm" | "md";
    isActive?: boolean;
  }
) {
  const merged = merge({ isActive: false, size: "md" } as const, props);
  const rest = omit(merged, "size", "isActive", "class");

  return (
    <>
      {rest.href === undefined ? (
        <ButtonPrimitive
          data-slot="sidebar-menu-sub-button"
          data-sidebar="menu-sub-button"
          data-size={merged.size}
          data-active={merged.isActive}
          class={cn(
            "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden group-data-[collapsible=icon]:hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
            merged.class
          )}
          {...rest}
        />
      ) : (
        <LinkPrimitive
          data-slot="sidebar-menu-sub-button"
          data-sidebar="menu-sub-button"
          data-size={merged.size}
          data-active={merged.isActive}
          class={cn(
            "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden group-data-[collapsible=icon]:hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
            merged.class
          )}
          {...rest}
        />
      )}
    </>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
