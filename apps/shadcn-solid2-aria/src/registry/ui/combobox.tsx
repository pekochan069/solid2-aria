/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/registry/bases/aria/ui/combobox.tsx.
 * Modified for Solid Aria: Solid 2 reactive props, native JSX, Solid Aria primitives, and Lucide icons.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

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

import { IconPlaceholder } from "../lib/icon-placeholder";
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
      class={cn("cn-combobox-trigger", props.class)}
      {...rest}
    >
      {props.children}
      <IconPlaceholder
        lucide="ChevronDownIcon"
        tabler="IconChevronDown"
        hugeicons="ArrowDown01Icon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
        class="cn-combobox-trigger-icon pointer-events-none"
      />
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
      class={cn(
        "cn-combobox-clear",
        state?.inputValue === "" && "hidden",
        props.class
      )}
      onPress={() => {
        state?.setValue(null);
      }}
      slot={null}
      {...rest}
    >
      <IconPlaceholder
        lucide="XIcon"
        tabler="IconX"
        hugeicons="Cancel01Icon"
        phosphor="XIcon"
        remixicon="RiCloseLine"
        class="cn-combobox-clear-icon pointer-events-none"
      />
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
    <InputGroup class={cn("cn-combobox-input w-auto", merged.class)}>
      <InputGroupInput disabled={Boolean(merged.disabled)} {...rest} />
      <InputGroupAddon align="inline-end">
        {merged.showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            data-slot="combobox-trigger"
            class="cn-combobox-trigger group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            isDisabled={Boolean(merged.disabled)}
          >
            <IconPlaceholder
              lucide="ChevronDownIcon"
              tabler="IconChevronDown"
              hugeicons="ArrowDown01Icon"
              phosphor="CaretDownIcon"
              remixicon="RiArrowDownSLine"
              class="cn-combobox-trigger-icon pointer-events-none"
            />
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
        "cn-combobox-content-aria cn-menu-target cn-menu-translucent cn-menu-translucent-aria relative isolate z-50 w-(--trigger-width) origin-(--trigger-anchor-point) outline-none",
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
        "cn-combobox-list group/combobox-content max-h-[inherit] overflow-y-auto overscroll-contain",
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
        "cn-combobox-item cn-combobox-item-aria relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
      {...rest}
    >
      {composeRenderProps(props.children, (children, renderProps0) => (
        <>
          {children}
          <span class="cn-combobox-item-indicator">
            {renderProps0.isSelected ? (
              <IconPlaceholder
                lucide="CheckIcon"
                tabler="IconCheck"
                hugeicons="Tick02Icon"
                phosphor="CheckIcon"
                remixicon="RiCheckLine"
                class="cn-combobox-item-indicator-icon pointer-events-none"
              />
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
      class={cn("cn-combobox-group", props.class)}
      {...rest}
    />
  );
}

function ComboboxLabel(props: HeaderProps) {
  const rest = omit(props, "class");

  return (
    <HeaderPrimitive
      data-slot="combobox-label"
      class={cn("cn-combobox-label", props.class)}
      {...rest}
    />
  );
}

function ComboboxEmpty(props: ComponentProps<"div">) {
  const rest = omit(props, "class");

  return (
    <div
      data-slot="combobox-empty"
      class={cn("cn-combobox-empty", props.class)}
      {...rest}
    />
  );
}

function ComboboxSeparator(props: SeparatorProps) {
  const rest = omit(props, "class");

  return (
    <SeparatorPrimitive
      data-slot="combobox-separator"
      class={cn("cn-combobox-separator", props.class)}
      {...rest}
    />
  );
}

function ComboboxChips(props: GroupProps) {
  const rest = omit(props, "children", "class");

  return (
    <Group
      data-slot="combobox-chips"
      class={cn("cn-combobox-chips", props.class)}
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
        "cn-combobox-chip has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
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
          class="cn-combobox-chip-remove"
          data-slot="combobox-chip-remove"
        >
          <IconPlaceholder
            lucide="XIcon"
            tabler="IconX"
            hugeicons="Cancel01Icon"
            phosphor="XIcon"
            remixicon="RiCloseLine"
            class="cn-combobox-chip-indicator-icon pointer-events-none"
          />
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
      class={cn(
        "cn-combobox-chip-input min-w-16 flex-1 outline-none",
        props.class
      )}
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
