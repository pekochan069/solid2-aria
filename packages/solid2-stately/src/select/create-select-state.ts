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
 * Derived from Adobe React Spectrum: packages/react-stately/src/select/useSelectState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
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
import { createMemo, createSignal, merge, omit, untrack } from "solid-js";

import { createFormValidationState } from "../form/create-form-validation-state";
import type { FormValidationState } from "../form/create-form-validation-state";
import { createListState } from "../list/create-list-state";
import type { ListState } from "../list/create-list-state";
import { createOverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import type { OverlayTriggerState } from "../overlays/create-overlay-trigger-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import {
  getLegacyDefaultSelectedKey,
  getLegacySelectedKey,
  notifyLegacySelectionChange,
} from "../utils/legacy-props";

export type SelectionMode = "single" | "multiple";

export type ValueType<M extends SelectionMode> = M extends "single"
  ? Key | null
  : readonly Key[];

export type ChangeValueType<M extends SelectionMode> = M extends "single"
  ? Key | null
  : Key[];

type ValidationType<M extends SelectionMode> = M extends "single" ? Key : Key[];

export interface SelectProps<T, M extends SelectionMode = "single">
  extends
    CollectionBase<T>,
    Omit<InputBase, "isReadOnly">,
    ValueBase<ValueType<M>, ChangeValueType<M>>,
    Validation<ValidationType<M>>,
    HelpTextProps,
    LabelableProps,
    TextInputBase,
    FocusableProps {
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
  /** Sets the open state of the menu. */
  isOpen?: boolean;
  /** Sets the default open state of the menu. */
  defaultOpen?: boolean;
  /** Method that is called when the open state of the menu changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether the Select should close when an item is selected. Defaults to true if selectionMode is
   * single, false otherwise.
   */
  shouldCloseOnSelect?: boolean;
  /** Whether the select should be allowed to be open when the collection is empty. */
  allowsEmptyCollection?: boolean;
}

export interface SelectStateOptions<T, M extends SelectionMode = "single">
  extends Omit<SelectProps<T, M>, "children">, CollectionStateBase<T> {}

export interface SelectState<T, M extends SelectionMode = "single">
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
  /** The current select value. */
  readonly value: ValueType<M>;
  /** The default select value. */
  readonly defaultValue: ValueType<M>;
  /** Sets the select value. */
  setValue: (value: Key | readonly Key[] | null) => void;
  /**
   * The value of the first selected item.
   *
   * @deprecated
   */
  readonly selectedItem: Node<T> | null;
  /** The value of the selected items. */
  readonly selectedItems: Node<T>[];
  /** Whether the select is currently focused. */
  readonly isFocused: boolean;
  /** Sets whether the select is focused. */
  setFocused: (isFocused: boolean) => void;
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy | null;
  /** Opens the menu. */
  open: (focusStrategy?: FocusStrategy | null) => void;
  /** Toggles the menu. */
  toggle: (focusStrategy?: FocusStrategy | null) => void;
}

/**
 * Provides state management for a select component. Handles building a collection
 * of items from props, handles the open state for the popup menu, and manages
 * multiple selection state.
 */
export function createSelectState<
  T extends object,
  M extends SelectionMode = "single",
