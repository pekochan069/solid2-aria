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
 * Derived from Adobe React Spectrum: packages/react-aria/src/checkbox/useCheckbox.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ToggleProps,
  ToggleState,
} from "@solid2-aria/stately/toggle/create-toggle-state";
import type {
  InputDOMProps,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributesWithRef } from "@solid2-aria/types-shared-web";
import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { createToggle } from "../toggle/create-toggle";
import type { AriaToggleProps } from "../toggle/create-toggle";
import type { InputHTMLAttributes, LabelHTMLAttributes } from "../types";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";

export interface CheckboxProps extends ToggleProps {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean;
}

export interface AriaCheckboxProps
  extends CheckboxProps, InputDOMProps, AriaToggleProps {}

export interface CheckboxAria extends ValidationResult {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the checkbox description element, if any. */
  descriptionProps: DOMAttributesWithRef<HTMLElement>;
  /** Props for the checkbox error message element, if any. */
  errorMessageProps: DOMAttributesWithRef<HTMLElement>;
  /** Whether the checkbox is selected. */
  isSelected: boolean;
  /** Whether the checkbox is in a pressed state. */
  isPressed: boolean;
  /** Whether the checkbox is disabled. */
  isDisabled: boolean;
  /** Whether the checkbox is read only. */
  isReadOnly: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox component.
 * Checkboxes allow users to select multiple items from a list of individual items, or
 * to mark one individual item as selected.
 *
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useToggleState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function createCheckbox(
  props: AriaCheckboxProps,
  state: ToggleState,
  inputRef: Accessor<HTMLInputElement | null>
): CheckboxAria {
  const _result1 = createToggle(props, state, inputRef);
  const _result2 = props;
  createEffect(
    () => ({
      inputElement: inputRef(),
      isIndeterminate: _result2.isIndeterminate,
    }),
    ({ isIndeterminate, inputElement }) => {
      const inputRefElement = inputElement;

      // indeterminate is a property, but it can only be set via javascript
      // https://css-tricks.com/indeterminate-checkboxes/
      if (inputRefElement) {
        inputRefElement.indeterminate = isTruthy(isIndeterminate);
      }
    },
    { ssrSource: "client" }
  );

  const _memo0 = {
    // Prevent label from being focused when mouse down on it.
    // Note, this does not prevent the input from being focused in the `click` event.
    onMouseDown: (e: MouseEvent) => {
      e.preventDefault();
    },
  };

  return {
    get descriptionProps() {
      return _result1.descriptionProps;
    },
    get errorMessageProps() {
      return _result1.errorMessageProps;
    },
    get inputProps() {
      return _result1.inputProps;
    },
    get isDisabled() {
      return _result1.isDisabled;
    },
    get isInvalid() {
      return _result1.isInvalid;
    },
    get isPressed() {
      return _result1.isPressed;
    },
    get isReadOnly() {
      return _result1.isReadOnly;
    },
    get isSelected() {
      return _result1.isSelected;
    },
    get labelProps() {
      return mergeProps(_result1.labelProps, _memo0);
    },
    get validationDetails() {
      return _result1.validationDetails;
    },
    get validationErrors() {
      return _result1.validationErrors;
    },
  };
}
