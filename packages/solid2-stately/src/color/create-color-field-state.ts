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
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/useColorFieldState.ts.
 * Modified for Solid Aria: adapted reactive state and public APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusableProps,
  HelpTextProps,
  InputBase,
  LabelableProps,
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
import { parseColor } from "./color";
import { createColor } from "./create-color";
import type { Color } from "./types";

export interface ColorFieldProps
  extends
    Omit<ValueBase<string | Color | null>, "onChange">,
    InputBase,
    Validation<Color | null>,
    FocusableProps,
    TextInputBase,
    LabelableProps,
    HelpTextProps {
  /** Handler that is called when the value changes. */
  onChange?: (color: Color | null) => void;
}

export interface ColorFieldState extends FormValidationState {
  /**
   * The current text value of the input. Updated as the user types,
   * and formatted according to `formatOptions` on blur.
   */
  readonly inputValue: string;
  /**
   * The currently parsed color value, or null if the field is empty.
   * Updated based on the `inputValue` as the user types.
   */
  readonly colorValue: Color | null;
  /** The default value of the color field. */
  readonly defaultColorValue: Color | null;
  /** Sets the color value of the field. */
  setColorValue: (value: Color | null) => void;
  /** Sets the current text value of the input. */
  setInputValue: (value: string) => void;
  /**
   * Updates the input value based on the currently parsed color value.
   * Typically this is called when the field is blurred.
   */
  commit: () => void;
  /** Increments the current input value to the next step boundary, and fires `onChange`. */
  increment: () => void;
  /** Decrements the current input value to the next step boundary, and fires `onChange`. */
  decrement: () => void;
  /** Sets the current value to the maximum color value, and fires `onChange`. */
  incrementToMax: () => void;
  /** Sets the current value to the minimum color value, and fires `onChange`. */
  decrementToMin: () => void;
  /**
   * Validates a user input string. Values can be partially entered, and may be valid even if they
   * cannot currently be parsed to a color. Can be used to implement validation as a user types.
   */
  validate: (value: string) => boolean;
}

const MIN_COLOR = parseColor("#000000");
const MAX_COLOR = parseColor("#FFFFFF");
const MIN_COLOR_INT = MIN_COLOR.toHexInt();
const MAX_COLOR_INT = MAX_COLOR.toHexInt();

/**
 * Provides state management for a color field component. Color fields allow
 * users to enter and adjust a hex color value.
 */

const format = (v: Color | null) => (v ? v.toString("hex") : "");

export function createColorFieldState(props: ColorFieldProps): ColorFieldState {
  const value = createColor(() => props.value);
  const defaultValue = createColor(() => props.defaultValue);

  const [colorValue, setColorValue] = createControlledSignal(
    () => value() ?? (props.value === null ? null : undefined),
    untrack(defaultValue) ?? null,
    (v) => props.onChange?.(v)
  );

  const initialValue = untrack(colorValue);

  const [inputValue, setInputValue] = createSignal(
    untrack(() => format(colorValue())),
    { ownedWrite: true }
  );

  let previous = initialValue;
  createRenderEffect(colorValue, (v) => {
    if (previous !== v) {
      previous = v;
      setInputValue(format(v));
    }
  });

  const validation = createFormValidationState(
    merge(props, {
      get value() {
        return colorValue();
      },
    })
  );

  const parsed = createMemo(() => {
    try {
      const v = inputValue();

      return parseColor(v.startsWith("#") ? v : `#${v}`);
    } catch {
      return null;
    }
  });

  const safelySet = (v: Color | null) => {
    if (!v || !colorValue() || v.toHexInt() !== colorValue()?.toHexInt()) {
      setColorValue(v);
    }
  };

  const add = (step: number) => {
    const base = parsed() ?? MIN_COLOR;

    const n = Math.min(
      Math.max(base.toHexInt() + step, MIN_COLOR_INT),
      MAX_COLOR_INT
    );

    const next =
      n === base.toHexInt()
        ? base
        : parseColor(`#${n.toString(16).padStart(6, "0")}`);

    if (next === colorValue()) {
      setInputValue(format(next));
    }

    safelySet(next);
    validation.commitValidation();
  };

  return merge(validation, {
    get colorValue() {
      return colorValue();
    },
    commit() {
      if (!inputValue().length) {
        safelySet(null);
        setInputValue(
          props.value === undefined || colorValue() === null
            ? ""
            : format(colorValue())
        );

        return;
      }

      const next = parsed();

      if (next === null) {
        setInputValue(format(colorValue()));

        return;
      }

      safelySet(next);
      setInputValue(format(props.value === undefined ? next : colorValue()));
      validation.commitValidation();
    },
    decrement() {
      add(-1);
    },
    decrementToMin() {
      safelySet(MIN_COLOR);
    },
    get defaultColorValue() {
      return defaultValue() ?? initialValue;
    },
    increment() {
      add(1);
    },
    incrementToMax() {
      safelySet(MAX_COLOR);
    },
    get inputValue() {
      return inputValue();
    },
    setColorValue,
    setInputValue,
    validate(v: string) {
      return /^#?[0-9a-f]{0,6}$/iu.test(v);
    },
  });
}
