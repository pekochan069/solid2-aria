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
 * Derived from Adobe React Spectrum: packages/react-aria/src/autocomplete/useSearchAutocomplete.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ComboBoxState,
  MenuTriggerAction,
} from "@solid2-aria/stately/combobox/create-combo-box-state";
import type { SearchFieldProps } from "@solid2-aria/stately/searchfield/create-search-field-state";
import type {
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  Key,
  KeyboardDelegate,
  LayoutDelegate,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { omit, merge } from "solid-js";
import type { Accessor } from "solid-js";

import type { AriaButtonProps } from "../button/create-button";
import { createComboBox } from "../combobox/create-combo-box";
import type { AriaListBoxOptions } from "../listbox/create-list-box";
import { createSearchField } from "../searchfield/create-search-field";
import type { AriaSearchFieldProps } from "../searchfield/create-search-field";
import type { InputHTMLAttributes } from "../types";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { noop } from "../utils/noop";

export interface SearchAutocompleteProps<T>
  extends
    CollectionBase<T>,
    Omit<SearchFieldProps, "onChange" | "onSubmit" | "defaultValue" | "value"> {
  /** The list of SearchAutocomplete items (uncontrolled). */
  defaultItems?: Iterable<T>;
  /** The list of SearchAutocomplete items (controlled). */
  items?: Iterable<T>;
  /**
   * Method that is called when the open state of the menu changes. Returns the new open state and
   * the action that caused the opening of the menu.
   */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void;
  /** The value of the SearchAutocomplete input (controlled). */
  inputValue?: string;
  /** The default value of the SearchAutocomplete input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the SearchAutocomplete input value changes. */
  onInputChange?: (value: string) => void;
  /**
   * The interaction required to display the SearchAutocomplete menu.
   *
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction;
  /**
   * Handler that is called when the SearchAutocomplete is submitted.
   *
   * A `value` will be passed if the submission is a custom value (e.g. a user types then presses
   * enter). If the input is a selected item, `value` will be null.
   *
   * A `key` will be passed if the submission is a selected item (e.g. a user clicks or presses
   * enter on an option). If the input is a custom value, `key` will be null.
   */
  onSubmit?: (value: string | null, key: Key | null) => void;
}

export interface AriaSearchAutocompleteProps<T>
  extends
    SearchAutocompleteProps<T>,
    Omit<
      AriaSearchFieldProps,
      "onChange" | "onSubmit" | "defaultValue" | "value"
    >,
    DOMProps,
    AriaLabelingProps {}

export interface SearchAutocompleteAria<T> extends ValidationResult {
  /** Props for the label element. */
  labelProps: DOMAttributes;
  /** Props for the search input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the list box, to be passed to `useListBox`. */
  listBoxProps: AriaListBoxOptions<T>;
  /** Props for the search input's clear button. */
  clearButtonProps: AriaButtonProps;
  /** Props for the search autocomplete description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the search autocomplete error message element, if any. */
  errorMessageProps: DOMAttributes;
}

export interface AriaSearchAutocompleteOptions<
  T,
> extends AriaSearchAutocompleteProps<T> {
  /** The ref for the input element. */
  inputRef: Accessor<HTMLInputElement | null>;
  /** The ref for the list box popover. */
  popoverRef: Accessor<HTMLDivElement | null>;
  /** The ref for the list box. */
  listBoxRef: Accessor<HTMLElement | null>;
  /** An optional keyboard delegate implementation, to override the default. */
  keyboardDelegate?: KeyboardDelegate;
  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate;
}

/**
 * Provides the behavior and accessibility implementation for a search autocomplete component. A
 * search autocomplete combines a combobox with a searchfield, allowing users to filter a list of
 * options to items matching a query.
 *
 * @param props - Props for the search autocomplete.
 * @param state - State for the search autocomplete, as returned by `useSearchAutocomplete`.
 */
export function createSearchAutocomplete<T>(
  props: AriaSearchAutocompleteOptions<T>,
  state: ComboBoxState<T>
): SearchAutocompleteAria<T> {
  const _result0 = props;

  const _result1 = createSearchField(
    merge(
      omit(
        _result0,
        "popoverRef",
        "inputRef",
        "listBoxRef",
        "keyboardDelegate",
        "layoutDelegate",
        "onSubmit",
        "onClear",
        "onKeyDown",
        "onKeyUp",
        "isInvalid",
        "validationState",
        "validationBehavior",
        "isRequired"
      ),
      {
        get autoComplete(): "off" {
          return "off";
        },
        get onChange() {
          return state.setInputValue;
        },
        onClear: () => {
          state.setInputValue("");

          if (_result0.onClear) {
            _result0.onClear();
          }
        },
        get onKeyDown() {
          return _result0.onKeyDown;
        },
        get onKeyUp() {
          return _result0.onKeyUp;
        },
        onSubmit: (value: string) => {
          // Prevent submission from search field if menu item was selected
          if (state.selectionManager.focusedKey === null) {
            (_result0.onSubmit ?? noop)(value, null);
          }
        },
        get value() {
          return state.inputValue;
        },
      }
    ),
    {
      get setValue() {
        return state.setInputValue;
      },
      get value() {
        return state.inputValue;
      },
    },
    _result0.inputRef
  );

  const _result2 = createComboBox(
    merge(
      omit(
        _result0,
        "validate",
        "popoverRef",
        "inputRef",
        "listBoxRef",
        "keyboardDelegate",
        "layoutDelegate",
        "onSubmit",
        "onClear",
        "onKeyDown",
        "onKeyUp",
        "isInvalid",
        "validationState",
        "validationBehavior",
        "isRequired"
      ),
      {
        get inputRef() {
          return _result0.inputRef;
        },
        get isInvalid() {
          return _result0.isInvalid;
        },
        get isRequired() {
          return _result0.isRequired;
        },
        get keyboardDelegate() {
          return _result0.keyboardDelegate;
        },
        get layoutDelegate() {
          return _result0.layoutDelegate;
        },
        get listBoxRef() {
          return _result0.listBoxRef;
        },
        onBlur: undefined,
        onFocus: undefined,
        onFocusChange: undefined,
        onKeyDown: undefined,
        onKeyUp: undefined,
        get popoverRef() {
          return _result0.popoverRef;
        },
        validate: undefined,
        get validationBehavior() {
          return _result0.validationBehavior;
        },
        get validationState() {
          return getLegacyOption(_result0, "validationState");
        },
      }
    ),
    state
  );

  return merge(
    {
      get clearButtonProps() {
        return _result1.clearButtonProps;
      },
      get inputProps() {
        return mergeProps(_result1.inputProps, _result2.inputProps);
      },
      get labelProps() {
        return _result2.labelProps;
      },
      get listBoxProps() {
        return _result2.listBoxProps;
      },
    },
    omit(_result2, "listBoxProps", "labelProps", "inputProps")
  );
}
