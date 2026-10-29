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
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/useColorSliderState.ts.
 * Modified for Solid Aria: adapted reactive state and public APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createMemo, merge, untrack } from "solid-js";

import { createSliderState } from "../slider/create-slider-state";
import type { SliderProps, SliderState } from "../slider/create-slider-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { normalizeColor, parseColor } from "./color";
import type { Color, ColorChannel, ColorSpace } from "./types";

export interface ColorSliderProps extends Omit<
  SliderProps<string | Color>,
  "minValue" | "maxValue" | "step" | "pageSize" | "onChange" | "onChangeEnd"
> {
  /**
   * The color space that the slider operates in. The `channel` must be in this color space.
   * If not provided, this defaults to the color space of the `color` or `defaultColor` value.
   */
  colorSpace?: ColorSpace;
  /** The color channel that the slider manipulates. */
  channel: ColorChannel;
  /** Handler that is called when the value changes, as the user drags. */
  onChange?: (value: Color) => void;
  /** Handler that is called when the user stops dragging. */
  onChangeEnd?: (value: Color) => void;
}

export interface ColorSliderState extends SliderState {
  /** The current color value represented by the color slider. */
  readonly value: Color;
  /** Sets the current color value. If a string is passed, it will be parsed to a Color. */
  setValue: (value: string | Color) => void;
  /**
   * Returns the color that should be displayed in the slider instead of `value` or the optional
   * parameter.
   */
  getDisplayColor: () => Color;
  /** Whether the color slider is currently being dragged. */
  readonly isDragging: boolean;
}

export interface ColorSliderStateOptions extends ColorSliderProps {
  /** The locale to use for formatting the color channel value. */
  locale: string;
}

/**
 * Provides state management for a color slider component.
 * Color sliders allow users to adjust an individual channel of a color value.
 */

const normalize = (v: string | Color | undefined) =>
  v !== undefined && v !== "" ? normalizeColor(v) : undefined;

export function createColorSliderState(
  props: ColorSliderStateOptions
): ColorSliderState {
  const initial = untrack(
    () => normalize(props.defaultValue) ?? normalize(props.value)
  );

  if (!initial) {
    throw new Error("createColorSliderState requires a value or defaultValue");
  }

  const controlledValue = createMemo(() => normalize(props.value));

  const [colorValue, setColor] = createControlledSignal(
    controlledValue,
    initial,
    (v) => props.onChange?.(v)
  );

  const initialValue = untrack(colorValue);

  const color = createMemo(() =>
    props.colorSpace ? colorValue().toFormat(props.colorSpace) : colorValue()
  );

  const defaultColor = createMemo(() => {
    const c = normalize(props.defaultValue) ?? initialValue;

    return props.colorSpace ? c.toFormat(props.colorSpace) : c;
  });

  const numberFormatter = new Intl.NumberFormat();

  const sliderState = createSliderState(
    merge(props, {
      get defaultValue() {
        return defaultColor().getChannelValue(props.channel);
      },
      get maxValue() {
        return color().getChannelRange(props.channel).maxValue;
      },
      get minValue() {
        return color().getChannelRange(props.channel).minValue;
      },
      numberFormatter,
      onChange(v: number | number[]) {
        if (typeof v === "number") {
          setColor(color().withChannelValue(props.channel, v));
        }
      },
      onChangeEnd(v: number | number[]) {
        if (typeof v === "number") {
          props.onChangeEnd?.(color().withChannelValue(props.channel, v));
        }
      },
      get step() {
        return color().getChannelRange(props.channel).step;
      },
      get value() {
        return color().getChannelValue(props.channel);
      },
    })
  );

  return merge(sliderState, {
    getDisplayColor() {
      if (props.channel === "hue") {
        return parseColor(`hsl(${color().getChannelValue("hue")}, 100%, 50%)`);
      }

      return props.channel === "alpha"
        ? color()
        : color().withChannelValue("alpha", 1);
    },
    getFormattedValue() {
      return color().formatChannelValue(props.channel, props.locale);
    },
    getThumbValueLabel() {
      return color().formatChannelValue(props.channel, props.locale);
    },
    get isDragging() {
      return sliderState.isThumbDragging(0);
    },
    get pageSize() {
      return color().getChannelRange(props.channel).pageSize;
    },
    setValue(v: string | Color) {
      setColor(normalizeColor(v));
    },
    get step() {
      return color().getChannelRange(props.channel).step;
    },
    get value() {
      return color();
    },
  });
}
