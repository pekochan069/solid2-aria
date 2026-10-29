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
 * Derived from Adobe React Spectrum: packages/react-stately/src/numberfield/useNumberFieldState.ts.
 * Modified for Solid Aria: adapted state handling, APIs, or formatting for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { NumberFormatter, NumberParser } from "@internationalized/number";
import type {
  FocusableProps,
  HelpTextProps,
  InputBase,
  LabelableProps,
  RangeInputBase,
  TextInputBase,
  Validation,
  ValueBase,
} from "@solid2-aria/types-shared";
import {
  createMemo,
  createSignal,
  createRenderEffect,
  merge,
  untrack,
} from "solid-js";

import { createFormValidationState } from "../form/create-form-validation-state";
import type { FormValidationState } from "../form/create-form-validation-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { clamp, snapValueToStep } from "../utils/number";

export interface NumberFieldProps
  extends
    InputBase,
    Validation<number>,
    FocusableProps,
    TextInputBase,
    ValueBase<number>,
    RangeInputBase<number>,
    LabelableProps,
    HelpTextProps {
  /**
   * Formatting options for the value displayed in the number field.
   * This also affects what characters are allowed to be typed by the user.
   */
  formatOptions?: Intl.NumberFormatOptions;
  /**
   * Controls the behavior of the number field when the user blurs the field after editing. 'snap'
   * will clamp the value to the min/max values, and snap to the nearest step value. 'validate' will
   * not clamp the value, and will validate that the value is within the min/max range and on a
   * valid step.
   *
   * @default 'snap'
   */
  commitBehavior?: "snap" | "validate";
}

export interface NumberFieldState extends FormValidationState {
  /**
   * The current text value of the input. Updated as the user types,
   * and formatted according to `formatOptions` on blur.
   */
  inputValue: string;
  /**
   * The currently parsed number value, or Number.NaN if a valid number could not be parsed.
   * Updated based on the `inputValue` as the user types.
   */
  numberValue: number;
  /** The default value of the input. */
  defaultNumberValue: number;
  /** The minimum value of the number field. */
  minValue?: number;
  /** The maximum value of the number field. */
  maxValue?: number;
  /** Whether the current value can be incremented according to the maximum value and step. */
  canIncrement: boolean;
  /** Whether the current value can be decremented according to the minimum value and step. */
  canDecrement: boolean;
  /**
   * Validates a user input string according to the current locale and format options. Values can be
   * partially entered, and may be valid even if they cannot currently be parsed to a number. Can be
   * used to implement validation as a user types.
   */
  validate: (value: string) => boolean;
  /** Sets the current text value of the input. */
  setInputValue: (val: string) => void;
  /** Sets the number value. */
  setNumberValue: (val: number) => void;
  /**
   * Commits the current input value. The value is parsed to a number, clamped according to the
   * minimum and maximum values of the field, and snapped to the nearest step value. This will fire
   * the `onChange` prop with the new value, and if uncontrolled, update the `numberValue`.
   * Typically this is called when the field is blurred.
   *
   * @param value - The value to commit. If not provided, the current input value is used.
   */
  commit: (value?: string) => void;
  /** Increments the current input value to the next step boundary, and fires `onChange`. */
  increment: () => void;
  /** Decrements the current input value to the next step boundary, and fires `onChange`. */
  decrement: () => void;
  /** Sets the current value to the `maxValue` if any, and fires `onChange`. */
  incrementToMax: () => void;
  /** Sets the current value to the `minValue` if any, and fires `onChange`. */
  decrementToMin: () => void;
}

export interface NumberFieldStateOptions extends NumberFieldProps {
  /**
   * The locale that should be used for parsing.
   *
   * @default 'en-US'
   */
  locale: string;
}

