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
 * Derived from Adobe React Spectrum: packages/react-aria/src/toggle/useToggle.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  privateValidationStateProp,
  createFormValidationState,
} from "@solid2-aria/stately/form/create-form-validation-state";
import type { FormValidationState } from "@solid2-aria/stately/form/create-form-validation-state";
import type {
  ToggleProps,
  ToggleState,
} from "@solid2-aria/stately/toggle/create-toggle-state";
import type {
  AriaLabelingProps,
  AriaValidationProps,
  FocusableDOMProps,
  InputDOMProps,
  PressEvents,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributesWithRef } from "@solid2-aria/types-shared-web";
import { merge, createMemo, createSignal, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import { createFormValidation } from "../form/create-form-validation";
import { createFocusable } from "../interactions/create-focusable";
import { createPress } from "../interactions/create-press";
import type {
  ChangeEventHandler,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createFormReset } from "../utils/create-form-reset";
import { createSlotId2 } from "../utils/create-slot";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isPresent } from "../utils/is-present";
import { getLegacyOption } from "../utils/legacy-option";
import { mergeProps } from "../utils/merge-props";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";

export interface AriaToggleProps
  extends
    ToggleProps,
    FocusableDOMProps,
    AriaLabelingProps,
    AriaValidationProps,
    InputDOMProps,
    PressEvents {
  [privateValidationStateProp]?: FormValidationState;
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   */
  "aria-controls"?: string;
}

export interface ToggleAria extends ValidationResult {
  /** Props to be spread on the label element. */
  labelProps: LabelHTMLAttributes;
  /** Props to be spread on the input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the checkbox description element, if any. */
  descriptionProps: DOMAttributesWithRef<HTMLElement>;
  /** Props for the checkbox error message element, if any. */
  errorMessageProps: DOMAttributesWithRef<HTMLElement>;
  /** Whether the toggle is selected. */
  isSelected: boolean;
  /** Whether the toggle is in a pressed state. */
  isPressed: boolean;
  /** Whether the toggle is disabled. */
  isDisabled: boolean;
  /** Whether the toggle is read only. */
  isReadOnly: boolean;
  /** Whether the toggle is invalid. */
  isInvalid: boolean;
}

