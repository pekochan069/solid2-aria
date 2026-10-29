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
 * Derived from Adobe React Spectrum: packages/react-aria/src/color/useColorField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ColorFieldProps,
  ColorFieldState,
} from "@solid2-aria/stately/color/create-color-field-state";
import { privateValidationStateProp } from "@solid2-aria/stately/form/create-form-validation-state";
import type {
  ScrollEvent,
  AriaLabelingProps,
  AriaValidationProps,
  FocusableDOMProps,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type {
  DOMAttributes,
  TextInputDOMProps,
} from "@solid2-aria/types-shared-web";
import { merge, omit, createMemo, createSignal, flush } from "solid-js";
import type { Accessor } from "solid-js";

import { createFocusWithin } from "../interactions/create-focus-within";
import { createKeyboard } from "../interactions/create-keyboard";
import { createScrollWheel } from "../interactions/create-scroll-wheel";
import { createSpinButton } from "../spinbutton/create-spin-button";
import { createFormattedTextField } from "../textfield/create-formatted-text-field";
import type { TextFieldAria } from "../textfield/create-text-field";
import { ariaValue } from "../utils/aria-value";
import { createFormReset } from "../utils/create-form-reset";
import { createId } from "../utils/create-id";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";

export interface AriaColorFieldProps
  extends
    ColorFieldProps,
    AriaLabelingProps,
    FocusableDOMProps,
    Omit<
      TextInputDOMProps,
      | "minLength"
      | "maxLength"
      | "pattern"
      | "type"
      | "inputMode"
      | "autoComplete"
      | "autoCorrect"
      | "spellCheck"
    >,
    AriaValidationProps {
  /** Enables or disables changing the value with scroll. */
  isWheelDisabled?: boolean;
}

export interface ColorFieldAria extends ValidationResult {
  /** Props for the label element. */
  labelProps: TextFieldAria["labelProps"];
  /** Props for the input element. */
  inputProps: TextFieldAria["inputProps"];
  /** Props for the text field's description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the text field's error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a color field component.
 * Color fields allow users to enter and adjust a hex color value.
 */
export function createColorField(
  props: AriaColorFieldProps,
  state: ColorFieldState,
  ref: Accessor<HTMLInputElement | null>
): ColorFieldAria {
  const _result0 = props;
  const _result1 = state;
  const inputId = createId();

  const _result2 = createSpinButton({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get isReadOnly() {
      return _result0.isReadOnly;
    },
    get isRequired() {
      return _result0.isRequired;
    },
    get maxValue(): 0xff_ff_ff {
      return 0xff_ff_ff;
    },
    get minValue(): 0 {
      return 0;
    },
    get onDecrement() {
      return _result1.decrement;
    },
    get onDecrementToMin() {
      return _result1.decrementToMin;
    },
    get onIncrement() {
      return _result1.increment;
    },
    get onIncrementToMax() {
      return _result1.incrementToMax;
    },
    get textValue() {
      return _result1.colorValue
        ? _result1.colorValue.toString("hex")
        : undefined;
    },
    get value() {
      return _result1.colorValue ? _result1.colorValue.toHexInt() : undefined;
    },
  });

  const [focusWithin, setFocusWithin] = createSignal(false, {
    ownedWrite: true,
  });

  const _result3 = createFocusWithin({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get onFocusWithinChange() {
      return setFocusWithin;
    },
  });

  const onWheel = (e: ScrollEvent) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) {
      return;
    }

    if (e.deltaY > 0) {
      _result1.increment();
    } else if (e.deltaY < 0) {
      _result1.decrement();
    }
  };

  // If the input isn't supposed to receive input, disable scrolling.
  const scrollingDisabled = createMemo(
    () =>
      getTruthyValue(
        getTruthyValue(
          getTruthyValue(_result0.isWheelDisabled) ?? _result0.isDisabled
        ) ?? _result0.isReadOnly
      ) ?? !focusWithin()
  );

  createScrollWheel(
    {
      get isDisabled() {
        return scrollingDisabled();
      },
      get onScroll() {
        return onWheel;
      },
    },
    ref
  );

  const _result4 = createKeyboard({
    get isDisabled() {
      return getTruthyValue(_result0.isDisabled) ?? _result0.isReadOnly;
    },
    get onKeyDown() {
      return _result0.onKeyDown;
    },
    get onKeyUp() {
      return _result0.onKeyUp;
    },
    get shortcuts() {
      return {
        Enter: () => {
          _result1.commit();
          flush();

          _result1.commitValidation();

          return { shouldPreventDefault: false };
        },
      };
    },
  });

  const onChange = (value: string) => {
    if (state.validate(value)) {
      state.setInputValue(value);
    }
  };

  // This is handled separately below.
  const destructured0 = createFormattedTextField(
    merge(omit(props, "validate"), {
      get autoComplete(): "off" {
        return "off" as const;
      },
      // Intentionally invalid value that will be ignored by onChange during form reset
      get defaultValue(): "!" {
        return "!" as const;
      },
      get id() {
        return inputId();
      },
      get onChange() {
        return onChange;
      },
      onKeyDown: undefined,
      onKeyUp: undefined,
      get [privateValidationStateProp]() {
        return state;
      },
      get type(): "text" {
        return "text" as const;
      },
      validate: undefined,
      get value() {
        return _result1.inputValue;
      },
    }),
    state,
    ref
  );

  const otherProps = omit(destructured0, "inputProps");

  createFormReset(ref, () => state.defaultColorValue, state.setColorValue);

  const inputProps = mergeProps(
    merge(() => _result4.keyboardProps),
    merge(() => destructured0.inputProps),
    merge(() => _result2.spinButtonProps),
    merge(() => _result3.focusWithinProps),
    {
      "aria-valuemax": ariaValue(null),
      "aria-valuemin": ariaValue(null),
      "aria-valuenow": ariaValue(null),
      "aria-valuetext": ariaValue(null),
      autocorrect: "off",
      onBlur: _result1.commit,
      role: "textbox",
      spellcheck: "false",
    }
  );

  const requiredInputProps = merge(inputProps, {
    get "aria-required"() {
      return (_result0.validationBehavior ?? "aria") === "native"
        ? undefined
        : inputProps["aria-required"];
    },
  });

  return merge(
    {
      get inputProps() {
        return requiredInputProps;
      },
    },
    otherProps
  );
}
