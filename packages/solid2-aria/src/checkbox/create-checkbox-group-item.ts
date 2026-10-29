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
 * Derived from Adobe React Spectrum: packages/react-aria/src/checkbox/useCheckboxGroupItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { CheckboxGroupState } from "@solid2-aria/stately/checkbox/create-checkbox-group-state";
import {
  DEFAULT_VALIDATION_RESULT,
  privateValidationStateProp,
  createFormValidationState,
} from "@solid2-aria/stately/form/create-form-validation-state";
import { createToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
import type { ValidationResult } from "@solid2-aria/types-shared";
import { merge, createMemo, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { ariaValue } from "../utils/aria-value";
import { requireValue } from "../utils/require-value";
import { getTruthyValue } from "../utils/truthy";
import { createCheckbox } from "./create-checkbox";
import type { AriaCheckboxProps, CheckboxAria } from "./create-checkbox";
import { checkboxGroupData } from "./utils";

export interface AriaCheckboxGroupItemProps extends Omit<
  AriaCheckboxProps,
  "isSelected" | "defaultSelected"
> {
  value: string;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox component contained within
 * a checkbox group. Checkbox groups allow users to select multiple items from a list of options.
 *
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useCheckboxGroupState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function createCheckboxGroupItem(
  props: AriaCheckboxGroupItemProps,
  state: CheckboxGroupState,
  inputRef: Accessor<HTMLInputElement | null>
): CheckboxAria {
  const toggleState = createToggleState({
    get defaultSelected() {
      return state.defaultValue.includes(props.value);
    },
    get isReadOnly() {
      return getTruthyValue(props.isReadOnly) ?? state.isReadOnly;
    },
    get isSelected() {
      return state.isSelected(props.value);
    },
    onChange(isSelected) {
      if (isSelected) {
        state.addValue(props.value);
      } else {
        state.removeValue(props.value);
      }

      if (props.onChange) {
        props.onChange(isSelected);
      }
    },
  });

  const groupData = requireValue(
    checkboxGroupData.get(state),
    "Expected checkboxGroupData.get(state)"
  );

  const validationBehavior = createMemo(
    () => props.validationBehavior ?? groupData.validationBehavior
  );

  // Local validation for this checkbox.
  const _result0 = createFormValidationState(
    merge(props, {
      // Server validation is handled at the group level.
      name: undefined,
      get validationBehavior(): "aria" {
        return "aria" as const;
      },
      get value() {
        return toggleState.isSelected;
      },
    })
  );

  // Update the checkbox group state when realtime validation changes.
  let nativeValidation = DEFAULT_VALIDATION_RESULT;

  const updateValidation = () => {
    state.setInvalid(
      props.value,
      _result0.realtimeValidation.isInvalid
        ? _result0.realtimeValidation
        : nativeValidation
    );
  };

  onSettled(updateValidation);

  // Combine group and checkbox level validation.
  const combinedRealtimeValidation = createMemo(() =>
    state.realtimeValidation.isInvalid
      ? state.realtimeValidation
      : _result0.realtimeValidation
  );

  const displayValidation = createMemo(() =>
    validationBehavior() === "native"
      ? state.displayValidation
      : combinedRealtimeValidation()
  );

  const res = createCheckbox(
    merge(props, {
      get form() {
        return getTruthyValue(props.form) ?? groupData.form;
      },
      get isDisabled() {
        return getTruthyValue(props.isDisabled) ?? state.isDisabled;
      },
      get isReadOnly() {
        return getTruthyValue(props.isReadOnly) ?? state.isReadOnly;
      },
      get isRequired() {
        return props.isRequired ?? state.isRequired;
      },
      get name() {
        return getTruthyValue(props.name) ?? groupData.name;
      },
      get [privateValidationStateProp]() {
        return {
          get commitValidation() {
            return state.commitValidation;
          },
          get displayValidation() {
            return displayValidation();
          },
          get realtimeValidation() {
            return combinedRealtimeValidation();
          },
          get resetValidation() {
            return state.resetValidation;
          },
          updateValidation(v: ValidationResult) {
            nativeValidation = v;
            updateValidation();
          },
        };
      },
      get validationBehavior() {
        return validationBehavior();
      },
    }),
    toggleState,
    inputRef
  );

  return merge(res, {
    get inputProps() {
      return merge(res.inputProps, {
        get "aria-describedby"() {
          return ariaValue(
            ariaValue(
              [
                res.inputProps["aria-describedby"],
                state.isInvalid ? groupData.errorMessageId : null,
                groupData.descriptionId,
              ]
                .filter(Boolean)
                .join(" ") || undefined
            )
          );
        },
      });
    },
  });
}
