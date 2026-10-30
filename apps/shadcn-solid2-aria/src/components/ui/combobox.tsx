/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/combobox.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Generated for docs with nova styling from apps/v4/registry/styles/style-nova.css.
 * Regenerate with bun run generate:ui; local edits are replaced.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { CheckIcon, ChevronDownIcon, XIcon } from "@lucide/solid";
import {
  Button as ButtonPrimitive,
  ComboBoxStateContext,
  ComboBoxValue as ComboBoxValuePrimitive,
  composeRenderProps,
  Group,
  Header as HeaderPrimitive,
  Input as InputPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
  ListBoxSection as ListBoxSectionPrimitive,
  Popover as PopoverPrimitive,
  Separator as SeparatorPrimitive,
  TagGroup as TagGroupPrimitive,
  TagList as TagListPrimitive,
  Tag as TagPrimitive,
} from "@solid2-aria/components";
import type {
  ButtonProps,
  ComboBoxValueProps,
  GroupProps,
  HeaderProps,
  InputProps,
  ListBoxItemProps,
  ListBoxProps,
  ListBoxSectionProps,
  SeparatorProps,
  TagListProps,
  TagProps,
} from "@solid2-aria/components";
import type { JSX, ComponentProps } from "@solidjs/web";
import { cn } from "cn";
import { createSignal, merge, omit, useContext } from "solid-js";

import { Button } from "./button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";

function ComboboxValue<T>(props: ComboBoxValueProps<T>) {
  return <ComboBoxValuePrimitive data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger(
  props: Omit<ButtonProps, "children"> & {
    children?: JSX.Element;
  }
) {
  const rest = omit(props, "class", "children");

  return (
    <ButtonPrimitive
      data-slot="combobox-trigger"
      class={cn("[&_svg:not([class*='size-'])]:size-4", props.class)}
      {...rest}
    >
      {props.children}
      <ChevronDownIcon class="text-muted-foreground pointer-events-none size-4" />
    </ButtonPrimitive>
  );
}

function ComboboxClear(props: ComponentProps<typeof InputGroupButton>) {
  const rest = omit(props, "class");
  const state = useContext(ComboBoxStateContext);

  return (
    <InputGroupButton
      data-slot="combobox-clear"
      variant="ghost"
      size="icon-xs"
      aria-label="Clear"
      class={cn("", state?.inputValue === "" && "hidden", props.class)}
      onPress={() => {
        state?.setValue(null);
      }}
      slot={null}
      {...rest}
    >
      <XIcon class="pointer-events-none" />
    </InputGroupButton>
  );
}

function ComboboxInput(
  props: ComponentProps<"input"> & {
    showTrigger?: boolean;
    showClear?: boolean;
  }
) {
  const merged = merge(
    { disabled: false, showClear: false, showTrigger: true } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "children",
    "disabled",
    "showTrigger",
    "showClear"
  );

  return (
    <InputGroup class={cn("w-auto", merged.class)}>
      <InputGroupInput disabled={Boolean(merged.disabled)} {...rest} />
      <InputGroupAddon align="inline-end">
        {merged.showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            data-slot="combobox-trigger"
            class="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent [&_svg:not([class*='size-'])]:size-4"
            isDisabled={Boolean(merged.disabled)}
          >
            <ChevronDownIcon class="text-muted-foreground pointer-events-none size-4" />
          </InputGroupButton>
        )}
        {merged.showClear && (
          <ComboboxClear isDisabled={Boolean(merged.disabled)} />
        )}
      </InputGroupAddon>
      {merged.children}
    </InputGroup>
  );
}

function ComboboxContent(
  props: Omit<ComponentProps<typeof PopoverPrimitive>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
    anchor?: () => HTMLDivElement | null;
  }
) {
  const merged = merge(
    { crossOffset: 0, offset: 6, placement: "bottom" } as const,
    props
  );

  const rest = omit(
    merged,
    "class",
    "placement",
    "offset",
    "crossOffset",
    "anchor"
  );

  return (
    <PopoverPrimitive
      data-slot="combobox-content"
      placement={merged.placement}
      offset={merged.offset}
      crossOffset={merged.crossOffset}
      triggerRef={merged.anchor}
      class={cn(
        "bg-popover text-popover-foreground data-entering:animate-in data-exiting:animate-out data-exiting:fade-out-0 data-entering:fade-in-0 data-exiting:zoom-out-95 data-entering:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 ring-foreground/10 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:border-input/30 **:data-[slot$=-item]:data-focused:bg-foreground/10 cn-menu-target cn-menu-translucent relative isolate z-50 max-h-72 w-(--trigger-width) min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-lg shadow-md ring-1 duration-100 outline-none *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none",
        merged.class
      )}
      {...rest}
    />
  );
}

