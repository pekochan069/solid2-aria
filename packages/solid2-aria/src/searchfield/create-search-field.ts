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
 * Derived from Adobe React Spectrum: packages/react-aria/src/searchfield/useSearchField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  SearchFieldProps,
  SearchFieldState,
} from "@solid2-aria/stately/searchfield/create-search-field-state";
import type { ValidationResult } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { omit, merge } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/searchfield/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createKeyboard } from "../interactions/create-keyboard";
import { createTextField } from "../textfield/create-text-field";
import type { AriaTextFieldProps } from "../textfield/create-text-field";
import type { InputHTMLAttributes, LabelHTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";

export interface AriaSearchFieldProps
  extends SearchFieldProps, Omit<AriaTextFieldProps, "type"> {
  /**
   * An enumerated attribute that defines what action label or icon to preset for the enter key on
   * virtual keyboards. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint).
   */
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
  /**
   * The type of input to render. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdeftype).
   *
   * @default 'search'
   */
  type?:
    | "text"
    | "search"
    | "url"
    | "tel"
    | "email"
    | "password"
    | (string & Record<never, never>);
}

export interface SearchFieldAria extends ValidationResult {
  /** Props for the text field's visible label element (if any). */
  labelProps: LabelHTMLAttributes;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the clear button. */
  clearButtonProps: AriaButtonProps;
  /** Props for the searchfield's description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the searchfield's error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a search field.
 *
 * @param props - Props for the search field.
 * @param state - State for the search field, as returned by `useSearchFieldState`.
 * @param inputRef - A ref to the input element.
 */
export function createSearchField(
  props: AriaSearchFieldProps,
  state: SearchFieldState,
  inputRef: Accessor<HTMLInputElement | null>
): SearchFieldAria {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/searchfield"
  );

  const _result0 = props;

  const _result1 = createKeyboard({
    get isDisabled() {
      return getTruthyValue(_result0.isDisabled) ?? _result0.isReadOnly;
    },
    get shortcuts() {
      return {
        Enter: (): undefined | false => {
          if (_result0.onSubmit) {
            // for backward compatibility;
            // otherwise, "Enter" on an input would trigger a form submit, the default browser behavior
            _result0.onSubmit(state.value);

            return undefined;
          }

          return false;
        },
        Escape: (): undefined | false => {
          const inputRefElement = inputRef();

          // Also check the inputRef value for the case where the value was set directly on the input element instead of going through
          // the hook
          if (
            state.value === "" &&
            (!inputRefElement || inputRefElement.value === "")
          ) {
            return false;
          }

          state.setValue("");
          _result0.onClear?.();

          return undefined;
        },
      };
    },
  });

  const onClearButtonClick = () => {
    state.setValue("");

    if (_result0.onClear) {
      _result0.onClear();
    }
  };

  const onPressStart = () => {
    // this is in PressStart for mobile so that touching the clear button doesn't remove focus from
    // the input and close the keyboard
    inputRef()?.focus();
  };

  const _result2 = createTextField(
    merge(props, {
      get onChange() {
        return state.setValue;
      },
      get onKeyDown() {
        return props.onKeyDown;
      },
      get onKeyUp() {
        return props.onKeyUp;
      },
      get type() {
        return _result0.type ?? "search";
      },
      get value() {
        return state.value;
      },
    }),
    inputRef
  );

  // Escape runs autocomplete/listbox first, then the search-field shortcut returns false and
  // continues propagation, leaking Escape to a parent Dialog.
  return merge(
    {
      get clearButtonProps() {
        return {
          get "aria-label"() {
            return ariaValue(ariaValue(stringFormatter.format("Clear search")));
          },
          get excludeFromTabOrder(): true {
            return true;
          },
          get isDisabled() {
            return getTruthyValue(_result0.isDisabled) ?? _result0.isReadOnly;
          },
          get onPress() {
            return onClearButtonClick;
          },
          get onPressStart() {
            return onPressStart;
          },
          get preventFocusOnPress(): true {
            return true;
          },
        };
      },
      get descriptionProps() {
        return _result2.descriptionProps;
      },
      get errorMessageProps() {
        return _result2.errorMessageProps;
      },
      // An edge case, in Autocomplete, if the keyboard hanlders are not in this order, then
      get inputProps() {
        return mergeProps(_result1.keyboardProps, {
          ..._result2.inputProps,
          // already handled by useSearchFieldState
          defaultValue: undefined,
        });
      },
      get labelProps() {
        return _result2.labelProps;
      },
    },
    omit(
      _result2,
      "labelProps",
      "inputProps",
      "descriptionProps",
      "errorMessageProps"
    )
  );
}
