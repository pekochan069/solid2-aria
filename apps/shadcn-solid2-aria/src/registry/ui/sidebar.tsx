/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/sidebar.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Button as ButtonPrimitive,
  Link as LinkPrimitive,
} from "@solid2-aria/components";
import type { ButtonProps, LinkProps } from "@solid2-aria/components";
import { dynamic } from "@solidjs/web";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import {
  createSignal,
  onSettled,
  Show,
  merge,
  omit,
  useContext,
  createContext,
} from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
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
                  "cn-sidebar-gap relative w-(--sidebar-width) bg-transparent",
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
                  class="cn-sidebar-inner flex size-full flex-col"
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
      class={cn("cn-sidebar-trigger", props.class)}
      onPress={(event) => {
        props.onPress?.(event);
        toggleSidebar();
      }}
      {...rest}
    >
      <IconPlaceholder
        lucide="PanelLeftIcon"
        tabler="IconLayoutSidebar"
        hugeicons="SidebarLeftIcon"
        phosphor="SidebarIcon"
        remixicon="RiSideBarLine"
        class="cn-rtl-flip"
      />
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
        "cn-sidebar-rail absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:inset-s-1/2 after:w-0.5 sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
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
        "cn-sidebar-inset relative flex w-full flex-1 flex-col",
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
      class={cn("cn-sidebar-input", props.class)}
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
      class={cn("cn-sidebar-header flex flex-col", props.class)}
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
      class={cn("cn-sidebar-footer flex flex-col", props.class)}
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
      class={cn("cn-sidebar-separator w-auto", props.class)}
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
        "cn-sidebar-content flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
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
      class={cn(
        "cn-sidebar-group relative flex w-full min-w-0 flex-col",
        props.class
      )}
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
        "cn-sidebar-group-label flex shrink-0 items-center outline-hidden [&>svg]:shrink-0",
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
        "cn-sidebar-group-action flex aspect-square items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0",
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
      class={cn("cn-sidebar-group-content w-full", props.class)}
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
      class={cn("cn-sidebar-menu flex w-full min-w-0 flex-col", props.class)}
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
  "cn-sidebar-menu-button cn-sidebar-menu-button-aria peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "cn-sidebar-menu-button-size-default",
        lg: "cn-sidebar-menu-button-size-lg",
        sm: "cn-sidebar-menu-button-size-sm",
      },
      variant: {
        default: "cn-sidebar-menu-button-variant-default",
        outline: "cn-sidebar-menu-button-variant-outline",
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
        "cn-sidebar-menu-action flex items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0",
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
        "cn-sidebar-menu-badge flex items-center justify-center tabular-nums select-none group-data-[collapsible=icon]:hidden",
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
      class={cn("cn-sidebar-menu-skeleton flex items-center", merged.class)}
      {...rest}
    >
      {merged.showIcon && (
        <Skeleton
          class="cn-sidebar-menu-skeleton-icon"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        class="cn-sidebar-menu-skeleton-text max-w-(--skeleton-width) flex-1"
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
      class={cn("cn-sidebar-menu-sub flex min-w-0 flex-col", props.class)}
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
            "cn-sidebar-menu-sub-button flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0",
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
            "cn-sidebar-menu-sub-button flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0",
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
