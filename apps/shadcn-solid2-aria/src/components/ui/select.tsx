/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/select.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon, ChevronDownIcon, SearchIcon } from "@lucide/solid";
import {
  Button as ButtonPrimitive,
  composeRenderProps,
  Header as HeaderPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
  ListBoxSection as ListBoxSectionPrimitive,
  Popover as PopoverPrimitive,
  SearchField,
  Select as SelectPrimitive,
  SelectValue as SelectValuePrimitive,
  Separator as SeparatorPrimitive,
} from "@solid2-aria/components";
import type {
  ListBoxProps,
  SearchFieldProps,
  ListBoxSectionProps as SelectGroupProps,
  SelectProps,
  SelectValueProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

function Select<T extends object, M extends "single" | "multiple" = "single">(
  props: SelectProps<T, M>
) {
  const rest = omit(props, "class");

  return (
    <SelectPrimitive
      data-slot="select"
      class={cn("w-fit", props.class)}
      {...rest}
    />
  );
}

function SelectGroup<T extends object>(props: SelectGroupProps<T>) {
  const rest = omit(props, "class");

  return (
    <ListBoxSectionPrimitive
      data-slot="select-group"
      class={cn("scroll-my-1 p-1", props.class)}
      {...rest}
    />
  );
}

function SelectValue<T extends object>(props: SelectValueProps<T>) {
  const rest = omit(props, "class", "children");

  return (
    <SelectValuePrimitive
      data-slot="select-value"
      class={cn(
        "data-placeholder:text-muted-foreground flex flex-1 text-left",
        props.class
      )}
      {...rest}
    >
      {typeof props.children === "function"
        ? props.children
        : (renderProps0) => (
            <>
              {renderProps0.selectedItems.length > 1
                ? renderProps0.selectedText
                : renderProps0.defaultChildren}
            </>
          )}
    </SelectValuePrimitive>
  );
}

function SelectTrigger(
  props: Omit<ComponentProps<typeof ButtonPrimitive>, "children"> & {
    children?: JSX.Element;
    size?: "sm" | "default";
  }
) {
  const merged = merge({ size: "default" } as const, props);
  const rest = omit(merged, "class", "size", "children");

  return (
    <ButtonPrimitive
      data-slot="select-trigger"
      data-size={merged.size}
      class={cn(
        "border-input data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 flex w-full items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        merged.class
      )}
      {...rest}
    >
      {merged.children}
      <ChevronDownIcon class="text-muted-foreground pointer-events-none size-4" />
    </ButtonPrimitive>
  );
}

function SelectContent(
  props: Omit<ComponentProps<typeof PopoverPrimitive>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
  }
) {
  const merged = merge(
    { crossOffset: 0, offset: 4, placement: "bottom" } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "children",
    "placement",
    "offset",
    "crossOffset"
  );

  return (
    <SelectPopover
      class={merged.class}
      placement={merged.placement}
      offset={merged.offset}
      crossOffset={merged.crossOffset}
      {...rest}
    >
      <SelectList>{merged.children}</SelectList>
    </SelectPopover>
  );
}

function SelectPopover(
  props: Omit<ComponentProps<typeof PopoverPrimitive>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
  }
) {
  const merged = merge(
    { crossOffset: 0, offset: 4, placement: "bottom start" } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "children",
    "placement",
    "offset",
    "crossOffset"
  );

  return (
    <PopoverPrimitive
      data-slot="select-content"
      placement={merged.placement}
      offset={merged.offset}
      crossOffset={merged.crossOffset}
      class={cn(
        "bg-popover text-popover-foreground data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 data-exiting:zoom-out-95 data-entering:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 ring-foreground/10 **:data-[slot$=-item]:data-focused:bg-foreground/10 cn-menu-target cn-menu-translucent relative isolate z-50 w-(--trigger-width) min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-lg shadow-md ring-1 duration-100 outline-none",
        merged.class
      )}
      {...rest}
    >
      {merged.children}
    </PopoverPrimitive>
  );
}

function SelectList<T extends object>(props: ListBoxProps<T>) {
  const rest = omit(props, "class");

  return (
    <ListBoxPrimitive
      data-slot="select-list"
      class={cn(
        "group/select-list max-h-[inherit] overflow-x-hidden overflow-y-auto p-0 outline-hidden",
        props.class
      )}
      {...rest}
    />
  );
}

function SelectInput(props: SearchFieldProps) {
  const rest = omit(props, "class");

  return (
    <SearchField
      {...rest}
      autoFocus
      data-slot="select-input-wrapper"
      class={cn("p-1 pb-0", props.class)}
    >
      <InputGroup>
        <InputGroupInput
          data-slot="select-input"
          class="[&::-webkit-search-cancel-button]:hidden"
        />
        <InputGroupAddon>
          <SearchIcon class="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </SearchField>
  );
}

function SelectLabel(props: ComponentProps<typeof HeaderPrimitive>) {
  const rest = omit(props, "class");

  return (
    <HeaderPrimitive
      data-slot="select-label"
      class={cn("text-muted-foreground px-1.5 py-1 text-xs", props.class)}
      {...rest}
    />
  );
}

function SelectItem(props: ComponentProps<typeof ListBoxItemPrimitive>) {
  const rest = omit(props, "class", "children");

  return (
    <ListBoxItemPrimitive
      data-slot="select-item"
      textValue={
        typeof props.children === "string" ? props.children : undefined
      }
      class={cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-focused:bg-accent data-focused:text-accent-foreground relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps1) => (
        <>
          <span class="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
            {children}
          </span>
          <span class="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            {renderProps1.isSelected ? (
              <CheckIcon class="pointer-events-none" />
            ) : null}
          </span>
        </>
      ))}
    </ListBoxItemPrimitive>
  );
}

function SelectSeparator(props: ComponentProps<typeof SeparatorPrimitive>) {
  const rest = omit(props, "class");

  return (
    <SeparatorPrimitive
      data-slot="select-separator"
      class={cn("bg-border pointer-events-none -mx-1 my-1 h-px", props.class)}
      {...rest}
    />
  );
}

function SelectEmpty(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="select-empty"
      class={cn(
        "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/select-list:flex",
        props.class
      )}
      {...rest}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectInput,
  SelectItem,
  SelectLabel,
  SelectList,
  SelectPopover,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectEmpty,
};
