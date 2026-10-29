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
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/useColorAreaState.ts.
 * Modified for Solid Aria: adapted reactive state and public APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ValueBase } from "@solid2-aria/types-shared";
import { createMemo, createSignal, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { clamp, snapValueToStep } from "../utils/number";
import { normalizeColor, parseColor } from "./color";
import type { Color, ColorChannel, ColorSpace } from "./types";

export interface ColorAreaProps extends Omit<
  ValueBase<string | Color>,
  "onChange"
> {
  /**
   * The color space that the color area operates in. The `xChannel` and `yChannel` must be in this
   * color space. If not provided, this defaults to the color space of the `color` or `defaultColor`
   * value.
   */
  colorSpace?: ColorSpace;
  /** Color channel for the horizontal axis. */
  xChannel?: ColorChannel;
  /** Color channel for the vertical axis. */
  yChannel?: ColorChannel;
  /** Whether the ColorArea is disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the value changes, as the user drags. */
  onChange?: (value: Color) => void;
  /** Handler that is called when the user stops dragging. */
  onChangeEnd?: (value: Color) => void;
}

export interface ColorAreaState {
  /** The current color value displayed by the color area. */
  readonly value: Color;
  /** The default value of the color area. */
  readonly defaultValue: Color;
  /** Sets the current color value. If a string is passed, it will be parsed to a Color. */
  setValue: (value: string | Color) => void;

  /** The current value of the horizontal axis channel displayed by the color area. */
  xValue: number;
  /**
   * Sets the value for the horizontal axis channel displayed by the color area, and triggers
   * `onChange`.
   */
  setXValue: (value: number) => void;

  /** The current value of the vertical axis channel displayed by the color area. */
  yValue: number;
  /**
   * Sets the value for the vertical axis channel displayed by the color area, and triggers
   * `onChange`.
   */
  setYValue: (value: number) => void;

  /**
   * Sets the x and y channels of the current color value based on a percentage of the width and
   * height of the color area, and triggers `onChange`.
   */
  setColorFromPoint: (x: number, y: number) => void;
  /**
   * Returns the coordinates of the thumb relative to the upper left corner of the color area as a
   * percentage.
   */
  getThumbPosition: () => { x: number; y: number };

  /** Increments the value of the horizontal axis channel by the channel step or page amount. */
  incrementX: (stepSize?: number) => void;
  /** Decrements the value of the horizontal axis channel by the channel step or page amount. */
  decrementX: (stepSize?: number) => void;

  /** Increments the value of the vertical axis channel by the channel step or page amount. */
  incrementY: (stepSize?: number) => void;
  /** Decrements the value of the vertical axis channel by the channel step or page amount. */
  decrementY: (stepSize?: number) => void;

  /** Whether the color area is currently being dragged. */
  readonly isDragging: boolean;
  /** Sets whether the color area is being dragged. */
  setDragging: (value: boolean) => void;

  /** Returns the xChannel, yChannel and zChannel names based on the color value. */
  channels: {
    xChannel: ColorChannel;
    yChannel: ColorChannel;
    zChannel: ColorChannel;
  };
  /** The step value of the xChannel, used when incrementing and decrementing. */
  xChannelStep: number;
  /** The step value of the yChannel, used when incrementing and decrementing. */
  yChannelStep: number;
  /** The page step value of the xChannel, used when incrementing and decrementing. */
  xChannelPageStep: number;
  /** The page step value of the yChannel, used when incrementing and decrementing. */
  yChannelPageStep: number;

  /** Returns the color that should be displayed in the color area thumb instead of `value`. */
  getDisplayColor: () => Color;
}

const DEFAULT_COLOR = parseColor("#ffffff");

/**
 * Provides state management for a color area component. Color area allows users to adjust two
 * channels of an HSL, HSB or RGB color value against a two-dimensional gradient background.
 */

export function createColorAreaState(props: ColorAreaProps): ColorAreaState {
  const defaultValue = () =>
    props.defaultValue !== undefined && props.defaultValue !== ""
      ? normalizeColor(props.defaultValue)
      : DEFAULT_COLOR;

  const controlledValue = createMemo(() =>
    props.value !== undefined && props.value !== ""
      ? normalizeColor(props.value)
      : undefined
  );

  const [colorValue, setColorState] = createControlledSignal(
    controlledValue,
    untrack(defaultValue),
    (v) => props.onChange?.(v)
  );

  const initialValue = untrack(colorValue);

  const color = createMemo(() =>
    props.colorSpace ? colorValue().toFormat(props.colorSpace) : colorValue()
  );

  const channels = createMemo(() =>
    color().getColorSpaceAxes({
      xChannel: props.xChannel,
      yChannel: props.yChannel,
    })
  );

  const xRange = () => color().getChannelRange(channels().xChannel);
  const yRange = () => color().getChannelRange(channels().yChannel);
  const xValue = () => color().getChannelValue(channels().xChannel);
  const yValue = () => color().getChannelValue(channels().yChannel);
  const [isDragging, setDragging] = createSignal(false);
  let dragging = false;
  let lastValue = untrack(color);

  const setColor = (value: Color) => {
    lastValue = value;
    setColorState(value);
  };

  const setXValue = (v: number) => {
    if (v !== xValue()) {
      setColor(color().withChannelValue(channels().xChannel, v));
    }
  };

  const setYValue = (v: number) => {
    if (v !== yValue()) {
      setColor(color().withChannelValue(channels().yChannel, v));
    }
  };

  const moveX = (amount: number) => {
    const r = xRange();
    setXValue(
      amount > 0 && xValue() + amount > r.maxValue
        ? r.maxValue
        : snapValueToStep(xValue() + amount, r.minValue, r.maxValue, r.step)
    );
  };

  const moveY = (amount: number) => {
    const r = yRange();
    setYValue(
      amount > 0 && yValue() + amount > r.maxValue
        ? r.maxValue
        : snapValueToStep(yValue() + amount, r.minValue, r.maxValue, r.step)
    );
  };

  return {
    get channels() {
      return channels();
    },
    decrementX(s = 1) {
      moveX(-s);
    },
    decrementY(s = 1) {
      moveY(-s);
    },
    get defaultValue() {
      return props.value === undefined ? defaultValue() : initialValue;
    },
    getDisplayColor() {
      return color().withChannelValue("alpha", 1);
    },
    getThumbPosition() {
      const x = xRange();
      const y = yRange();

      return {
        x: (xValue() - x.minValue) / (x.maxValue - x.minValue),
        y: 1 - (yValue() - y.minValue) / (y.maxValue - y.minValue),
      };
    },
    incrementX(s = 1) {
      moveX(s);
    },
    incrementY(s = 1) {
      moveY(s);
    },
    get isDragging() {
      return isDragging();
    },
    setColorFromPoint(x, y) {
      const xr = xRange();
      const yr = yRange();

      const xv = snapValueToStep(
        xr.minValue + clamp(x, 0, 1) * (xr.maxValue - xr.minValue),
        xr.minValue,
        xr.maxValue,
        xr.step
      );

      const yv = snapValueToStep(
        yr.minValue + (1 - clamp(y, 0, 1)) * (yr.maxValue - yr.minValue),
        yr.minValue,
        yr.maxValue,
        yr.step
      );

      if (xv !== xValue() || yv !== yValue()) {
        setColor(
          color()
            .withChannelValue(channels().xChannel, xv)
            .withChannelValue(channels().yChannel, yv)
        );
      }
    },
    setDragging(v) {
      const wasDragging = dragging;
      dragging = v;

      if (wasDragging && !v) {
        props.onChangeEnd?.(lastValue);
      }

      setDragging(v);
    },
    setValue(v) {
      setColor(normalizeColor(v));
    },
    setXValue,
    setYValue,
    get value() {
      return color();
    },
    get xChannelPageStep() {
      return xRange().pageSize;
    },
    get xChannelStep() {
      return xRange().step;
    },
    get xValue() {
      return xValue();
    },
    get yChannelPageStep() {
      return yRange().pageSize;
    },
    get yChannelStep() {
      return yRange().step;
    },
    get yValue() {
      return yValue();
    },
  };
}