/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 */
export function createToggle(
  props: AriaToggleProps,
  state: ToggleState,
  ref: Accessor<HTMLInputElement | null>
): ToggleAria {
  const _result0 = props;

  // Create validation state here because it doesn't make sense to add to general useToggleState.
  const validationState = createFormValidationState(
    merge(props, {
      get value() {
        return state.isSelected;
      },
    })
  );

  const _result1 = createMemo(() => validationState.displayValidation);
  createFormValidation(props, validationState, ref);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    // since we spread props on label, onChange will end up there as well as in here.
    // so we have to stop propagation at the lowest level that we care about
    e.stopPropagation();
    state.setSelected(getEventTarget(e).checked);
  };

  const hasChildren = createMemo(() => isPresent(_result0.children));

  const hasAriaLabel = createMemo(
    () =>
      isPresent(_result0["aria-label"]) ||
      isPresent(_result0["aria-labelledby"])
  );

  if (
    !untrack(hasChildren) &&
    !untrack(hasAriaLabel) &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn(
      "If you do not provide children, you must specify an aria-label for accessibility"
    );
  }

  // Handle press state for keyboard interactions and cases where labelProps is not used.
  const _result2 = createPress({
    get isDisabled() {
      return _result0.isDisabled ?? false;
    },
    get onClick() {
      return _result0.onClick;
    },
    get onPress() {
      return _result0.onPress;
    },
    get onPressChange() {
      return _result0.onPressChange;
    },
    get onPressEnd() {
      return _result0.onPressEnd;
    },
    get onPressStart() {
      return _result0.onPressStart;
    },
    get onPressUp() {
      return _result0.onPressUp;
    },
  });

  // Handle press state on the label.
  const [isLabelPressed, setLabelPressed] = createSignal(false, {
    ownedWrite: true,
  });

  const _result3 = createPress({
    get isDisabled() {
      return (_result0.isDisabled ?? false) || (_result0.isReadOnly ?? false);
    },
    get onClick() {
      return _result0.onClick;
    },
    onPress(e) {
      if (e.pointerType === "keyboard" || e.pointerType === "virtual") {
        e.continuePropagation();

        return;
      }

      _result0.onPress?.(e);
      state.toggle();
      ref()?.focus();
      const { [privateValidationStateProp]: groupValidationState } = props;

      const { commitValidation } = isTruthy(groupValidationState)
        ? groupValidationState
        : validationState;

      commitValidation();
    },
    onPressEnd(e) {
      // Keyboard interactions are handled directly on the input.
      if (e.pointerType === "keyboard" || e.pointerType === "virtual") {
        e.continuePropagation();

        return;
      }

      _result0.onPressEnd?.(e);
      _result0.onPressChange?.(false);
      setLabelPressed(false);
    },
    onPressStart(e) {
      // Keyboard interactions are handled directly on the input.
      if (e.pointerType === "keyboard" || e.pointerType === "virtual") {
        e.continuePropagation();

        return;
      }

      _result0.onPressStart?.(e);
      _result0.onPressChange?.(true);
      setLabelPressed(true);
    },
    onPressUp(e) {
      if (e.pointerType === "keyboard" || e.pointerType === "virtual") {
        e.continuePropagation();

        return;
      }

      _result0.onPressUp?.(e);
    },
  });

  const _result4 = createFocusable(props, ref);

  const interactions = createMemo(() =>
    mergeProps(_result2.pressProps, _result4.focusableProps)
  );

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  createFormReset(ref, () => state.defaultSelected, state.setSelected);
  // Copied from useField because we don't want the label behavior that provides.
  const descriptionProps = createSlotId2();
  const errorMessageProps = createSlotId2();

  return {
    get descriptionProps() {
      return descriptionProps;
    },
    get errorMessageProps() {
      return errorMessageProps;
    },
    get inputProps() {
      const valueProps: Pick<InputHTMLAttributes, "value" | "defaultValue"> =
        {};

      if (isPresent(_result0.value)) {
        valueProps.value = _result0.value;
        valueProps.defaultValue = _result0.value;
      }

      return mergeProps(domProps(), {
        "aria-controls": ariaValue(props["aria-controls"]),
        "aria-describedby": ariaValue(
          [
            descriptionProps.id,
            errorMessageProps.id,
            _result0["aria-describedby"],
          ]
            .filter(Boolean)
            .join(" ") || undefined
        ),
        "aria-errormessage": ariaValue(props["aria-errormessage"]),
        "aria-invalid": ariaValue(
          _result1().isInvalid ||
            getLegacyOption(props, "validationState") === "invalid" ||
            undefined
        ),
        "aria-readonly": ariaValue((_result0.isReadOnly ?? false) || undefined),
        "aria-required": ariaValue(
          getTruthyValue(
            whenTruthy(
              _result0.isRequired,
              () => (_result0.validationBehavior ?? "aria") === "aria"
            )
          ) ?? undefined
        ),
        checked: state.isSelected,
        defaultChecked: state.isSelected,
        disabled: _result0.isDisabled ?? false,
        onChange,
        required: whenTruthy(
          _result0.isRequired,
          () => (_result0.validationBehavior ?? "aria") === "native"
        ),

        ...valueProps,
        form: _result0.form,
        name: _result0.name,
        type: "checkbox" as const,

        ...interactions(),
      });
    },
    get isDisabled() {
      return _result0.isDisabled ?? false;
    },
    get isInvalid() {
      return (
        _result1().isInvalid ||
        getLegacyOption(props, "validationState") === "invalid"
      );
    },
    get isPressed() {
      return _result2.isPressed || isLabelPressed();
    },
    get isReadOnly() {
      return _result0.isReadOnly ?? false;
    },
    get isSelected() {
      return state.isSelected;
    },
    get labelProps() {
      return mergeProps(_result3.pressProps, {
        onClick: (e: MouseEvent) => {
          e.preventDefault();
        },
      });
    },
    get validationDetails() {
      return _result1().validationDetails;
    },
    get validationErrors() {
      return _result1().validationErrors;
    },
  };
}
