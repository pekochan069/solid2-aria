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
 * Derived from Adobe React Spectrum: packages/react-aria/src/checkbox/useCheckboxGroup.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CheckboxGroupProps,
  CheckboxGroupState,
} from "@solid2-aria/stately/checkbox/create-checkbox-group-state";
import type {
  AriaLabelingProps,
  AriaValidationProps,
  DOMProps,
  FocusEvents,
  InputDOMProps,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo } from "solid-js";

import { createFocusWithin } from "../interactions/create-focus-within";
import { createField } from "../label/create-field";
import type { FieldAria } from "../label/create-field";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";
import { checkboxGroupData } from "./utils";

export interface AriaCheckboxGroupProps
  extends
    CheckboxGroupProps,
    InputDOMProps,
    DOMProps,
    AriaLabelingProps,
    AriaValidationProps,
    FocusEvents {}

export interface CheckboxGroupAria extends ValidationResult {
  /** Props for the checkbox group wrapper element. */
  groupProps: DOMAttributes;
  /** Props for the checkbox group's visible label (if any). */
  labelProps: FieldAria["labelProps"];
  /** Props for the checkbox group description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the checkbox group error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 *
 * @param props - Props for the checkbox group.
 * @param state - State for the checkbox group, as returned by `useCheckboxGroupState`.
 */
export function createCheckboxGroup(
  props: AriaCheckboxGroupProps,
  state: CheckboxGroupState
): CheckboxGroupAria {
  const _result0 = props;
  const _result1 = createMemo(() => state.displayValidation);

  // shouldn't be labeled by a <label> element.
  const _result2 = createField(
    merge(props, {
      get errorMessage() {
        return (
          getTruthyValue(props.errorMessage) ?? _result1().validationErrors
        );
      },
      get isInvalid() {
        return _result1().isInvalid;
      },
      // Checkbox group is not an HTML input element so it
      get labelElementType(): "span" {
        return "span" as const;
      },
    })
  );

  checkboxGroupData.set(state, {
    get descriptionId() {
      const { id } = _result2.descriptionProps;

      return typeof id === "string" ? id : undefined;
    },
    get errorMessageId() {
      const { id } = _result2.errorMessageProps;

      return typeof id === "string" ? id : undefined;
    },
    get form() {
      return _result0.form;
    },
    get name() {
      return _result0.name;
    },
    get validationBehavior() {
      return _result0.validationBehavior ?? "aria";
    },
  });

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const _result3 = createFocusWithin({
    get onBlurWithin() {
      return props.onBlur;
    },
    get onFocusWithin() {
      return props.onFocus;
    },
    get onFocusWithinChange() {
      return props.onFocusChange;
    },
  });

  return {
    get descriptionProps() {
      return _result2.descriptionProps;
    },
    get errorMessageProps() {
      return _result2.errorMessageProps;
    },
    get groupProps() {
      return mergeProps(domProps(), {
        "aria-disabled": ariaValue(
          getTruthyValue(_result0.isDisabled) ?? undefined
        ),
        role: "group" as const,
        ..._result2.fieldProps,
        ..._result3.focusWithinProps,
      });
    },
    get isInvalid() {
      return _result1().isInvalid;
    },
    get labelProps() {
      return _result2.labelProps;
    },
    get validationDetails() {
      return _result1().validationDetails;
    },
    get validationErrors() {
      return _result1().validationErrors;
    },
  };
}
