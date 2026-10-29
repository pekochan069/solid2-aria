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
 * Derived from Adobe React Spectrum: packages/react-stately/src/radio/useRadioGroupState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusEvents,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Orientation,
  Validation,
  ValidationState,
  ValueBase,
} from "@solid2-aria/types-shared";
import { createSignal, createUniqueId, merge, untrack } from "solid-js";

import { createFormValidationState } from "../form/create-form-validation-state";
import type { FormValidationState } from "../form/create-form-validation-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { getLegacyValidationState } from "../utils/legacy-props";

export interface RadioGroupProps
  extends
    ValueBase<string | null, string>,
    InputBase,
    Pick<InputDOMProps, "name">,
    Validation<string>,
    LabelableProps,
    HelpTextProps,
    FocusEvents {
  /**
   * The axis the Radio Button(s) should align with.
   *
   * @default 'vertical'
   */
  orientation?: Orientation;
}

export interface RadioGroupState extends FormValidationState {
  /**
   * The name for the group, used for native form submission.
   *
   * @private
   * @deprecated
   */
  readonly name: string;
  /** Whether the radio group is disabled. */
  readonly isDisabled: boolean;
  /** Whether the radio group is read only. */
  readonly isReadOnly: boolean;
  /** Whether the radio group is required. */
  readonly isRequired: boolean;
  /**
   * Whether the radio group is valid or invalid.
   *
   * @deprecated Use `isInvalid` instead.
   */
  readonly validationState: ValidationState | null;
  /** Whether the radio group is invalid. */
  readonly isInvalid: boolean;
  /** The currently selected value. */
  readonly selectedValue: string | null;
  /** The default selected value. */
  readonly defaultSelectedValue: string | null;
  /** Sets the selected value. */
  setSelectedValue: (value: string | null) => void;
  /** The value of the last focused radio. */
  readonly lastFocusedValue: string | null;
  /** Sets the last focused value. */
  setLastFocusedValue: (value: string | null) => void;
}

export function createRadioGroupState(props: RadioGroupProps): RadioGroupState {
  const id = createUniqueId();

  const [selectedValue, setSelected] = createControlledSignal(
    () => props.value,
    untrack(() => props.defaultValue ?? null),
    (value) => {
      if (value !== null) {
        props.onChange?.(value);
      }
    }
  );

  const initialValue = untrack(selectedValue);

  const [lastFocusedValue, setLastFocusedValue] = createSignal<string | null>(
    null,
    { ownedWrite: true }
  );

  const validation = createFormValidationState(
    merge(props, {
      get value() {
        return selectedValue();
      },
    })
  );

  return merge(validation, {
    get defaultSelectedValue() {
      return props.value === undefined
        ? (props.defaultValue ?? null)
        : initialValue;
    },
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isInvalid() {
      return validation.displayValidation.isInvalid;
    },
    get isReadOnly() {
      return props.isReadOnly ?? false;
    },
    get isRequired() {
      return props.isRequired ?? false;
    },
    get lastFocusedValue() {
      return lastFocusedValue();
    },
    get name() {
      return props.name !== undefined && props.name !== ""
        ? props.name
        : `radio-group-${id}`;
    },
    get selectedValue() {
      return selectedValue();
    },
    setLastFocusedValue,
    setSelectedValue(value: string | null) {
      if (!(props.isReadOnly === true) && !(props.isDisabled === true)) {
        setSelected(value);
        validation.commitValidation();
      }
    },
    get validationState() {
      return (
        getLegacyValidationState(props) ??
        (validation.displayValidation.isInvalid ? ("invalid" as const) : null)
      );
    },
  });
}
