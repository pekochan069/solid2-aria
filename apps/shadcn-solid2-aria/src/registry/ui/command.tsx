/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/command.tsx.
 * Modified for Solid Aria: Solid boolean data selectors, Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import {
  Autocomplete,
  Collection,
  composeRenderProps,
  Header,
  Input,
  Menu,
  MenuItem,
  MenuSection,
  SearchField,
  Separator,
  createFilter,
} from "@solid2-aria/components";
import type {
  AutocompleteProps,
  InputProps,
  MenuItemProps,
  MenuProps,
  MenuSectionProps,
  SeparatorProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { merge, omit } from "solid-js";

import { IconPlaceholder } from "../lib/icon-placeholder";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { InputGroup, InputGroupAddon } from "./input-group";

function Command(
  props: Omit<AutocompleteProps, "class" | "style"> & {
    class?: string;
    dir?: JSX.IntrinsicElements["div"]["dir"];
    style?: JSX.CSSProperties;
  }
) {
  const rest = omit(props, "class", "dir", "style");
  const { contains } = createFilter({ sensitivity: "base" });

  return (
    <div
      data-slot="command"
      dir={props.dir}
      class={cn(
        "cn-command flex size-full flex-col overflow-hidden",
        props.class
      )}
      style={props.style}
    >
      <Autocomplete {...rest} filter={rest.filter ?? contains}>
        {rest.children}
      </Autocomplete>
    </div>
  );
}

function CommandDialog(
  props: Omit<
    ComponentProps<typeof Dialog>,
    "children" | "class" | "isOpen" | "onOpenChange"
  > & {
    title?: string;
    description?: string;
    open?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    class?: string;
    showCloseButton?: boolean;
    children: JSX.Element;
  }
) {
  const merged = merge(
    {
      description: "Search for a command to run...",
      showCloseButton: false,
      title: "Command Palette",
    } as const,
    props
  );

  const rest = omit(
    merged,
    "title",
    "description",
    "children",
    "open",
    "onOpenChange",
    "class",
    "showCloseButton"
  );

  return (
    <Dialog
      isOpen={merged.open}
      onOpenChange={merged.onOpenChange}
      class={cn(
        "cn-command-dialog top-1/3 translate-y-0 overflow-hidden p-0",
        merged.class
      )}
      showCloseButton={merged.showCloseButton}
      isDismissable
      {...rest}
    >
      <DialogHeader class="sr-only">
        <DialogTitle>{merged.title}</DialogTitle>
        <DialogDescription>{merged.description}</DialogDescription>
      </DialogHeader>
      {merged.children}
    </Dialog>
  );
}

function CommandInput(props: InputProps) {
  const rest = omit(props, "class");

  return (
    <SearchField
      autoFocus
      aria-label={
        typeof rest.placeholder === "string" && rest.placeholder !== ""
          ? rest.placeholder
          : "Search"
      }
      data-slot="command-input-wrapper"
      class="cn-command-input-wrapper"
    >
      <InputGroup class="cn-command-input-group">
        <Input
          {...rest}
          data-slot="command-input"
          class={cn(
            "cn-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden",
            props.class
          )}
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

function CommandList<T extends object>(props: MenuProps<T>) {
  const rest = omit(props, "class");

  return (
    <Menu
      {...rest}
      data-slot="command-list"
      class={cn(
        "cn-command-list overflow-x-hidden overflow-y-auto",
        props.class
      )}
    />
  );
}

function CommandEmpty(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="command-empty"
      class={cn("cn-command-empty", props.class)}
      {...rest}
    />
  );
}

function CommandGroup<T extends object>(
  props: MenuSectionProps<T> & {
    heading?: string;
  }
) {
  const rest = omit(props, "class", "children", "items", "heading");

  return (
    <MenuSection
      data-slot="command-group"
      class={cn("cn-command-group", props.class)}
      {...rest}
    >
      {Boolean(props.heading) && (
        <Header cmdk-group-heading="">{props.heading}</Header>
      )}
      <Collection items={props.items}>{props.children}</Collection>
    </MenuSection>
  );
}

function CommandSeparator(props: SeparatorProps) {
  const rest = omit(props, "class");

  return (
    <Separator
      data-slot="command-separator"
      class={cn("cn-command-separator border-0", props.class)}
      {...rest}
    />
  );
}

function CommandItem<T extends object>(props: MenuItemProps<T>) {
  const rest = omit(props, "class", "children", "textValue");

  return (
    <MenuItem
      {...rest}
      data-slot="command-item"
      class={cn(
        "cn-command-item cn-command-item-aria group/command-item data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
      textValue={
        props.textValue ??
        (typeof props.children === "string" ? props.children : undefined)
      }
    >
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <IconPlaceholder
            lucide="CheckIcon"
            tabler="IconCheck"
            hugeicons="Tick02Icon"
            phosphor="CheckIcon"
            remixicon="RiCheckLine"
            class="cn-command-item-indicator ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked]/command-item:opacity-100"
          />
        </>
      ))}
    </MenuItem>
  );
}

function CommandShortcut(props: ComponentProps<"span">) {
  const rest = omit(props, "class");

  return (
    <span
      data-slot="command-shortcut"
      class={cn("cn-command-shortcut cn-command-shortcut-aria", props.class)}
      {...rest}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
