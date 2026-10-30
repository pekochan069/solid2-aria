/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/dropdown-menu.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon, ChevronRightIcon } from "@lucide/solid";
import {
  composeRenderProps,
  Header as HeaderPrimitive,
  MenuItem as MenuItemPrimitive,
  Menu as MenuPrimitive,
  MenuSection as MenuSectionPrimitive,
  MenuTrigger as MenuTriggerPrimitive,
  Popover as PopoverPrimitive,
  Separator as SeparatorPrimitive,
  SubmenuTrigger as SubmenuTriggerPrimitive,
} from "@solid2-aria/components";
import type {
  MenuItemProps as MenuItemPrimitiveProps,
  MenuSectionProps as MenuSectionPrimitiveProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cva } from "class-variance-authority";
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

function DropdownMenuTrigger(
  props: ComponentProps<typeof MenuTriggerPrimitive>
) {
  return <MenuTriggerPrimitive data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenu(
  props: Omit<
    ComponentProps<typeof MenuPrimitive<object>>,
    "children" | "class"
  > &
    Pick<
      ComponentProps<typeof PopoverPrimitive>,
      "placement" | "offset" | "crossOffset"
    > & {
      "data-slot"?: string;
      class?: string;
      children?: JSX.Element;
    }
) {
  const merged = merge(
    {
      crossOffset: 0,
      "data-slot": "dropdown-menu-content",
      offset: 4,
      placement: "bottom start",
    } as const,
    props
  );

  const rest = omit(
    merged,
    "data-slot",
    "placement",
    "offset",
    "crossOffset",
    "class",
    "children"
  );

  return (
    <PopoverPrimitive
      data-slot={merged["data-slot"]}
      placement={merged.placement}
      offset={merged.offset}
      crossOffset={merged.crossOffset}
      class={cn(
        "data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 data-exiting:zoom-out-95 data-entering:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground **:data-[slot$=-item]:data-focused:bg-foreground/10 cn-menu-target cn-menu-translucent z-50 w-(--trigger-width) min-w-32 origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 duration-100 outline-none data-exiting:overflow-hidden",
        merged.class
      )}
    >
      <MenuPrimitive
        class="max-h-[inherit] overflow-x-hidden overflow-y-auto outline-hidden"
        {...rest}
      >
        {merged.children}
      </MenuPrimitive>
    </PopoverPrimitive>
  );
}

function DropdownMenuGroup(
  props: Omit<MenuSectionPrimitiveProps<object>, "children"> & {
    children?: JSX.Element;
  }
) {
  return <MenuSectionPrimitive data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel(
  props: ComponentProps<typeof HeaderPrimitive> & {
    inset?: boolean;
  }
) {
  const rest = omit(props, "class", "inset");

  return (
    <HeaderPrimitive
      data-slot="dropdown-menu-label"
      data-inset={props.inset}
      class={cn(
        "text-muted-foreground px-1.5 py-1 text-xs font-medium data-inset:pl-7",
        props.class
      )}
      {...rest}
    />
  );
}

const dropdownMenuItemVariants = cva(
  "group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      selectionMode: {
        multiple:
          "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
        none: "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
        single:
          "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
      },
    },
  }
);

function DropdownMenuItem(
  props: MenuItemPrimitiveProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "inset", "variant", "children");

  return (
    <MenuItemPrimitive
      data-slot="dropdown-menu-item"
      data-inset={merged.inset}
      data-variant={merged.variant}
      textValue={
        typeof merged.children === "string" ? merged.children : rest.textValue
      }
      class={composeRenderProps(merged.class, (classValue, renderProps0) =>
        cn(
          dropdownMenuItemVariants({
            selectionMode: renderProps0.selectionMode,
          }),
          classValue
        )
      )}
      {...rest}
    >
      {composeRenderProps(merged.children, (children, renderProps1) => (
        <>
          {renderProps1.selectionMode === "none" ? null : (
            <span
              class="pointer-events-none absolute right-2 flex items-center justify-center"
              data-slot={
                renderProps1.selectionMode === "single"
                  ? "dropdown-menu-radio-item-indicator"
                  : "dropdown-menu-checkbox-item-indicator"
              }
            >
              {renderProps1.isSelected ? <CheckIcon /> : null}
            </span>
          )}
          {children}
        </>
      ))}
    </MenuItemPrimitive>
  );
}

function DropdownMenuSub(
  props: ComponentProps<typeof SubmenuTriggerPrimitive>
) {
  return <SubmenuTriggerPrimitive data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger(
  props: MenuItemPrimitiveProps & {
    inset?: boolean;
  }
) {
  const rest = omit(props, "class", "inset", "children");

  return (
    <MenuItemPrimitive
      data-slot="dropdown-menu-sub-trigger"
      data-inset={props.inset}
      textValue={
        typeof props.children === "string" ? props.children : rest.textValue
      }
      class={cn(
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <ChevronRightIcon class="ml-auto rtl:rotate-180" />
        </>
      ))}
    </MenuItemPrimitive>
  );
}

function DropdownMenuSubContent(props: ComponentProps<typeof DropdownMenu>) {
  const merged = merge(
    { crossOffset: -3, offset: 0, placement: "end top" } as const,
    props
  );

  const rest = omit(merged, "placement", "crossOffset", "offset", "class");

  return (
    <DropdownMenu
      data-slot="dropdown-menu-sub-content"
      class={cn(
        "ring-foreground/10 bg-popover text-popover-foreground cn-menu-target cn-menu-translucent w-auto min-w-[96px] rounded-lg p-1 shadow-lg ring-1 duration-100",
        merged.class
      )}
      placement={merged.placement}
      crossOffset={merged.crossOffset}
      offset={merged.offset}
      {...rest}
    />
  );
}

function DropdownMenuSeparator(
  props: ComponentProps<typeof SeparatorPrimitive>
) {
  const rest = omit(props, "class");

  return (
    <SeparatorPrimitive
      data-slot="dropdown-menu-separator"
      class={cn("bg-border -mx-1 my-1 h-px", props.class)}
      {...rest}
    />
  );
}

function DropdownMenuShortcut(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn(
        "text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
