/*
 * Derived from Adobe React Spectrum: packages/react-stately/src/color/useColorChannelFieldState.ts.
 * Modified for Solid Aria: adapted reactive state and public APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createMemo, merge, untrack } from "solid-js";

import { createNumberFieldState } from "../numberfield/create-number-field-state";
import type { NumberFieldState } from "../numberfield/create-number-field-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { parseColor } from "./color";
import { createColor } from "./create-color";
import type { ColorFieldProps } from "./create-color-field-state";
import type { Color, ColorChannel, ColorSpace } from "./types";

export interface ColorChannelFieldProps extends ColorFieldProps {
  colorSpace?: ColorSpace;
  channel: ColorChannel;
}

export interface ColorChannelFieldStateOptions extends ColorChannelFieldProps {
  locale: string;
}

export interface ColorChannelFieldState extends NumberFieldState {
  /** The current value of the field. */
  colorValue: Color;
  /** The default value of the field. */
  defaultColorValue: Color | null;
  /** Sets the color value of the field. */
  setColorValue: (value: Color | null) => void;
}

/**
 * Provides state management for a color channel field, allowing users to edit the
 * value of an individual color channel.
 */

export function createColorChannelFieldState(
  props: ColorChannelFieldStateOptions
): ColorChannelFieldState {
  const initialValue = createColor(() => props.value);
  const initialDefault = createColor(() => props.defaultValue);

  const [colorValue, setColor] = createControlledSignal(
    initialValue,
    untrack(initialDefault) ?? null,
    (v) => props.onChange?.(v)
  );

  const initial = untrack(colorValue);
  const black = parseColor("#000");

  const convert = (v: Color | null | undefined) =>
    props.colorSpace ? (v ?? black).toFormat(props.colorSpace) : (v ?? black);

  const color = createMemo(() => convert(colorValue()));
  const defaultValue = () => initialDefault() ?? initial;
  const defaultColor = createMemo(() => convert(defaultValue()));
  const range = () => color().getChannelRange(props.channel);

  const options = createMemo(() =>
    color().getChannelFormatOptions(props.channel)
  );

  const multiplier = () =>
    options().style === "percent" && range().maxValue === 100 ? 100 : 1;

  const numberState = createNumberFieldState({
    get defaultValue() {
      return defaultValue() === null
        ? Number.NaN
        : defaultColor().getChannelValue(props.channel) / multiplier();
    },
    get formatOptions() {
      return options();
    },
    get locale() {
      return props.locale;
    },
    get maxValue() {
      return range().maxValue / multiplier();
    },
    get minValue() {
      return range().minValue / multiplier();
    },
    onChange(v) {
      setColor(
        Number.isNaN(v)
          ? null
          : color().withChannelValue(props.channel, v * multiplier())
      );
    },
    get step() {
      return range().step / multiplier();
    },
    get value() {
      return colorValue() === null
        ? Number.NaN
        : color().getChannelValue(props.channel) / multiplier();
    },
  });

  return merge(numberState, {
    get colorValue() {
      return color();
    },
    get defaultColorValue() {
      return defaultValue();
    },
    setColorValue(v: Color | null) {
      setColor(v);
    },
  });
}