function ComboboxList<T extends object>(props: ListBoxProps<T>) {
  const rest = omit(props, "class");

  return (
    <ListBoxPrimitive
      data-slot="combobox-list"
      class={cn(
        "no-scrollbar group/combobox-content max-h-[inherit] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        props.class
      )}
      {...rest}
    />
  );
}

function ComboboxItem<T extends object>(props: ListBoxItemProps<T>) {
  const rest = omit(props, "class", "children");

  return (
    <ListBoxItemPrimitive
      data-slot="combobox-item"
      textValue={
        typeof props.children === "string" ? props.children : undefined
      }
      class={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground data-focused:bg-accent data-focused:text-accent-foreground not-data-[variant=destructive]:data-focused:**:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps0) => (
        <>
          {children}
          <span class="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            {renderProps0.isSelected ? (
              <CheckIcon class="pointer-events-none" />
            ) : null}
          </span>
        </>
      ))}
    </ListBoxItemPrimitive>
  );
}

function ComboboxGroup<T extends object>(props: ListBoxSectionProps<T>) {
  const rest = omit(props, "class");

  return (
    <ListBoxSectionPrimitive
      data-slot="combobox-group"
      class={cn("", props.class)}
      {...rest}
    />
  );
}

function ComboboxLabel(props: HeaderProps) {
  const rest = omit(props, "class");

  return (
    <HeaderPrimitive
      data-slot="combobox-label"
      class={cn("text-muted-foreground px-2 py-1.5 text-xs", props.class)}
      {...rest}
    />
  );
}

function ComboboxEmpty(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="combobox-empty"
      class={cn(
        "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
        props.class
      )}
      {...rest}
    />
  );
}

function ComboboxSeparator(props: SeparatorProps) {
  const rest = omit(props, "class");

  return (
    <SeparatorPrimitive
      data-slot="combobox-separator"
      class={cn("bg-border -mx-1 my-1 h-px", props.class)}
      {...rest}
    />
  );
}

function ComboboxChips(props: GroupProps) {
  const rest = omit(props, "children", "class");

  return (
    <Group
      data-slot="combobox-chips"
      class={cn(
        "dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-8 flex-wrap items-center gap-1 rounded-lg border bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:ring-3 has-aria-invalid:ring-3 has-data-[slot=combobox-chip]:px-1",
        props.class
      )}
      {...rest}
    >
      {props.children}
    </Group>
  );
}

function ComboboxChipList<T extends object>(
  props: Omit<TagListProps<T>, "class" | "items"> & {
    class?: string;
  }
) {
  const rest = omit(props, "class");

  return (
    <ComboBoxValuePrimitive<T> class="contents">
      {(renderProps1) => (
        <TagGroupPrimitive
          aria-label="Selected items"
          data-slot="combobox-chip-list"
          class={cn("contents", props.class)}
          onRemove={(keys) => {
            const { value } = renderProps1.state;

            if (
              typeof value !== "string" &&
              typeof value !== "number" &&
              value !== null
            ) {
              renderProps1.state.setValue(value.filter((k) => !keys.has(k)));
            }
          }}
        >
          <TagListPrimitive
            class="contents"
            items={renderProps1.selectedItems.filter(
              (item) => item !== null && item !== undefined
            )}
            {...rest}
          />
        </TagGroupPrimitive>
      )}
    </ComboBoxValuePrimitive>
  );
}

function ComboboxChip(
  props: Omit<TagProps, "children"> & {
    showRemove?: boolean;
    children?: JSX.Element;
  }
) {
  const merged = merge({ showRemove: true } as const, props);
  const rest = omit(merged, "class", "children", "showRemove");

  return (
    <TagPrimitive
      data-slot="combobox-chip"
      class={cn(
        "bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        merged.class
      )}
      {...rest}
    >
      {merged.children}
      {merged.showRemove && (
        <Button
          slot="remove"
          variant="ghost"
          size="icon-xs"
          class="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon class="pointer-events-none" />
        </Button>
      )}
    </TagPrimitive>
  );
}

function ComboboxChipsInput(props: InputProps) {
  const rest = omit(props, "class");
  const state = useContext(ComboBoxStateContext);

  return (
    <InputPrimitive
      data-slot="combobox-chip-input"
      class={cn("min-w-16 flex-1 outline-none", props.class)}
      onKeyDown={(e) => {
        if (
          e.key === "Backspace" &&
          e.currentTarget.value === "" &&
          Array.isArray(state?.value) &&
          state.value.length > 0
        ) {
          e.preventDefault();
          state.setValue(state.value.slice(0, -1));
        }
      }}
      {...rest}
    />
  );
}

function useComboboxAnchor() {
  return createSignal<HTMLDivElement | null>(null, { ownedWrite: true });
}

export {
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};

export {
  Collection as ComboboxCollection,
  ComboBox as Combobox,
} from "@solid2-aria/components";
