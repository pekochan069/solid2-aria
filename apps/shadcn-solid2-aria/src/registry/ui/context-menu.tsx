/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/context-menu.tsx.
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

function ContextMenu(
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
      "data-slot": "context-menu-content",
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
        "cn-context-menu-content-aria cn-menu-target cn-menu-translucent cn-menu-translucent-aria z-50 w-(--trigger-width) origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto outline-none data-exiting:overflow-hidden",
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

function ContextMenuTrigger(
  props: Omit<ComponentProps<typeof MenuTriggerPrimitive>, "trigger">
) {
  return (
    <MenuTriggerPrimitive
      data-slot="context-menu"
      trigger="contextMenu"
      {...props}
    />
  );
}

function ContextMenuGroup(
  props: Omit<MenuSectionPrimitiveProps<object>, "children"> & {
    children?: JSX.Element;
  }
) {
  return <MenuSectionPrimitive data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel(
  props: ComponentProps<typeof HeaderPrimitive> & {
    inset?: boolean;
  }
) {
  const rest = omit(props, "class", "inset");

  return (
    <HeaderPrimitive
      data-slot="context-menu-label"
      data-inset={props.inset}
      class={cn("cn-context-menu-label", props.class)}
      {...rest}
    />
  );
}

const contextMenuItemVariants = cva(
  "group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      selectionMode: {
        multiple: "cn-context-menu-checkbox-item",
        none: "cn-context-menu-item",
        single: "cn-context-menu-radio-item",
      },
    },
  }
);

function ContextMenuItem(
  props: MenuItemPrimitiveProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
) {
  const merged = merge({ variant: "default" } as const, props);
  const rest = omit(merged, "class", "inset", "variant", "children");

  return (
    <MenuItemPrimitive
      data-slot="context-menu-item"
      data-inset={merged.inset}
      data-variant={merged.variant}
      textValue={
        typeof merged.children === "string" ? merged.children : rest.textValue
      }
      class={composeRenderProps(merged.class, (classValue, renderProps0) =>
        cn(
          contextMenuItemVariants({
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
              class="cn-context-menu-item-indicator pointer-events-none"
              data-slot={
                renderProps1.selectionMode === "single"
                  ? "context-menu-radio-item-indicator"
                  : "context-menu-checkbox-item-indicator"
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

function ContextMenuSub(props: ComponentProps<typeof SubmenuTriggerPrimitive>) {
  return <SubmenuTriggerPrimitive data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger(
  props: MenuItemPrimitiveProps & {
    inset?: boolean;
  }
) {
  const rest = omit(props, "class", "inset", "children");

  return (
    <MenuItemPrimitive
      data-slot="context-menu-sub-trigger"
      data-inset={props.inset}
      textValue={
        typeof props.children === "string" ? props.children : rest.textValue
      }
      class={cn(
        "cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
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

function ContextMenuSubContent(props: ComponentProps<typeof ContextMenu>) {
  const merged = merge(
    { crossOffset: -3, offset: 0, placement: "end top" } as const,
    props
  );

  const rest = omit(merged, "placement", "crossOffset", "offset", "class");

  return (
    <ContextMenu
      data-slot="context-menu-sub-content"
      class={cn(
        "cn-context-menu-sub-content-aria cn-menu-target cn-menu-translucent w-auto",
        merged.class
      )}
      placement={merged.placement}
      crossOffset={merged.crossOffset}
      offset={merged.offset}
      {...rest}
    />
  );
}

function ContextMenuSeparator(
  props: ComponentProps<typeof SeparatorPrimitive>
) {
  const rest = omit(props, "class");

  return (
    <SeparatorPrimitive
      data-slot="context-menu-separator"
      class={cn("cn-context-menu-separator", props.class)}
      {...rest}
    />
  );
}

function ContextMenuShortcut(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="context-menu-shortcut"
      class={cn("cn-context-menu-shortcut", props.class)}
      {...rest}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
};
