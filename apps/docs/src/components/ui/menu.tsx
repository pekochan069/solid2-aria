import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
} from "@solid2-aria/components/menu";
import type {
  MenuProps as AriaMenuProps,
  MenuItemProps as AriaMenuItemProps,
  MenuTriggerProps as AriaMenuTriggerProps,
} from "@solid2-aria/components/menu";
import { Popover as AriaPopover } from "@solid2-aria/components/popover";
import { composeRenderProps } from "@solid2-aria/components/utils";
import type { ComponentProps, JSX } from "@solidjs/web";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { omit } from "solid-js";

import { CheckIcon } from "#icons/runeicons/check";

export function MenuTrigger(props: AriaMenuTriggerProps) {
  return <AriaMenuTrigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function Menu<T extends object = object>(
  props: AriaMenuProps<T> &
    Pick<
      ComponentProps<typeof AriaPopover>,
      "placement" | "offset" | "crossOffset"
    > & {
      "data-slot"?: string;
      children?: JSX.Element;
    }
) {
  const rest = omit(props, "class", "placement", "data-slot", "children");

  return (
    <AriaPopover
      data-slot={props["data-slot"]}
      placement={props.placement}
      offset={props.offset}
      crossOffset={props.crossOffset}
      class={cn(
        "bg-popover text-popover-foreground ring-foreground/10 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 **:data-[slot$=-item]:data-focused:bg-foreground/10 z-50 w-(--trigger-width) min-w-32 origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 duration-100 outline-none data-exiting:overflow-hidden",
        props.class
      )}
    >
      <AriaMenu {...rest}>{props.children}</AriaMenu>
    </AriaPopover>
  );
}

const menuItemVariants = cva(
  "group/menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      selectionMode: {
        multiple:
          "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
        none: "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:text-destructive gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
        single:
          "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
      },
    },
  }
);

export function MenuItem(
  props: AriaMenuItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
) {
  const rest = omit(
    props,
    "inset",
    "variant",
    "class",
    "children",
    "textValue"
  );

  return (
    <AriaMenuItem
      data-slot="dropdown-menu-item"
      data-inset={props.inset}
      data-variant={props.variant}
      textValue={
        typeof props.children === "string" ? props.children : props.textValue
      }
      class={composeRenderProps(props.class, (className, { selectionMode }) =>
        cn(menuItemVariants({ selectionMode }), className)
      )}
      {...rest}
    >
      {composeRenderProps(
        props.children,
        (children, { isSelected, selectionMode }) => (
          <>
            {selectionMode === "none" ? null : (
              <span
                class="pointer-events-none absolute right-2 flex items-center justify-center"
                data-slot={
                  selectionMode === "single"
                    ? "dropdown-menu-radio-item-indicator"
                    : "dropdown-menu-checkbox-item-indicator"
                }
              >
                {isSelected ? <CheckIcon /> : null}
              </span>
            )}
            {children}
          </>
        )
      )}
    </AriaMenuItem>
  );
}
