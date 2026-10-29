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
 * Derived from Adobe React Spectrum: packages/react-aria/src/radio/useRadio.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { RadioGroupState } from "@solid2-aria/stately/radio/create-radio-group-state";
import type {
  AriaLabelingProps,
  DOMProps,
  FocusableProps,
  PressEvents,
} from "@solid2-aria/types-shared";
import type { DOMAttributesWithRef } from "@solid2-aria/types-shared-web";
import { createMemo, untrack } from "solid-js";
import type { Accessor, Element as SolidElement } from "solid-js";

import { createFormValidation } from "../form/create-form-validation";
import { createFocusable } from "../interactions/create-focusable";
import { createPress } from "../interactions/create-press";
import type { InputHTMLAttributes, LabelHTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createFormReset } from "../utils/create-form-reset";
import { createSlotId2 } from "../utils/create-slot";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { requireValue } from "../utils/require-value";
import { getTruthyValue } from "../utils/truthy";
import { radioGroupData } from "./utils";

export interface RadioProps extends FocusableProps {
  /**
   * The value of the radio button, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#Value).
   */
  value: string;
  /**
   * The label for the Radio. Accepts any renderable node.
   */
  children?: SolidElement;
  /**
   * Whether the radio button is disabled or not.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean;
}

export interface AriaRadioProps
  extends RadioProps, DOMProps, AriaLabelingProps, PressEvents {}

export interface RadioAria {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the checkbox description element, if any. */
  descriptionProps: DOMAttributesWithRef<HTMLElement>;
  /** Whether the radio is disabled. */
  isDisabled: boolean;
  /** Whether the radio is currently selected. */
  isSelected: boolean;
  /** Whether the radio is in a pressed state. */
  isPressed: boolean;
}

/**
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 *
 * @param props - Props for the radio.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 * @param ref - Ref to the HTML input element.
 */
export function createRadio(
  props: AriaRadioProps,
  state: RadioGroupState,
  ref: Accessor<HTMLInputElement | null>
): RadioAria {
  const _result1 = props;

  const isDisabled = createMemo(
    () => getTruthyValue(props.isDisabled) ?? state.isDisabled
  );

  const hasChildren = createMemo(() => isPresent(_result1.children));

  const hasAriaLabel = createMemo(
    () =>
      isPresent(_result1["aria-label"]) ||
      isPresent(_result1["aria-labelledby"])
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

  const checked = createMemo(() => state.selectedValue === _result1.value);

  const onChange = (e: Event) => {
    e.stopPropagation();
    state.setSelectedValue(_result1.value);
  };

  // Handle press state for keyboard interactions and cases where labelProps is not used.
  const _result2 = createPress({
    get isDisabled() {
      return isDisabled();
    },
    get onClick() {
      return _result1.onClick;
    },
    get onPress() {
      return _result1.onPress;
    },
    get onPressChange() {
      return _result1.onPressChange;
    },
    get onPressEnd() {
      return _result1.onPressEnd;
    },
    get onPressStart() {
      return _result1.onPressStart;
    },
    get onPressUp() {
      return _result1.onPressUp;
    },
  });

  // Handle press state on the label.
  const _result3 = createPress({
    get isDisabled() {
      return isDisabled();
    },
    get onClick() {
      return _result1.onClick;
    },
    onPress(e) {
      _result1.onPress?.(e);
      state.setSelectedValue(_result1.value);
      ref()?.focus();
    },
    get onPressChange() {
      return _result1.onPressChange;
    },
    get onPressEnd() {
      return _result1.onPressEnd;
    },
    get onPressStart() {
      return _result1.onPressStart;
    },
    get onPressUp() {
      return _result1.onPressUp;
    },
  });

  const _result4 = createFocusable(
    mergeProps(props, {
      onFocus: () => {
        state.setLastFocusedValue(_result1.value);
      },
    }),
    ref
  );

  const interactions = createMemo(() =>
    mergeProps(_result2.pressProps, _result4.focusableProps)
  );

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const tabIndex = createMemo(() => {
    let tabStop: number | undefined;

    if (!isDisabled()) {
      if (isPresent(state.selectedValue)) {
        tabStop = state.selectedValue === _result1.value ? 0 : -1;
      } else {
        tabStop =
          state.lastFocusedValue === _result1.value ||
          state.lastFocusedValue === null ||
          state.lastFocusedValue === undefined
            ? 0
            : -1;
      }
    }

    return tabStop;
  });

  const _result5 = requireValue(
    radioGroupData.get(state),
    "Expected radioGroupData.get(state)"
  );

  createFormReset(
    ref,
    () => state.defaultSelectedValue,
    state.setSelectedValue
  );
  createFormValidation(
    {
      get validationBehavior() {
        return _result5.validationBehavior;
      },
    },
    state,
    ref
  );
  const descriptionProps = createSlotId2();

  const _memo0 = {
    onClick: (e: MouseEvent) => {
      e.preventDefault();
    },
    // Prevent label from being focused when mouse down on it.
    // Note, this does not prevent the input from being focused in the `click` event.
    onMouseDown: (e: MouseEvent) => {
      e.preventDefault();
    },
  };

  return {
    get descriptionProps() {
      return descriptionProps;
    },
    get inputProps() {
      return mergeProps(domProps(), {
        ...interactions(),
        "aria-describedby": ariaValue(
          [
            props["aria-describedby"],
            descriptionProps.id,
            state.isInvalid ? _result5.errorMessageId : null,
            _result5.descriptionId,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        ),
        checked: checked(),
        defaultChecked: checked(),
        defaultValue: _result1.value,
        disabled: isDisabled(),
        form: _result5.form,
        name: _result5.name,
        onChange,
        required: state.isRequired && _result5.validationBehavior === "native",
        tabindex: tabIndex(),
        type: "radio" as const,
        value: _result1.value,
      });
    },
    get isDisabled() {
      return isDisabled();
    },
    get isPressed() {
      return _result2.isPressed || _result3.isPressed;
    },
    get isSelected() {
      return checked();
    },
    get labelProps() {
      return mergeProps(_result3.pressProps, _memo0);
    },
  };
}
