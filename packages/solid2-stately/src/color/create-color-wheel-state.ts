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
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/useColorWheelState.ts.
 * Modified for Solid Aria: adapted reactive state and public APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ValueBase } from "@solid2-aria/types-shared";
import { createMemo, createSignal, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { normalizeColor, parseColor } from "./color";
import type { Color } from "./types";

export interface ColorWheelProps extends Omit<
  ValueBase<string | Color>,
  "onChange"
> {
  /** Whether the ColorWheel is disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the value changes, as the user drags. */
  onChange?: (value: Color) => void;
  /** Handler that is called when the user stops dragging. */
  onChangeEnd?: (value: Color) => void;
  /**
   * The default value (uncontrolled).
   *
   * @default 'hsl(0, 100%, 50%)'
   */
  defaultValue?: string | Color;
}

export interface ColorWheelState {
  /** The current color value represented by the color wheel. */
  readonly value: Color;
  /** The default color value. */
  readonly defaultValue: Color;
  /** Sets the color value represented by the color wheel, and triggers `onChange`. */
  setValue: (value: string | Color) => void;

  /** The current value of the hue channel displayed by the color wheel. */
  readonly hue: number;
  /** Sets the hue channel of the current color value and triggers `onChange`. */
  setHue: (value: number) => void;

  /**
   * Sets the hue channel of the current color value based on the given coordinates and radius of
   * the color wheel, and triggers `onChange`.
   */
  setHueFromPoint: (x: number, y: number, radius: number) => void;
  /** Returns the coordinates of the thumb relative to the center point of the color wheel. */
  getThumbPosition: (radius: number) => { x: number; y: number };

  /** Increments the hue by the given amount (defaults to 1). */
  increment: (stepSize?: number) => void;
  /** Decrements the hue by the given amount (defaults to 1). */
  decrement: (stepSize?: number) => void;

  /** Whether the color wheel is currently being dragged. */
  readonly isDragging: boolean;
  /** Sets whether the color wheel is being dragged. */
  setDragging: (value: boolean) => void;
  /** Returns the color that should be displayed in the color wheel instead of `value`. */
  getDisplayColor: () => Color;
  /** The step value of the hue channel, used when incrementing and decrementing. */
  step: number;
  /** The page step value of the hue channel, used when incrementing and decrementing. */
  pageStep: number;

  /** Whether the color wheel is disabled. */
  readonly isDisabled: boolean;
}

const DEFAULT_COLOR = parseColor("hsl(0, 100%, 50%)");

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function roundDown(v: number) {
  const r = Math.floor(v);

  if (r === v) {
    return v - 1;
  }

  return r;
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

// 0deg = 3 o'clock. increases clockwise
function angleToCartesian(angle: number, radius: number) {
  const rad = degToRad(360 - angle + 90);
  const x = Math.sin(rad) * radius;
  const y = Math.cos(rad) * radius;

  return { x, y };
}

function cartesianToAngle(x: number, y: number, radius: number): number {
  const deg = radToDeg(Math.atan2(y / radius, x / radius));

  return (deg + 360) % 360;
}

/**
 * Provides state management for a color wheel component.
 * Color wheels allow users to adjust the hue of an HSL or HSB color value on a circular track.
 */

export function createColorWheelState(props: ColorWheelProps): ColorWheelState {
  const defaultValue = () =>
    props.defaultValue !== undefined && props.defaultValue !== ""
      ? normalizeColor(props.defaultValue)
      : DEFAULT_COLOR;

  const controlledValue = createMemo(() =>
    props.value !== undefined && props.value !== ""
      ? normalizeColor(props.value)
      : undefined
  );

  const [stateValue, setValueState] = createControlledSignal(
    controlledValue,
    untrack(defaultValue),
    (v) => props.onChange?.(v)
  );

  const initialValue = untrack(stateValue);

  const value = createMemo(() => {
    const c = stateValue();

    return c.getColorSpace() === "rgb" ? c.toFormat("hsl") : c;
  });

  const range = () => value().getChannelRange("hue");
  const hue = () => value().getChannelValue("hue");
  const [isDragging, setDragging] = createSignal(false);
  let dragging = false;
  let lastValue = untrack(value);

  const setValue = (v: Color) => {
    lastValue = v;
    setValueState(v);
  };

  function setHue(input: number) {
    const v = roundToStep(mod(input > 360 ? 0 : input, 360), range().step);

    if (v !== hue()) {
      setValue(value().withChannelValue("hue", v));
    }
  }

  return {
    decrement(stepSize = 1) {
      const s = Math.max(stepSize, range().step);
      setHue(
        hue() === 0
          ? roundDown(360 / s) * s
          : roundToStep(mod(hue() - s, 360), s)
      );
    },
    get defaultValue() {
      return props.value === undefined ? defaultValue() : initialValue;
    },
    getDisplayColor() {
      return value()
        .toFormat("hsl")
        .withChannelValue("saturation", 100)
        .withChannelValue("lightness", 50)
        .withChannelValue("alpha", 1);
    },
    getThumbPosition(radius) {
      return angleToCartesian(hue(), radius);
    },
    get hue() {
      return hue();
    },
    increment(stepSize = 1) {
      const s = Math.max(stepSize, range().step);
      let v = hue() + s;

      if (v >= range().maxValue) {
        v = range().minValue;
      }

      setHue(roundToStep(mod(v, 360), s));
    },
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get isDragging() {
      return isDragging();
    },
    get pageStep() {
      return range().pageSize;
    },
    setDragging(v) {
      const wasDragging = dragging;
      dragging = v;

      if (wasDragging && !v) {
        props.onChangeEnd?.(lastValue);
      }

      setDragging(v);
    },
    setHue,
    setHueFromPoint(x, y, radius) {
      setHue(cartesianToAngle(x, y, radius));
    },
    setValue(v) {
      setValue(normalizeColor(v));
    },
    get step() {
      return range().step;
    },
    get value() {
      return value();
    },
  };
}
