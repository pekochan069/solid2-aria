/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/command.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Maintained locally for the Solid Aria documentation site.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon, SearchIcon } from "@lucide/solid";
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
import { merge, omit } from "solid-js";

import { cn } from "#lib/cn";

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
        "bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-xl! p-1",
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
        "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
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
      class="p-1 pb-0"
    >
      <InputGroup class="bg-input/30 border-input/30 h-8! rounded-lg! shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <Input
          {...rest}
          data-slot="command-input"
          class={cn(
            "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden",
            props.class
          )}
        />
        <InputGroupAddon>
          <SearchIcon class="size-4 shrink-0 opacity-50" />
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
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
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
      class={cn("py-6 text-center text-sm", props.class)}
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
      class={cn(
        "text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
        props.class
      )}
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
      class={cn("bg-border -mx-1 h-px", props.class)}
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
        "data-selected:bg-muted data-selected:text-foreground data-selected:*:[svg]:text-foreground data-focused:bg-muted data-focused:text-foreground data-focused:*:[svg]:text-foreground group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
          <CheckIcon class="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
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
      class={cn(
        "text-muted-foreground group-data-selected/command-item:text-foreground group-data-focused/command-item:text-foreground ml-auto text-xs tracking-widest",
        props.class
      )}
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