>(props: SelectStateOptions<T, M>): SelectState<T, M> {
  const triggerState = createOverlayTriggerState(props);

  const [focusStrategy, setFocusStrategy] = createSignal<FocusStrategy | null>(
    null,
    { ownedWrite: true }
  );

  const defaultValue = createMemo(
    () =>
      props.defaultValue ??
      ((props.selectionMode ?? "single") === "single"
        ? (getLegacyDefaultSelectedKey(props) ?? null)
        : [])
  );

  const value = createMemo(
    () =>
      props.value ??
      ((props.selectionMode ?? "single") === "single"
        ? getLegacySelectedKey(props)
        : undefined)
  );

  const [controlledValue, setControlledValue] = createControlledSignal<
    Key | readonly Key[] | null
  >(
    () => value(),
    untrack(() => defaultValue()),
    (nextValue) => {
      const change = isKeyArray(nextValue) ? [...nextValue] : nextValue;
      // SAFETY: setValue normalizes the change to the active selection mode before dispatch.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      props.onChange?.(change as ChangeValueType<M>);
    }
  );

  // Only display the first selected item if in single selection mode but the value is an array.
  const displayValue = createMemo(() => {
    const current = controlledValue();

    return (props.selectionMode ?? "single") === "single" && isKeyArray(current)
      ? (current[0] ?? null)
      : current;
  });

  const setValue = (localValue: Key | readonly Key[] | null) => {
    if ((props.selectionMode ?? "single") === "single") {
      const key = isKeyArray(localValue) ? (localValue[0] ?? null) : localValue;

      setControlledValue(key);

      if (key !== displayValue()) {
        notifyLegacySelectionChange(props, key);
      }
    } else {
      let keys: Key[] = [];

      if (isKeyArray(localValue)) {
        keys = [...localValue];
      } else if (localValue !== null && localValue !== undefined) {
        keys =
          typeof localValue === "string" || typeof localValue === "number"
            ? [localValue]
            : [...localValue];
      }

      setControlledValue(keys);
    }
  };

  const validationState = createFormValidationState(
    merge(omit(props, "value"), {
      get value() {
        const current = displayValue();
        let validationValue: Key | Key[] | null = null;

        if (isKeyArray(current)) {
          validationValue = current.length === 0 ? null : [...current];
        } else {
          validationValue = current;
        }

        // SAFETY: displayValue follows selectionMode, which also determines the validation value type.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        return validationValue as ValidationType<M> | null;
      },
    })
  );

  const listState = createListState(
    merge(props, {
      get allowDuplicateSelectionEvents() {
        return true;
      },
      get disallowEmptySelection() {
        return (props.selectionMode ?? "single") === "single";
      },
      get onSelectionChange() {
        return (keys: Selection) => {
          // impossible, but TS doesn't know that
          if (keys === "all") {
            return;
          }

          if ((props.selectionMode ?? "single") === "single") {
            const key = keys.values().next().value ?? null;
            setValue(key);
          } else {
            setValue([...keys]);
          }

          if (
            props.shouldCloseOnSelect ??
            (props.selectionMode ?? "single") === "single"
          ) {
            triggerState.close();
          }

          validationState.commitValidation();
        };
      },
      get selectedKeys() {
        return convertValue(displayValue());
      },
      get selectionMode() {
        return props.selectionMode ?? "single";
      },
    })
  );

  const selectedKey = createMemo(
    () => listState.selectionManager.firstSelectedKey
  );

  const selectedItems = createMemo(() =>
    [...listState.selectionManager.selectedKeys].flatMap((key) => {
      const item = listState.collection.getItem(key);

      return item === null || item === undefined ? [] : [item];
    })
  );

  const [isFocused, setFocused] = createSignal(false, { ownedWrite: true });

  const initialValue = untrack(() => displayValue());

  return merge(validationState, listState, triggerState, {
    get defaultSelectedKey() {
      return (
        getLegacyDefaultSelectedKey(props) ??
        (props.selectionMode === "single" &&
        (typeof initialValue === "string" || typeof initialValue === "number")
          ? initialValue
          : null)
      );
    },
    get defaultValue() {
      // SAFETY: defaults use the same active mode as the state returned to the caller.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return (defaultValue() ?? initialValue) as ValueType<M>;
    },
    get focusStrategy() {
      return focusStrategy();
    },
    get isFocused() {
      return isFocused();
    },
    open(localFocusStrategy: FocusStrategy | null = null) {
      // Don't open if the collection is empty.
      if (
        listState.collection.size !== 0 ||
        props.allowsEmptyCollection === true
      ) {
        setFocusStrategy(localFocusStrategy);
        triggerState.open();
      }
    },
    get selectedItem() {
      return selectedItems()[0] ?? null;
    },
    get selectedItems() {
      return selectedItems();
    },
    get selectedKey() {
      return selectedKey();
    },
    get setFocused() {
      return setFocused;
    },
    get setSelectedKey() {
      return setValue;
    },
    get setValue() {
      return setValue;
    },
    toggle(localFocusStrategy: FocusStrategy | null = null) {
      if (
        listState.collection.size !== 0 ||
        props.allowsEmptyCollection === true
      ) {
        setFocusStrategy(localFocusStrategy);
        triggerState.toggle();
      }
    },
    get value() {
      // SAFETY: single mode exposes a key; multiple mode exposes the normalized key array.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return displayValue() as ValueType<M>;
    },
  });
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