export function createNumberFieldState(
  props: NumberFieldStateOptions
): NumberFieldState {
  const snap = (v: number) =>
    props.step === undefined || Number.isNaN(props.step)
      ? clamp(v, props.minValue, props.maxValue)
      : snapValueToStep(v, props.minValue, props.maxValue, props.step);

  const normalize = (v: number) =>
    props.commitBehavior === "validate" || Number.isNaN(v) ? v : snap(v);

  const defaults = () => normalize(props.defaultValue ?? Number.NaN);

  const [numberValue, setNumberValue] = createControlledSignal(
    () => (props.value === undefined ? undefined : normalize(props.value)),
    untrack(defaults),
    (v) => props.onChange?.(v)
  );

  const initial = untrack(numberValue);

  const parser = createMemo(
    () => new NumberParser(props.locale, props.formatOptions)
  );

  const [inputValue, setInputValue] = createSignal(
    untrack(() =>
      Number.isNaN(initial)
        ? ""
        : new NumberFormatter(props.locale, props.formatOptions).format(initial)
    ),
    { ownedWrite: true }
  );

  const formatter = createMemo(
    () =>
      new NumberFormatter(props.locale, {
        ...props.formatOptions,
        numberingSystem: parser().getNumberingSystem(inputValue()),
      })
  );

  const format = (v: number) => (Number.isNaN(v) ? "" : formatter().format(v));
  let previous = initial;
  let previousLocale = untrack(() => props.locale);
  let previousOptions = JSON.stringify(untrack(() => props.formatOptions));
  createRenderEffect(
    () => ({
      formatted: format(numberValue()),
      locale: props.locale,
      options: JSON.stringify(props.formatOptions),
      v: numberValue(),
    }),
    (current) => {
      if (
        !Object.is(previous, current.v) ||
        previousLocale !== current.locale ||
        previousOptions !== current.options
      ) {
        previous = current.v;
        previousLocale = current.locale;
        previousOptions = current.options;
        setInputValue(current.formatted);
      }
    }
  );

  const parsed = createMemo(() =>
    inputValue().length === 0 ? Number.NaN : parser().parse(inputValue())
  );

  const validation = createFormValidationState(
    merge(props, {
      get value() {
        return numberValue();
      },
    })
  );

  const step = () => {
    if (props.step !== undefined && !Number.isNaN(props.step)) {
      return props.step;
    }

    return formatter().resolvedOptions().style === "percent" ? 0.01 : 1;
  };

  const nextStep = (direction: 1 | -1) => {
    const v = parsed();

    if (Number.isNaN(v)) {
      return snapValueToStep(
        (direction === 1 ? props.minValue : props.maxValue) ?? 0,
        props.minValue,
        props.maxValue,
        step()
      );
    }

    const n = snapValueToStep(v, props.minValue, props.maxValue, step());

    return direction * (n - v) > 0
      ? n
      : snapValueToStep(
          Number((v + direction * step()).toPrecision(15)),
          props.minValue,
          props.maxValue,
          step()
        );
  };

  const move = (direction: 1 | -1) => {
    const v = nextStep(direction);

    if (v === numberValue()) {
      setInputValue(format(v));
    }

    setNumberValue(v);
    validation.commitValidation();
  };

  return merge(validation, {
    get canDecrement() {
      return (
        props.isDisabled !== true &&
        props.isReadOnly !== true &&
        (Number.isNaN(parsed()) ||
          props.minValue === undefined ||
          Number.isNaN(props.minValue) ||
          nextStep(-1) < parsed())
      );
    },
    get canIncrement() {
      return (
        props.isDisabled !== true &&
        props.isReadOnly !== true &&
        (Number.isNaN(parsed()) ||
          props.maxValue === undefined ||
          Number.isNaN(props.maxValue) ||
          nextStep(1) > parsed())
      );
    },
    commit(override?: string) {
      const text = override ?? inputValue();

      if (!text.length) {
        setNumberValue(Number.NaN);
        setInputValue(props.value === undefined ? "" : format(numberValue()));

        return;
      }

      const v = parser().parse(text);

      if (Number.isNaN(v)) {
        setInputValue(format(numberValue()));

        return;
      }

      const n = parser().parse(format(normalize(v)));
      const changed = n !== numberValue();
      setNumberValue(n);
      setInputValue(format(props.value === undefined ? n : numberValue()));

      if (changed) {
        validation.commitValidation();
      }
    },
    decrement() {
      move(-1);
    },
    decrementToMin() {
      if (props.minValue !== undefined) {
        setNumberValue(props.minValue);
        validation.commitValidation();
      }
    },
    get defaultNumberValue() {
      return Number.isNaN(defaults()) ? initial : defaults();
    },
    increment() {
      move(1);
    },
    incrementToMax() {
      if (props.maxValue !== undefined) {
        setNumberValue(
          snapValueToStep(
            props.maxValue,
            props.minValue,
            props.maxValue,
            step()
          )
        );
        validation.commitValidation();
      }
    },
    get inputValue() {
      return inputValue();
    },
    get maxValue() {
      return props.maxValue;
    },
    get minValue() {
      return props.minValue;
    },
    get numberValue() {
      return parsed();
    },
    setInputValue,
    setNumberValue,
    validate(v: string) {
      return parser().isValidPartialNumber(v, props.minValue, props.maxValue);
    },
  });
}
