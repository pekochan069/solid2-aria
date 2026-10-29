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
 * Derived from Adobe React Spectrum: packages/react-stately/src/checkbox/useCheckboxGroupState.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  HelpTextProps,
  InputBase,
  InputDOMProps,
  LabelableProps,
  Validation,
  ValidationResult,
  ValidationState,
  ValueBase,
} from "@solid2-aria/types-shared";
import { merge, untrack } from "solid-js";

import {
  mergeValidation,
  createFormValidationState,
} from "../form/create-form-validation-state";
import type { FormValidationState } from "../form/create-form-validation-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { getLegacyValidationState } from "../utils/legacy-props";

export interface CheckboxGroupProps
  extends
    ValueBase<string[]>,
    Pick<InputDOMProps, "name">,
    InputBase,
    LabelableProps,
    HelpTextProps,
    Validation<string[]> {}

export interface CheckboxGroupState extends FormValidationState {
  /** Current selected values. */
  readonly value: readonly string[];
  /** Default selected values. */
  readonly defaultValue: readonly string[];
  /** Whether the checkbox group is disabled. */
  readonly isDisabled: boolean;
  /** Whether the checkbox group is read only. */
  readonly isReadOnly: boolean;
  /**
   * The current validation state of the checkbox group.
   *
   * @deprecated Use `isInvalid` instead.
   */
  readonly validationState: ValidationState | null;
  /** Whether the checkbox group is invalid. */
  readonly isInvalid: boolean;
  /**
   * Whether the checkboxes in the group are required.
   * This changes to false once at least one item is selected.
   */
  readonly isRequired: boolean;
  /** Returns whether the given value is selected. */
  isSelected: (value: string) => boolean;
  /** Sets the selected values. */
  setValue: (value: string[]) => void;
  /** Adds a value to the set of selected values. */
  addValue: (value: string) => void;
  /** Removes a value from the set of selected values. */
  removeValue: (value: string) => void;
  /** Toggles a value in the set of selected values. */
  toggleValue: (value: string) => void;
  /** Sets whether one of the checkboxes is invalid. */
  setInvalid: (value: string, validation: ValidationResult) => void;
}

/**
 * Provides state management for a checkbox group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function createCheckboxGroupState(
  props: CheckboxGroupProps = {}
): CheckboxGroupState {
  const [selectedValues, setValue] = createControlledSignal(
    () => props.value,
    untrack(() => props.defaultValue) ?? [],
    (v) => props.onChange?.(v)
  );

  const initialValues = untrack(selectedValues);
  let invalidValues = new Map<string, ValidationResult>();

  const validation = createFormValidationState(
    merge(props, {
      get value() {
        return selectedValues();
      },
    })
  );

  const state: CheckboxGroupState = merge(validation, {
    addValue(value: string) {
      if (props.isReadOnly === true || props.isDisabled === true) {
        return;
      }

      setValue((localSelectedValues) => {
        if (!localSelectedValues.includes(value)) {
          return [...localSelectedValues, value];
        }

        return localSelectedValues;
      });
    },
    get defaultValue() {
      return props.defaultValue ?? initialValues;
    },
    get isDisabled() {
      return props.isDisabled === true || false;
    },
    get isInvalid() {
      return validation.displayValidation.isInvalid;
    },
    get isReadOnly() {
      return props.isReadOnly === true || false;
    },
    get isRequired() {
      return props.isRequired === true && selectedValues().length === 0;
    },
    isSelected(value: string) {
      return selectedValues().includes(value);
    },
    removeValue(value: string) {
      if (props.isReadOnly === true || props.isDisabled === true) {
        return;
      }

      setValue((currentValues) =>
        currentValues.includes(value)
          ? currentValues.filter((existingValue) => existingValue !== value)
          : currentValues
      );
    },
    setInvalid(value: string, v: ValidationResult) {
      const s = new Map(invalidValues);

      if (v.isInvalid) {
        s.set(value, v);
      } else {
        s.delete(value);
      }

      invalidValues = s;
      validation.updateValidation(mergeValidation(...s.values()));
    },
    setValue(value: string[]) {
      if (props.isReadOnly === true || props.isDisabled === true) {
        return;
      }

      setValue(value);
    },
    toggleValue(value: string) {
      if (props.isReadOnly === true || props.isDisabled === true) {
        return;
      }

      setValue((current) =>
        current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
      );
    },
    get validationState() {
      return (
        getLegacyValidationState(props) ??
        (validation.displayValidation.isInvalid ? "invalid" : null)
      );
    },
    get value() {
      return selectedValues();
    },
  });

  return state;
}
