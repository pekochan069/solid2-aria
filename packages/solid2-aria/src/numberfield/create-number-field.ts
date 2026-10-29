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
 * Derived from Adobe React Spectrum: packages/react-aria/src/numberfield/useNumberField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { privateValidationStateProp } from "@solid2-aria/stately/form/create-form-validation-state";
import type {
  NumberFieldProps,
  NumberFieldState,
} from "@solid2-aria/stately/numberfield/create-number-field-state";
import type {
  ScrollEvent,
  PressEvent,
  AriaLabelingProps,
  DOMProps,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type {
  DOMAttributes,
  GroupDOMAttributes,
  TextInputDOMEvents,
  TextInputDOMProps,
} from "@solid2-aria/types-shared-web";
import {
  omit,
  merge,
  createMemo,
  createSignal,
  createEffect,
  flush,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/numberfield/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { createNumberFormatter } from "../i18n/create-number-formatter";
import { createFocus } from "../interactions/create-focus";
import { createFocusWithin } from "../interactions/create-focus-within";
import { createKeyboard } from "../interactions/create-keyboard";
import { createScrollWheel } from "../interactions/create-scroll-wheel";
import { announce } from "../live-announcer/live-announcer";
import { createSpinButton } from "../spinbutton/create-spin-button";
import { createFormattedTextField } from "../textfield/create-formatted-text-field";
import type {
  ClipboardEvent,
  ClipboardEventHandler,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { createFormReset } from "../utils/create-form-reset";
import { createId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isCallable } from "../utils/is-callable";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { noop } from "../utils/noop";
import { isAndroid, isIOS, isIPhone } from "../utils/platform";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export interface AriaNumberFieldProps
  extends NumberFieldProps, DOMProps, AriaLabelingProps, TextInputDOMEvents {
  /**
   * A custom aria-label for the decrement button. If not provided, the localized string "Decrement"
   * is used.
   */
  decrementAriaLabel?: string;
  /**
   * A custom aria-label for the increment button. If not provided, the localized string "Increment"
   * is used.
   */
  incrementAriaLabel?: string;
  /**
   * Enables or disables changing the value with scroll.
   */
  isWheelDisabled?: boolean;
}

export interface NumberFieldAria extends ValidationResult {
  /** Props for the label element. */
  labelProps: LabelHTMLAttributes;
  /** Props for the group wrapper around the input and stepper buttons. */
  groupProps: GroupDOMAttributes;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the increment button, to be passed to `useButton`. */
  incrementButtonProps: AriaButtonProps;
  /** Props for the decrement button, to be passed to `useButton`. */
  decrementButtonProps: AriaButtonProps;
  /** Props for the number field's description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the number field's error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a number field component. Number
 * fields allow users to enter a number, and increment or decrement the value using stepper
 * buttons.
 */
export function createNumberField(
  props: AriaNumberFieldProps,
  state: NumberFieldState,
  inputRef: Accessor<HTMLInputElement | null>
): NumberFieldAria {
  const _result0 = props;
  const _result1 = state;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/numberfield"
  );

  const commitAndAnnounce = () => {
    const oldValue = inputRef()?.value ?? "";
    // Set input value to normalized valid value
    _result1.commit();
    flush();

    if (inputRef()?.value !== oldValue) {
      announce(inputRef()?.value ?? "", "assertive");
    }
  };

  const inputId = createId(() => _result0.id);

  const _result2 = createFocus({
    onBlur() {
      commitAndAnnounce();
    },
  });

  const numberFormatter = createNumberFormatter(_result0.formatOptions);

  const intlOptions = createMemo(() => numberFormatter.resolvedOptions());

  // Replace negative textValue formatted using currencySign: 'accounting'
  // with a textValue that can be announced using a minus sign.
  const textValueFormatter = createNumberFormatter(
    merge(_result0.formatOptions, {
      currencySign: undefined,
    })
  );

  const textValue = createMemo(() =>
    Number.isNaN(_result1.numberValue)
      ? ""
      : textValueFormatter.format(_result1.numberValue)
  );

  const _result3 = createSpinButton({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get isReadOnly() {
      return _result0.isReadOnly;
    },
    get isRequired() {
      return _result0.isRequired;
    },
    get maxValue() {
      return _result0.maxValue;
    },
    get minValue() {
      return _result0.minValue;
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
      return textValue();
    },
    get value() {
      return _result1.numberValue;
    },
  });

  const [focusWithin, setFocusWithin] = createSignal(false, {
    ownedWrite: true,
  });

  const _result4 = createFocusWithin({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get onFocusWithinChange() {
      return setFocusWithin;
    },
  });

  const onWheel = (e: ScrollEvent) => {
    // if on a trackpad, users can scroll in both X and Y at once, check the magnitude of the change
    // if it's mostly in the X direction, then just return, the user probably doesn't mean to inc/dec
    // this isn't perfect, events come in fast with small deltas and a part of the scroll may give a false indication
    // especially if the user is scrolling near 45deg
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
    inputRef
  );

  // The inputMode attribute influences the software keyboard that is shown on touch devices.
  // Browsers and operating systems are quite inconsistent about what keys are available, however.
  // We choose between numeric and decimal based on whether we allow negative and fractional numbers,
  // and based on testing on various devices to determine what keys are available in each inputMode.
  const hasDecimals = createMemo(
    () => (intlOptions().maximumFractionDigits ?? 0) > 0
  );

  const hasNegative = createMemo(
    () =>
      state.minValue === undefined ||
      Number.isNaN(state.minValue) ||
      state.minValue < 0
  );

  const inputMode = createMemo(() => {
    let result: TextInputDOMProps["inputMode"] = "numeric";

    if (isIPhone()) {
      // iPhone doesn't have a minus sign in either numeric or decimal.
      // Note this is only for iPhone, not iPad, which always has both
      // minus and decimal in numeric.
      if (hasNegative()) {
        result = "text";
      } else if (hasDecimals()) {
        result = "decimal";
      }
    } else if (isAndroid()) {
      // Android numeric has both a decimal point and minus key.
      // decimal does not have a minus key.
      if (hasNegative()) {
        result = "numeric";
      } else if (hasDecimals()) {
        result = "decimal";
      }
    }

    return result;
  });

  const onChange = (value: string) => {
    if (state.validate(value)) {
      state.setInputValue(value);
    }
  };

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (
    e: ClipboardEvent<HTMLInputElement>
  ) => {
    props.onPaste?.(e);
    const inputElement = getEventTarget(e);

    // we can only handle the case where the paste takes over the entire input, otherwise things get very complicated
    // trying to calculate the new string based on what the paste is replacing and where in the source string it is
    if (
      isTruthy(inputElement) &&
      (inputElement.selectionEnd ?? -1) - (inputElement.selectionStart ?? 0) ===
        inputElement.value.length
    ) {
      e.preventDefault();
      // commit so that the user gets to see what it formats to immediately
      // paste happens before inputRef's value is updated, so have to prevent the default and do it ourselves
      // spin button will then handle announcing the new value, this should work with controlled state as well
      // because the announcement is done as a result of the new rendered input value if there is one
      _result1.commit(e.clipboardData?.getData?.("text/plain")?.trim() ?? "");
    }
  };

  const domProps = createMemo(() => filterDOMProps(props));

  const _result5 = createKeyboard({
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

  const _result6 = createMemo(() => state.displayValidation);

  const _result7 = createFormattedTextField(
    merge(
      omit(
        _result0,
        "validate",
        "id",
        "decrementAriaLabel",
        "incrementAriaLabel",
        "isDisabled",
        "isReadOnly",
        "isRequired",
        "minValue",
        "maxValue",
        "autoFocus",
        "label",
        "formatOptions",
        "onBlur",
        "onFocus",
        "onFocusChange",
        "onKeyDown",
        "onKeyUp",
        "description",
        "errorMessage",
        "isWheelDisabled"
      ),
      domProps,
      {
        get "aria-label"() {
          return ariaValue(
            ariaValue(getTruthyValue(props["aria-label"]) ?? undefined)
          );
        },
        get "aria-labelledby"() {
          return ariaValue(
            ariaValue(getTruthyValue(props["aria-labelledby"]) ?? undefined)
          );
        },
        get autoComplete(): "off" {
          return "off" as const;
        },
        get autoFocus() {
          return _result0.autoFocus;
        },
        get defaultValue(): "!" {
          return "!" as const;
        },
        get description() {
          return _result0.description;
        },
        get errorMessage() {
          return _result0.errorMessage;
        },
        form: undefined,
        get id() {
          return inputId();
        },
        get inputMode() {
          return inputMode();
        },
        get isDisabled() {
          return _result0.isDisabled;
        },
        get isReadOnly() {
          return _result0.isReadOnly;
        },
        get isRequired() {
          return _result0.isRequired;
        },
        get label() {
          return _result0.label;
        },
        // These props are added to a hidden input rather than the formatted textfield.
        name: undefined,
        get onBlur() {
          return _result0.onBlur ?? noop;
        },
        get onChange() {
          return onChange;
        },
        get onFocus() {
          return _result0.onFocus;
        },
        get onFocusChange() {
          return _result0.onFocusChange;
        },
        get onPaste() {
          return onPaste;
        },
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
      }
    ),
    state,
    inputRef
  );

  // Merge outside useFormattedTextField so useKeyboard's createEventHandler is not nested inside
  // useTextField/useFocusable's createEventHandler (avoids redundant stopPropagation on RS events).
  // Shortcuts run first (mergeProps chains the second argument after the first).
  const textFieldProps = createMemo(() =>
    mergeProps(_result5.keyboardProps, _result7.inputProps)
  );

  createFormReset(
    inputRef,
    () => state.defaultNumberValue,
    state.setNumberValue
  );
  createNativeValidation(state, props, inputRef);

  const inputProps = createMemo(() => {
    const result: InputHTMLAttributes = mergeProps(
      _result3.spinButtonProps,
      _result2.focusProps,
      textFieldProps(),
      {
        // ignore aria-roledescription on iOS so that required state will announce when it is present
        "aria-roledescription": ariaValue(
          isIOS() ? null : stringFormatter.format("numberField")
        ),
        "aria-valuemax": ariaValue(null),
        "aria-valuemin": ariaValue(null),
        "aria-valuenow": ariaValue(null),
        "aria-valuetext": ariaValue(null),
        autocorrect: "off",
        // override the spinbutton role, we can't focus a spin button with VO
        role: false as const,
        spellcheck: "false",
      }
    );

    if (props.validationBehavior === "native") {
      result["aria-required"] = undefined;
    }

    return result;
  });

  const onButtonPressStart = (e: PressEvent) => {
    // If focus is already on the input, keep it there so we don't hide the
    // software keyboard when tapping the increment/decrement buttons.
    if (getActiveElement() === inputRef()) {
      return;
    }

    // Otherwise, when using a mouse, move focus to the input.
    // On touch, or with a screen reader, focus the button so that the software
    // keyboard does not appear and the screen reader cursor is not moved off the button.
    if (e.pointerType === "mouse") {
      inputRef()?.focus();
    } else if ("focus" in e.target && isCallable(e.target.focus)) {
      e.target.focus();
    }
  };

  // Determine the label for the increment and decrement buttons. There are 4 cases:
  //
  // 1. With a visible label that is a string: aria-label: `Increase ${props.label}`
  // 2. With a visible label that is JSX: aria-label: 'Increase', aria-labelledby: '${incrementId} ${labelId}'
  // 3. With an aria-label: aria-label: `Increase ${props['aria-label']}`
  // 4. With an aria-labelledby: aria-label: 'Increase', aria-labelledby: `${incrementId} ${props['aria-labelledby']}`
  //
  // (1) and (2) could possibly be combined and both use aria-labelledby. However, placing the label in
  // the aria-label string rather than using aria-labelledby gives more flexibility to translators to change
  // the order or add additional words around the label if needed.
  const fieldLabel = createMemo(
    () =>
      getTruthyValue(props["aria-label"]) ??
      (typeof props.label === "string" ? props.label : "")
  );

  const ariaLabelledby = createMemo((): undefined | string => {
    if (fieldLabel()) {
      return undefined;
    }

    const id = isPresent(props.label)
      ? _result7.labelProps.id
      : props["aria-labelledby"];

    return typeof id === "string" ? id : undefined;
  });

  const incrementId = createId();
  const decrementId = createId();

  const incrementButtonProps = createMemo(() =>
    mergeProps(_result3.incrementButtonProps, {
      allowFocusWhenDisabled: true,
      "aria-controls": ariaValue(inputId()),
      "aria-label": ariaValue(
        getTruthyValue(_result0.incrementAriaLabel) ??
          stringFormatter
            .format("increase", { fieldLabel: fieldLabel() })
            .trim()
      ),
      "aria-labelledby": ariaValue(
        isTruthy(ariaLabelledby()) && !isTruthy(_result0.incrementAriaLabel)
          ? `${incrementId()} ${ariaLabelledby()}`
          : null
      ),
      excludeFromTabOrder: true,
      id:
        isTruthy(ariaLabelledby()) && !isTruthy(_result0.incrementAriaLabel)
          ? incrementId()
          : null,
      isDisabled: !state.canIncrement,
      onPressStart: onButtonPressStart,
      preventFocusOnPress: true,
    })
  );

  const decrementButtonProps = createMemo(() =>
    mergeProps(_result3.decrementButtonProps, {
      allowFocusWhenDisabled: true,
      "aria-controls": ariaValue(inputId()),
      "aria-label": ariaValue(
        getTruthyValue(_result0.decrementAriaLabel) ??
          stringFormatter
            .format("decrease", { fieldLabel: fieldLabel() })
            .trim()
      ),
      "aria-labelledby": ariaValue(
        isTruthy(ariaLabelledby()) && !isTruthy(_result0.decrementAriaLabel)
          ? `${decrementId()} ${ariaLabelledby()}`
          : null
      ),
      excludeFromTabOrder: true,
      id:
        isTruthy(ariaLabelledby()) && !isTruthy(_result0.decrementAriaLabel)
          ? decrementId()
          : null,
      isDisabled: !state.canDecrement,
      onPressStart: onButtonPressStart,
      preventFocusOnPress: true,
    })
  );

  return {
    get decrementButtonProps() {
      return decrementButtonProps();
    },
    get descriptionProps() {
      return _result7.descriptionProps;
    },
    get errorMessageProps() {
      return _result7.errorMessageProps;
    },
    get groupProps() {
      return merge(_result4.focusWithinProps, {
        get "aria-disabled"() {
          return ariaValue(ariaValue(_result0.isDisabled));
        },
        get "aria-invalid"() {
          return ariaValue(
            ariaValue(_result6().isInvalid ? "true" : undefined)
          );
        },
        get role(): "group" {
          return "group" as const;
        },
      });
    },
    get incrementButtonProps() {
      return incrementButtonProps();
    },
    get inputProps() {
      return inputProps();
    },
    get isInvalid() {
      return _result6().isInvalid;
    },
    get labelProps() {
      return _result7.labelProps;
    },
    get validationDetails() {
      return _result6().validationDetails;
    },
    get validationErrors() {
      return _result6().validationErrors;
    },
  };
}

let numberInput: HTMLInputElement | null = null;

function createNativeValidation(
  state: NumberFieldState,
  props: Pick<
    AriaNumberFieldProps,
    "validationBehavior" | "commitBehavior" | "step"
  >,
  inputRef: Accessor<HTMLInputElement | null>
) {
  createEffect(
    () => ({
      commitBehavior: props.commitBehavior,
      inputElement: inputRef(),
      max: state.maxValue,
      min: state.minValue,
      observedIsInvalid: state.realtimeValidation.isInvalid,
      step: props.step,
      validationBehavior: props.validationBehavior,
      value: state.numberValue,
    }),
    ({
      observedIsInvalid,
      inputElement,
      validationBehavior,
      commitBehavior,
      min,
      max,
      step,
      value,
    }) => {
      const input = inputElement;

      if (
        commitBehavior !== "validate" ||
        observedIsInvalid ||
        !input ||
        input.disabled
      ) {
        return;
      }

      // Create a native number input and use it to implement validation of min/max/step.
      // This lets us get the native validation message provided by the browser instead of needing our own translations.
      if (!numberInput && typeof document !== "undefined") {
        numberInput = document.createElement("input");
        numberInput.type = "number";
      }

      if (!numberInput) {
        // For TypeScript.
        return;
      }

      numberInput.min = validationNumber(min);
      numberInput.max = validationNumber(max);
      numberInput.step = validationNumber(step);
      numberInput.value = validationNumber(value);
      // Merge validity with the visible text input (for other validations like required).
      const valid = input.validity.valid && numberInput.validity.valid;

      const validationMessage =
        input.validationMessage || numberInput.validationMessage;

      const validity = {
        isInvalid: !valid,
        validationDetails: {
          badInput: input.validity.badInput,
          customError: input.validity.customError,
          patternMismatch: input.validity.patternMismatch,
          rangeOverflow: numberInput.validity.rangeOverflow,
          rangeUnderflow: numberInput.validity.rangeUnderflow,
          stepMismatch: numberInput.validity.stepMismatch,
          tooLong: input.validity.tooLong,
          tooShort: input.validity.tooShort,
          typeMismatch: input.validity.typeMismatch,
          valid,
          valueMissing: input.validity.valueMissing,
        },
        validationErrors: validationMessage ? [validationMessage] : [],
      };

      untrack(() => {
        state.updateValidation(validity);
      });

      // Block form submission if validation behavior is native.
      // This won't overwrite any user-defined validation message because we checked realtimeValidation above.
      if (validationBehavior === "native" && !numberInput.validity.valid) {
        input.setCustomValidity(numberInput.validationMessage);
      }
    },
    { ssrSource: "client" }
  );
}

function validationNumber(value: number | null | undefined): string {
  return isPresent(value) && !Number.isNaN(value) ? String(value) : "";
}
