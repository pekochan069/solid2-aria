/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-stately/src/combobox/useComboBoxState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  CollectionBase,
  CollectionStateBase,
  FocusableProps,
  FocusStrategy,
  HelpTextProps,
  InputBase,
  Key,
  LabelableProps,
  Node,
  Selection,
  TextInputBase,
  Validation,
  ValueBase,
} from "@solid2-aria/types-shared";
import {
  createMemo,
  createSignal,
  createRenderEffect,
  untrack,
  merge,
} from "solid-js";

import { getChildNodes } from "../collections/get-child-nodes";
import { createFormValidationState } from "../form/create-form-validation-state";
import type { FormValidationState } from "../form/create-form-validation-state";
import { createListState } from "../list/create-list-state";
import type { ListState } from "../list/create-list-state";
import { ListCollection } from "../list/list-collection";
import { createOverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import type { OverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import {
  getLegacyDefaultSelectedKey,
  getLegacySelectedKey,
  notifyLegacySelectionChange,
} from "../utils/legacy-props";

export type MenuTriggerAction = "focus" | "input" | "manual";

export type SelectionMode = "single" | "multiple";

export type ValueType<M extends SelectionMode> = M extends "single"
  ? Key | null
  : readonly Key[];

export type ChangeValueType<M extends SelectionMode> = M extends "single"
  ? Key | null
  : Key[];

type ValidationType<M extends SelectionMode> = M extends "single"
  ? Key | null
  : Key[];

export interface ComboBoxValidationValue<M extends SelectionMode = "single"> {
  /**
   * The selected key in the ComboBox.
   *
   * @deprecated
   */
  selectedKey: Key | null;
  /** The keys of the currently selected items. */
  value: ValidationType<M>;
  /** The value of the ComboBox input. */
  inputValue: string;
}

export interface ComboBoxProps<T, M extends SelectionMode = "single">
  extends
    CollectionBase<T>,
    InputBase,
    ValueBase<ValueType<M>, ChangeValueType<M>>,
    TextInputBase,
    Validation<ComboBoxValidationValue<M>>,
    FocusableProps<HTMLInputElement>,
    LabelableProps,
    HelpTextProps {
  /** The list of ComboBox items (uncontrolled). */
  defaultItems?: Iterable<T>;
  /** The list of ComboBox items (controlled). */
  items?: Iterable<T>;
  /**
   * Method that is called when the open state of the menu changes. Returns the new open state and
   * the action that caused the opening of the menu.
   */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void;
  /**
   * Whether single or multiple selection is enabled.
   *
   * @default 'single'
   */
  selectionMode?: M;
  /**
   * The currently selected key in the collection (controlled).
   *
   * @deprecated
   */
  selectedKey?: Key | null;
  /**
   * The initial selected key in the collection (uncontrolled).
   *
   * @deprecated
   */
  defaultSelectedKey?: Key | null;
  /**
   * Handler that is called when the selection changes.
   *
   * @deprecated
   */
  onSelectionChange?: (key: Key | null) => void;
  /** The value of the ComboBox input (controlled). */
  inputValue?: string;
  /** The default value of the ComboBox input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the ComboBox input value changes. */
  onInputChange?: (value: string) => void;
  /** Whether the ComboBox allows a non-item matching input value to be set. */
  allowsCustomValue?: boolean;
  // /**
  //  * Whether the Combobox should only suggest matching options or autocomplete the field with the nearest matching option.
  //  * @default 'suggest'
  //  */
  // completionMode?: 'suggest' | 'complete',
  /**
   * The interaction required to display the ComboBox menu.
   *
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction;
}

export interface ComboBoxState<T, M extends SelectionMode = "single">
  extends ListState<T>, OverlayTriggerState, FormValidationState {
  /**
   * The key for the first selected item.
   *
   * @deprecated
   */
  readonly selectedKey: Key | null;
  /**
   * The default selected key.
   *
   * @deprecated
   */
  readonly defaultSelectedKey: Key | null;
  /**
   * Sets the selected key.
   *
   * @deprecated
   */
  setSelectedKey: (key: Key | null) => void;
  /** The current combobox value. */
  readonly value: ValueType<M>;
  /** The default combobox value. */
  readonly defaultValue: ValueType<M>;
  /** Sets the combobox value. */
  setValue: (value: Key | readonly Key[] | null) => void;
  /**
   * The value of the first selected item.
   *
   * @deprecated
   */
  readonly selectedItem: Node<T> | null;
  /** The value of the selected items. */
  readonly selectedItems: Node<T>[];
  /** The current value of the combo box input. */
  inputValue: string;
  /** The default value of the combo box input. */
  defaultInputValue: string;
  /** Sets the value of the combo box input. */
  setInputValue: (value: string) => void;
  /** Selects the currently focused item and updates the input value. */
  commit: () => void;
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy | null;
  /** Whether the select is currently focused. */
  readonly isFocused: boolean;
  /** Sets whether the select is focused. */
  setFocused: (isFocused: boolean) => void;
  /** Opens the menu. */
  open: (
    focusStrategy?: FocusStrategy | null,
    trigger?: MenuTriggerAction
  ) => void;
  /** Toggles the menu. */
  toggle: (
    focusStrategy?: FocusStrategy | null,
    trigger?: MenuTriggerAction
  ) => void;
  /** Resets the input value to the previously selected item's text if any and closes the menu. */
  revert: () => void;
}

type FilterFn = (textValue: string, inputValue: string) => boolean;

export interface ComboBoxStateOptions<T, M extends SelectionMode = "single">
  extends Omit<ComboBoxProps<T, M>, "children">, CollectionStateBase<T> {
  /** The filter function used to determine if a option should be included in the combo box list. */
  defaultFilter?: FilterFn;
  /** Whether the combo box allows the menu to be open when the collection is empty. */
  allowsEmptyCollection?: boolean;
  /** Whether the combo box menu should close on blur. */
  shouldCloseOnBlur?: boolean;
}

/**
 * Provides state management for a combo box component. Handles building a collection of items from
 * props and manages the option selection state of the combo box. In addition, it tracks the input
 * value, focus state, and other properties of the combo box.
 */
export function createComboBoxState<
  T extends object,
  M extends SelectionMode = "single",
>(props: ComboBoxStateOptions<T, M>): ComboBoxState<T, M> {
  const defaultFilter = createMemo(() => props.defaultFilter);
  const menuTrigger = createMemo(() => props.menuTrigger ?? "input");

  const allowsEmptyCollection = createMemo(
    () => props.allowsEmptyCollection ?? false
  );

  const allowsCustomValue = createMemo(() => props.allowsCustomValue);
  const shouldCloseOnBlur = createMemo(() => props.shouldCloseOnBlur ?? true);

  const selectionMode = createMemo(() => props.selectionMode ?? "single");

  const [showAllItems, setShowAllItems] = createSignal(false, {
    ownedWrite: true,
  });

  const [isFocused, setFocusedState] = createSignal(false, {
    ownedWrite: true,
  });

  const [focusStrategy, setFocusStrategy] = createSignal<FocusStrategy | null>(
    null,
    { ownedWrite: true }
  );

  let closedDueToEmpty = false;

  const defaultValue = createMemo(() => {
    const currentSelectionMode = selectionMode();

    return (
      props.defaultValue ??
      (currentSelectionMode === "single"
        ? (getLegacyDefaultSelectedKey(props) ?? null)
        : [])
    );
  });

  const value = createMemo(() => {
    const currentSelectionMode = selectionMode();

    return (
      props.value ??
      (currentSelectionMode === "single"
        ? getLegacySelectedKey(props)
        : undefined)
    );
  });

  const [controlledValue, setControlledValue] = createControlledSignal<
    Key | readonly Key[] | null
  >(
    () => value(),
    untrack(() => defaultValue()),
    (localValue) => {
      const change = isKeyArray(localValue) ? [...localValue] : localValue;
      // SAFETY: setValue normalizes changes to the active selection mode.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      props.onChange?.(change as ChangeValueType<M>);
    }
  );

  // Only display the first selected item if in single selection mode but the value is an array.
  const displayValue = createMemo(() => {
    const currentSelectionMode = selectionMode();
    const currentControlledValue = controlledValue();

    return currentSelectionMode === "single" &&
      isKeyArray(currentControlledValue)
      ? (currentControlledValue[0] ?? null)
      : currentControlledValue;
  });

  const setValue = (localValue: Key | readonly Key[] | null) => {
    const currentSelectionMode = selectionMode();
    const currentDisplayValue = displayValue();

    if (currentSelectionMode === "single") {
      const key = isKeyArray(localValue) ? (localValue[0] ?? null) : localValue;
      setControlledValue(key);

      if (key !== currentDisplayValue) {
        notifyLegacySelectionChange(props, key);
      }
    } else {
      let keys: Key[] = [];

      if (isKeyArray(localValue)) {
        keys = [...localValue];
      } else if (localValue !== null && localValue !== undefined) {
        keys = [localValue];
      }

      setControlledValue(keys);
    }
  };

  const derivedProperty0 = createMemo(() => {
    const currentDisplayValue = displayValue();

    return convertValue(currentDisplayValue);
  });

  const listState = createListState(
    merge(props, {
      get allowDuplicateSelectionEvents() {
        return true;
      },
      get disallowEmptySelection() {
        return selectionMode() === "single";
      },
      get items() {
        return props.items ?? props.defaultItems;
      },
      get onSelectionChange() {
        return (keys: Selection) => {
          const currentSelectionMode = selectionMode();
          const currentDisplayValue = displayValue();

          // impossible, but TS doesn't know that
          if (keys === "all") {
            return;
          }

          if (currentSelectionMode === "single") {
            const key = keys.values().next().value ?? null;

            if (key === currentDisplayValue) {
              notifyLegacySelectionChange(props, key);
              // If key is the same, reset the inputValue and close the menu
              // (scenario: user clicks on already selected option)
              resetInputValue();
              closeMenu();
            } else {
              setValue(key);
            }
          } else {
            setValue([...keys]);
          }
        };
      },
      get selectedKeys() {
        return derivedProperty0();
      },
      get selectionMode() {
        return selectionMode();
      },
    })
  );

  const collection = createMemo(() => listState.collection);
  const selectionManager = createMemo(() => listState.selectionManager);
  const disabledKeys = createMemo(() => listState.disabledKeys);

  const selectedKey = createMemo(() => {
    const currentSelectionMode = selectionMode();
    const currentSelectionManager = selectionManager();

    return currentSelectionMode === "single"
      ? currentSelectionManager.firstSelectedKey
      : null;
  });

  const selectedItems = createMemo(() => {
    const currentSelectionManager = selectionManager();

    return [...currentSelectionManager.selectedKeys].flatMap((key) => {
      const item = collection().getItem(key);

      return item === null || item === undefined ? [] : [item];
    });
  });

  const [inputValue, setInputValue] = createControlledSignal(
    () => props.inputValue,
    untrack(() => {
      const currentSelectedKey = selectedKey();
      const currentCollection = collection();

      return (
        getDefaultInputValue(
          props.defaultInputValue,
          currentSelectedKey,
          currentCollection
        ) ?? ""
      );
    }),
    (localValue) => {
      props.onInputChange?.(localValue);
    }
  );

  const initialValue = untrack(() => displayValue());
  const initialInputValue = untrack(() => inputValue());
  // Preserve original collection so we can show all items on demand
  const originalCollection = createMemo(() => collection());

  const filteredCollection = createMemo(() => {
    const currentDefaultFilter = defaultFilter();
    const currentCollection = collection();
    const currentInputValue = inputValue();

    return (
      // No default filter if items are controlled.
      (props.items !== null && props.items !== undefined) ||
        !currentDefaultFilter
        ? currentCollection
        : filterCollection(
            currentCollection,
            currentInputValue,
            currentDefaultFilter
          )
    );
  });

  const [lastCollection, setLastCollection] = createSignal(
    untrack(() => filteredCollection()),
    { ownedWrite: true }
  );
  // Track what action is attempting to open the menu

  let menuOpenTrigger: MenuTriggerAction | undefined = "focus";

  const onOpenChange = (open: boolean) => {
    const currentSelectionManager = selectionManager();

    if (props.onOpenChange) {
      props.onOpenChange(open, open ? menuOpenTrigger : undefined);
    }

    currentSelectionManager.setFocused(open);

    if (!open) {
      currentSelectionManager.setFocusedKey(null);
    }
  };

  const triggerState = createOverlayTriggerState(
    merge(props, {
      defaultOpen: undefined,
      isOpen: undefined,
      onOpenChange,
    })
  );

  const open = (
    localFocusStrategy: FocusStrategy | null = null,
    trigger?: MenuTriggerAction
  ) => {
    const currentMenuTrigger = menuTrigger();
    const currentAllowsEmptyCollection = allowsEmptyCollection();
    const currentFilteredCollection = filteredCollection();
    const currentOriginalCollection = originalCollection();

    const displayAllItems =
      trigger === "manual" ||
      (trigger === "focus" && currentMenuTrigger === "focus");

    // Prevent open operations from triggering if there is nothing to display
    // Also prevent open operations from triggering if items are uncontrolled but defaultItems is empty, even if displayAllItems is true.
    // This is to prevent comboboxes with empty defaultItems from opening but allow controlled items comboboxes to open even if the inital list is empty (assumption is user will provide swap the empty list with a base list via onOpenChange returning `menuTrigger` manual)
    if (
      currentAllowsEmptyCollection ||
      currentFilteredCollection.size > 0 ||
      (displayAllItems && currentOriginalCollection.size > 0) ||
      props.items
    ) {
      if (
        displayAllItems &&
        !triggerState.isOpen &&
        props.items === undefined
      ) {
        // Show all items if menu is manually opened. Only care about this if items are undefined
        setShowAllItems(true);
      }

      menuOpenTrigger = trigger;
      setFocusStrategy(localFocusStrategy);
      triggerState.open();
    }
  };

  const toggle = (
    localFocusStrategy: FocusStrategy | null = null,
    trigger?: MenuTriggerAction
  ) => {
    const currentMenuTrigger = menuTrigger();
    const currentAllowsEmptyCollection = allowsEmptyCollection();
    const currentFilteredCollection = filteredCollection();
    const currentOriginalCollection = originalCollection();

    const displayAllItems =
      trigger === "manual" ||
      (trigger === "focus" && currentMenuTrigger === "focus");

    // If the menu is closed and there is nothing to display, early return so toggle isn't called to prevent extraneous onOpenChange
    if (
      !currentAllowsEmptyCollection &&
      !(currentFilteredCollection.size > 0) &&
      (!displayAllItems || !(currentOriginalCollection.size > 0)) &&
      !props.items &&
      !triggerState.isOpen
    ) {
      return;
    }

    if (displayAllItems && !triggerState.isOpen && props.items === undefined) {
      // Show all items if menu is toggled open. Only care about this if items are undefined
      setShowAllItems(true);
    }

    // Only update the menuOpenTrigger if menu is currently closed
    if (!triggerState.isOpen) {
      menuOpenTrigger = trigger;
    }

    toggleMenu(localFocusStrategy);
  };

  const updateLastCollection = () => {
    const currentShowAllItems = showAllItems();
    const currentOriginalCollection = originalCollection();
    const currentFilteredCollection = filteredCollection();
    setLastCollection(
      currentShowAllItems
        ? currentOriginalCollection
        : currentFilteredCollection
    );
  };

  // If menu is going to close, save the current collection so we can freeze the displayed collection when the
  // user clicks outside the popover to close the menu. Prevents the menu contents from updating as the menu closes.
  function toggleMenu(localFocusStrategy: FocusStrategy | null = null) {
    if (triggerState.isOpen) {
      updateLastCollection();
    }

    setFocusStrategy(localFocusStrategy);
    triggerState.toggle();
  }

  function closeMenu() {
    if (triggerState.isOpen) {
      updateLastCollection();
      triggerState.close();
    }
  }

  const [lastValue, setLastValue] = createSignal(
    untrack(() => inputValue()),
    { ownedWrite: true }
  );

  function resetInputValue() {
    const currentSelectedKey = selectedKey();
    const currentCollection = collection();

    const itemText =
      currentSelectedKey === null || currentSelectedKey === undefined
        ? ""
        : (currentCollection.getItem(currentSelectedKey)?.textValue ?? "");

    setLastValue(itemText);
    setInputValue(itemText);
  }

  let previousValue: Key | readonly Key[] | null | undefined = untrack(() =>
    displayValue()
  );

  let lastSelectedKeyText = untrack(() => {
    const currentSelectedKey = selectedKey();
    const currentCollection = collection();

    return currentSelectedKey === null || currentSelectedKey === undefined
      ? ""
      : (currentCollection.getItem(currentSelectedKey)?.textValue ?? "");
  });

  createRenderEffect(
    () => {
      const currentSelectedKey = selectedKey();
      const currentCollection = collection();

      return {
        currentAllowsEmptyCollection: allowsEmptyCollection(),
        currentDisplayValue: displayValue(),
        currentFilteredCollection: filteredCollection(),
        currentInputValue: inputValue(),
        currentIsFocused: isFocused(),
        currentIsOpen: triggerState.isOpen,
        currentLastValue: lastValue(),
        currentMenuTrigger: menuTrigger(),
        currentSelectedKey,
        currentSelectedText:
          currentSelectedKey === null
            ? ""
            : (currentCollection.getItem(currentSelectedKey)?.textValue ?? ""),
        currentSelectionManager: selectionManager(),
        currentSelectionMode: selectionMode(),
        currentShowAllItems: showAllItems(),
        currentValue: value(),
        inputIsControlled: props.inputValue !== undefined,
      };
    },
    ({
      currentIsFocused,
      currentFilteredCollection,
      currentAllowsEmptyCollection,
      currentInputValue,
      currentLastValue,
      currentMenuTrigger,
      currentShowAllItems,
      currentDisplayValue,
      currentSelectionMode,
      currentSelectionManager,
      currentValue,
      currentSelectedKey,
      currentSelectedText,
      currentIsOpen,
      inputIsControlled,
    }) => {
      function synchronizeMenu() {
        // Open and close menu automatically when the input value changes if the input is focused,
        // and there are items in the collection or allowEmptyCollection is true.
        if (
          currentIsFocused &&
          (currentFilteredCollection.size > 0 ||
            currentAllowsEmptyCollection) &&
          !currentIsOpen &&
          currentInputValue !== currentLastValue &&
          currentMenuTrigger !== "manual"
        ) {
          open(null, "input");
        }

        // Close the menu if the collection is empty. Don't close menu if filtered collection size is 0
        // but we are currently showing all items via button press
        if (
          !currentShowAllItems &&
          !currentAllowsEmptyCollection &&
          currentIsOpen &&
          currentFilteredCollection.size === 0
        ) {
          closedDueToEmpty = true;
          closeMenu();
        }

        // Re-open the menu when items become non-empty after being auto-closed due to
        // an empty collection (e.g. async load completed with results after a previous empty response).
        // This works for both controlled items on ComboBox and Collection patterns
        // (where items are provided on the ListBox rather than the ComboBox).
        if (
          currentIsFocused &&
          closedDueToEmpty &&
          currentFilteredCollection.size > 0 &&
          !currentIsOpen &&
          currentMenuTrigger !== "manual"
        ) {
          closedDueToEmpty = false;
          open(null, "input");
        }
      }

      function synchronizeSelection() {
        // Close when an item is selected.
        if (
          currentDisplayValue !== null &&
          currentDisplayValue !== undefined &&
          currentDisplayValue !== previousValue &&
          currentSelectionMode === "single"
        ) {
          closeMenu();
        }

        // Clear focused key when input value changes and display filtered collection again.
        if (currentInputValue !== currentLastValue) {
          currentSelectionManager.setFocusedKey(null);
          setShowAllItems(false);

          // Set value to null when the user clears the input.
          // If controlled, this is the application developer's responsibility.
          if (
            currentSelectionMode === "single" &&
            currentInputValue === "" &&
            (!inputIsControlled || currentValue === undefined)
          ) {
            setValue(null);
          }
        }

        // If the value changed, update the input value.
        // Do nothing if both inputValue and value are controlled.
        // In this case, it's the user's responsibility to update inputValue in onSelectionChange.
        if (
          currentDisplayValue !== previousValue &&
          (!inputIsControlled || currentValue === undefined)
        ) {
          resetInputValue();
        } else if (currentLastValue !== currentInputValue) {
          setLastValue(currentInputValue);
        }
      }

      function synchronizeSelectedText() {
        // Update the inputValue if the selected item's text changes from its last tracked value.
        // This is to handle cases where a selectedKey is specified but the items aren't available (async loading) or the selected item's text value updates.
        // Only reset if the user isn't currently within the field so we don't erroneously modify user input.
        // If inputValue is controlled, it is the user's responsibility to update the inputValue when items change.
        const selectedItemText = currentSelectedText;

        if (
          !currentIsFocused &&
          currentSelectedKey !== null &&
          currentSelectedKey !== undefined &&
          !inputIsControlled &&
          currentSelectedKey === previousValue &&
          lastSelectedKeyText !== selectedItemText
        ) {
          setLastValue(selectedItemText);
          setInputValue(selectedItemText);
        }

        return selectedItemText;
      }

      untrack(() => {
        synchronizeMenu();
        synchronizeSelection();
        const selectedItemText = synchronizeSelectedText();
        previousValue = currentDisplayValue;
        lastSelectedKeyText = selectedItemText;
      });
    }
  );

  const derivedProperty1 = createMemo(() => {
    const currentDisplayValue = displayValue();
    const currentInputValue = inputValue();
    const currentSelectedKey = selectedKey();

    return isKeyArray(currentDisplayValue) && currentDisplayValue.length === 0
      ? null
      : {
          inputValue: currentInputValue,
          selectedKey: currentSelectedKey,
          // SAFETY: The active selection mode determines the value shape; readonly input arrays are copied for mutable callback values.
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion
          value: (isKeyArray(currentDisplayValue)
            ? [...currentDisplayValue]
            : currentDisplayValue) as ComboBoxValidationValue<M>["value"],
        };
  });

  const validation = createFormValidationState(
    merge(props, {
      get value() {
        return derivedProperty1();
      },
    })
  );

  // Revert input value and close menu
  const revert = () => {
    const currentAllowsCustomValue = allowsCustomValue();
    const currentSelectedKey = selectedKey();
    closedDueToEmpty = false;

    if (
      currentAllowsCustomValue === true &&
      (currentSelectedKey === null || currentSelectedKey === undefined)
    ) {
      commitCustomValue();
    } else {
      commitSelection();
    }
  };

  function commitCustomValue() {
    const currentSelectionMode = selectionMode();
    const currentInputValue = inputValue();

    if (currentSelectionMode === "multiple") {
      // In multi-select mode, the input's custom text is independent from the selected items.
      // Closing or committing the field should not clear the existing selection.
      setLastValue(currentInputValue);
      closeMenu();

      return;
    }

    const localValue = null;
    previousValue = localValue;
    setValue(localValue);
    closeMenu();
  }

  function commitSelection(shouldForceSelectionChange = false) {
    const currentValue = value();
    const currentSelectedKey = selectedKey();
    const currentCollection = collection();
    const currentSelectionMode = selectionMode();
    const currentInputValue = inputValue();
    const currentDisplayValue = displayValue();

    // If multiple things are controlled, call onSelectionChange only when selecting the focused item,
    // or when inputValue needs to be synced back to the selected item on commit/blur.
    if (currentValue !== undefined && props.inputValue !== undefined) {
      const itemText =
        currentSelectedKey === null || currentSelectedKey === undefined
          ? ""
          : (currentCollection.getItem(currentSelectedKey)?.textValue ?? "");

      if (
        shouldForceSelectionChange ||
        currentSelectionMode === "multiple" ||
        currentInputValue !== itemText
      ) {
        notifyLegacySelectionChange(props, currentSelectedKey);

        const change = isKeyArray(currentDisplayValue)
          ? [...currentDisplayValue]
          : currentDisplayValue;

        // SAFETY: the committed value has the active mode's shape and arrays are copied for callbacks.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        props.onChange?.(change as ChangeValueType<M>);
      }

      // Keep the committed input value from reopening the menu.
      setLastValue(itemText);
    } else {
      // If only a single aspect of combobox is controlled, reset input value and close menu for the user
      resetInputValue();
    }

    closeMenu();
  }

  const commitValue = () => {
    const currentAllowsCustomValue = allowsCustomValue();
    const currentSelectedKey = selectedKey();
    const currentCollection = collection();
    const currentInputValue = inputValue();
    closedDueToEmpty = false;

    if (currentAllowsCustomValue === true) {
      const itemText =
        currentSelectedKey === null || currentSelectedKey === undefined
          ? ""
          : (currentCollection.getItem(currentSelectedKey)?.textValue ?? "");

      if (currentInputValue === itemText) {
        commitSelection();
      } else {
        commitCustomValue();
      }
    } else {
      // Reset inputValue and close menu
      commitSelection();
    }
  };

  const commit = () => {
    const currentSelectionManager = selectionManager();
    const currentSelectionMode = selectionMode();

    if (
      triggerState.isOpen &&
      currentSelectionManager.focusedKey !== null &&
      currentSelectionManager.focusedKey !== undefined
    ) {
      // Reset inputValue and close menu here if the selected key is already the focused key. Otherwise
      // fire onSelectionChange to allow the application to control the closing.
      if (
        currentSelectionManager.isSelected(
          currentSelectionManager.focusedKey
        ) &&
        currentSelectionMode === "single"
      ) {
        commitSelection(true);
      } else {
        currentSelectionManager.select(currentSelectionManager.focusedKey);
      }
    } else {
      commitValue();
    }
  };

  let valueOnFocus = untrack(() => {
    const currentInputValue = inputValue();
    const currentDisplayValue = displayValue();

    return [currentInputValue, currentDisplayValue];
  });

  const setFocused = (localIsFocused: boolean) => {
    const currentInputValue = inputValue();
    const currentDisplayValue = displayValue();
    const currentMenuTrigger = menuTrigger();
    const currentShouldCloseOnBlur = shouldCloseOnBlur();

    if (localIsFocused) {
      valueOnFocus = [currentInputValue, currentDisplayValue];

      if (currentMenuTrigger === "focus" && !(props.isReadOnly === true)) {
        open(null, "focus");
      }
    } else {
      if (currentShouldCloseOnBlur) {
        commitValue();
      }

      // Commit validation if the input value or selected items changed.
      if (
        currentInputValue !== valueOnFocus[0] ||
        currentDisplayValue !== valueOnFocus[1]
      ) {
        validation.commitValidation();
      }
    }

    setFocusedState(localIsFocused);
  };

  const displayedCollection = createMemo(() => {
    const currentShowAllItems = showAllItems();
    const currentOriginalCollection = originalCollection();
    const currentFilteredCollection = filteredCollection();
    const currentLastCollection = lastCollection();

    if (triggerState.isOpen) {
      if (currentShowAllItems) {
        return currentOriginalCollection;
      }

      return currentFilteredCollection;
    }

    return currentLastCollection;
  });

  const defaultSelectedKey = createMemo(() => {
    const currentSelectionMode = selectionMode();
    const currentInitialValue = initialValue;

    return (
      getLegacyDefaultSelectedKey(props) ??
      (currentSelectionMode === "single" &&
      (typeof currentInitialValue === "string" ||
        typeof currentInitialValue === "number")
        ? currentInitialValue
        : null)
    );
  });

  return merge(validation, triggerState, {
    get close() {
      return commitValue;
    },
    get collection() {
      return displayedCollection();
    },
    commit,
    get defaultInputValue() {
      return (
        getDefaultInputValue(
          props.defaultInputValue,
          defaultSelectedKey(),
          collection()
        ) ?? initialInputValue
      );
    },
    // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
    get defaultSelectedKey() {
      return defaultSelectedKey();
    },
    get defaultValue() {
      // SAFETY: the default is constructed with the same selection mode as this state.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return (defaultValue() ?? initialValue) as ValueType<M>;
    },
    get disabledKeys() {
      return disabledKeys();
    },
    get focusStrategy() {
      return focusStrategy();
    },
    get inputValue() {
      return inputValue();
    },
    get isFocused() {
      return isFocused();
    },
    open,
    revert,
    // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
    get selectedItem() {
      return selectedItems()[0] ?? null;
    },
    get selectedItems() {
      return selectedItems();
    },
    // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
    get selectedKey() {
      return selectedKey();
    },
    get selectionManager() {
      return selectionManager();
    },
    setFocused,
    setInputValue,
    // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
    get setSelectedKey() {
      return setValue;
    },
    setValue,
    toggle,
    get value() {
      // SAFETY: displayValue normalizes single mode to a key and multiple mode to an array.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return displayValue() as ValueType<M>;
    },
  } satisfies Partial<ComboBoxState<T, M>>);
}

function filterCollection<T>(
  collection: Collection<Node<T>>,
  inputValue: string,
  filter: FilterFn
): Collection<Node<T>> {
  return new ListCollection(
    filterNodes(collection, collection, inputValue, filter)
  );
}

function filterNodes<T>(
  collection: Collection<Node<T>>,
  nodes: Iterable<Node<T>>,
  inputValue: string,
  filter: FilterFn
): Iterable<Node<T>> {
  const filteredNode: Node<T>[] = [];

  for (const node of nodes) {
    if (node.type === "section" && node.hasChildNodes) {
      const filtered = filterNodes(
        collection,
        getChildNodes(node, collection),
        inputValue,
        filter
      );

      if ([...filtered].some((localNode) => localNode.type === "item")) {
        // oxlint-disable-next-line typescript/no-deprecated -- Node-backed collection construction must populate the upstream childNodes output contract.
        filteredNode.push({ ...node, childNodes: filtered });
      }
    } else if (node.type !== "item" || filter(node.textValue, inputValue)) {
      filteredNode.push({ ...node });
    }
  }

  return filteredNode;
}

function getDefaultInputValue(
  defaultInputValue: string | null | undefined,
  selectedKey: Key | null,
  collection: Collection<Node<unknown>>
) {
  if (
    (defaultInputValue === null || defaultInputValue === undefined) &&
    selectedKey !== null &&
    selectedKey !== undefined
  ) {
    return collection.getItem(selectedKey)?.textValue ?? "";
  }

  return defaultInputValue;
}

function convertValue(value: Key | readonly Key[] | null | undefined) {
  if (value === undefined) {
    return value;
  }

  if (value === null) {
    return [];
  }

  return isKeyArray(value) ? value : [value];
}

function isKeyArray(
  value: Key | readonly Key[] | null | undefined
): value is readonly Key[] {
  return Array.isArray(value);
}
