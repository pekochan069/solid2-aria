/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/select.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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

import { IconPlaceholder } from "../lib/icon-placeholder";
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
      class={cn("cn-select-group", props.class)}
      {...rest}
    />
  );
}

function SelectValue<T extends object>(props: SelectValueProps<T>) {
  const rest = omit(props, "class", "children");

  return (
    <SelectValuePrimitive
      data-slot="select-value"
      class={cn("cn-select-value cn-select-value-aria", props.class)}
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
        "cn-select-trigger flex w-full items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        merged.class
      )}
      {...rest}
    >
      {merged.children}
      <IconPlaceholder
        lucide="ChevronDownIcon"
        tabler="IconSelector"
        hugeicons="UnfoldMoreIcon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
        class="cn-select-trigger-icon pointer-events-none"
      />
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
        "cn-select-content-aria cn-menu-target cn-menu-translucent cn-menu-translucent-aria relative isolate z-50 w-(--trigger-width) origin-(--trigger-anchor-point) overflow-hidden outline-none",
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
          <IconPlaceholder
            lucide="SearchIcon"
            tabler="IconSearch"
            hugeicons="SearchIcon"
            phosphor="MagnifyingGlassIcon"
            remixicon="RiSearchLine"
            class="cn-command-input-icon"
          />
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
      class={cn("cn-select-label", props.class)}
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
        "cn-select-item cn-select-item-aria relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps1) => (
        <>
          <span class="cn-select-item-text shrink-0 whitespace-nowrap">
            {children}
          </span>
          <span class="cn-select-item-indicator">
            {renderProps1.isSelected ? (
              <IconPlaceholder
                lucide="CheckIcon"
                tabler="IconCheck"
                hugeicons="Tick02Icon"
                phosphor="CheckIcon"
                remixicon="RiCheckLine"
                class="cn-select-item-indicator-icon pointer-events-none"
              />
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
      class={cn("cn-select-separator pointer-events-none", props.class)}
      {...rest}
    />
  );
}

function SelectEmpty(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="select-empty"
      class={cn("cn-select-empty-aria", props.class)}
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
