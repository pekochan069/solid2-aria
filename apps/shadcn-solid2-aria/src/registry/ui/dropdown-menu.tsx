/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/dropdown-menu.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";

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
        "cn-dropdown-menu-content-aria cn-menu-target cn-menu-translucent cn-menu-translucent-aria z-50 w-(--trigger-width) origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto outline-none data-exiting:overflow-hidden",
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
      class={cn("cn-dropdown-menu-label", props.class)}
      {...rest}
    />
  );
}

const dropdownMenuItemVariants = cva(
  "group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      selectionMode: {
        multiple: "cn-dropdown-menu-checkbox-item",
        none: "cn-dropdown-menu-item",
        single: "cn-dropdown-menu-radio-item",
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
              class="cn-dropdown-menu-item-indicator pointer-events-none"
              data-slot={
                renderProps1.selectionMode === "single"
                  ? "dropdown-menu-radio-item-indicator"
                  : "dropdown-menu-checkbox-item-indicator"
              }
            >
              {renderProps1.isSelected ? (
                <IconPlaceholder
                  lucide="CheckIcon"
                  tabler="IconCheck"
                  hugeicons="Tick02Icon"
                  phosphor="CheckIcon"
                  remixicon="RiCheckLine"
                />
              ) : null}
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
        "cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <IconPlaceholder
            lucide="ChevronRightIcon"
            tabler="IconChevronRight"
            hugeicons="ArrowRight01Icon"
            phosphor="CaretRightIcon"
            remixicon="RiArrowRightSLine"
            class="cn-rtl-flip ml-auto"
          />
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
        "cn-dropdown-menu-sub-content-aria cn-menu-target cn-menu-translucent w-auto",
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
      class={cn("cn-dropdown-menu-separator", props.class)}
      {...rest}
    />
  );
}

function DropdownMenuShortcut(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn("cn-dropdown-menu-shortcut", props.class)}
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
