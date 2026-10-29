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
 * Derived from Adobe React Spectrum: packages/react-stately/src/slider/useSliderState.ts.
 * Modified for Solid Aria: adapted state handling, APIs, or formatting for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  LabelableProps,
  Orientation,
  RangeInputBase,
  ValueBase,
} from "@solid2-aria/types-shared";
import {
  createMemo,
  createRenderEffect,
  createSignal,
  untrack,
} from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { clamp, snapValueToStep } from "../utils/number";

export interface SliderProps<T = number | number[]>
  extends RangeInputBase<number>, ValueBase<T>, LabelableProps {
  /**
   * The orientation of the Slider.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /** Whether the whole Slider is disabled. */
  isDisabled?: boolean;
  /** Fired when the slider stops moving, due to being let go. */
  onChangeEnd?: (value: T) => void;
  // These are duplicated from ValueBase to define defaults for the docs.
  /**
   * The slider's minimum value.
   *
   * @default 0
   */
  minValue?: number;
  /**
   * The slider's maximum value.
   *
   * @default 100
   */
  maxValue?: number;
  /**
   * The slider's step value.
   *
   * @default 1
   */
  step?: number;
}

export interface SliderState {
  /**
   * Values managed by the slider by thumb index.
   */
  readonly values: number[];
  /**
   * The default values for each thumb.
   */
  readonly defaultValues: number[];
  /**
   * Get the value for the specified thumb.
   *
   * @param index
   */
  getThumbValue: (index: number) => number;

  /**
   * Sets the value for the specified thumb.
   * The actual value set will be clamped and rounded according to min/max/step.
   *
   * @param index
   * @param value
   */
  setThumbValue: (index: number, value: number) => void;

  /**
   * Sets value for the specified thumb by percent offset (between 0 and 1).
   *
   * @param index
   * @param percent
   */
  setThumbPercent: (index: number, percent: number) => void;

  /**
   * Whether the specific thumb is being dragged.
   *
   * @param index
   */
  isThumbDragging: (index: number) => boolean;
  /**
   * Set is dragging on the specified thumb.
   *
   * @param index
   * @param dragging
   */
  setThumbDragging: (index: number, dragging: boolean) => void;

  /**
   * Currently-focused thumb index.
   */
  readonly focusedThumb: number | undefined;
  /**
   * Set focused true on specified thumb. This will remove focus from
   * any thumb that had it before.
   *
   * @param index
   */
  setFocusedThumb: (index: number | undefined) => void;

  /**
   * Returns the specified thumb's value as a percentage from 0 to 1.
   *
   * @param index
   */
  getThumbPercent: (index: number) => number;

  /**
   * Returns the value as a percent between the min and max of the slider.
   *
   * @param index
   */
  getValuePercent: (value: number) => number;

  /**
   * Returns the string label for the specified thumb's value, per props.formatOptions.
   *
   * @param index
   */
  getThumbValueLabel: (index: number) => string;

  /**
   * Returns the string label for the value, per props.formatOptions.
   *
   * @param value
   */
  getFormattedValue: (value?: number | number[]) => string;

  /**
   * Returns the min allowed value for the specified thumb.
   *
   * @param index
   */
  getThumbMinValue: (index: number) => number;

  /**
   * Returns the max allowed value for the specified thumb.
   *
   * @param index
   */
  getThumbMaxValue: (index: number) => number;

  /**
   * Converts a percent along track (between 0 and 1) to the corresponding value.
   *
   * @param percent
   */
  getPercentValue: (percent: number) => number;

  /**
   * Returns if the specified thumb is editable.
   *
   * @param index
   */
  isThumbEditable: (index: number) => boolean;

  /**
   * Set the specified thumb's editable state.
   *
   * @param index
   * @param editable
   */
  setThumbEditable: (index: number, editable: boolean) => void;

  /**
   * Increments the value of the thumb by the step or page amount.
   */
  incrementThumb: (index: number, stepSize?: number) => void;
  /**
   * Decrements the value of the thumb by the step or page amount.
   */
  decrementThumb: (index: number, stepSize?: number) => void;

  /**
   * The step amount for the slider.
   */
  readonly step: number;

  /**
   * The page size for the slider, used to do a bigger step.
   */
  readonly pageSize: number;

  /** The orientation of the slider. */
  readonly orientation: Orientation;

  /** Whether the slider is disabled. */
  readonly isDisabled: boolean;
}

export interface SliderStateOptions extends SliderProps {
  numberFormatter: Intl.NumberFormat;
}

export function createSliderState(props: SliderStateOptions): SliderState {
  const min = () => props.minValue ?? 0;
  const max = () => props.maxValue ?? 100;
  const step = () => props.step ?? 1;

  const restrict = (v: number | number[]) => {
    const a = Array.isArray(v) ? v : [v];

    return a.map((n, i) =>
      snapValueToStep(
        n,
        i === 0 ? min() : a[i - 1],
        i === a.length - 1 ? max() : a[i + 1],
        step()
      )
    );
  };

  const defaults = () => restrict(props.defaultValue ?? [min()]);

  const emit = (
    fn: ((v: number | number[]) => void) | undefined,
    v: number[]
  ) =>
    fn?.(
      typeof props.value === "number" || typeof props.defaultValue === "number"
        ? (v[0] ?? min())
        : v
    );

  const controlledValue = createMemo(() =>
    props.value === undefined ? undefined : restrict(props.value)
  );

  const [values, setValues] = createControlledSignal(
    controlledValue,
    untrack(defaults),
    (v) => emit(props.onChange, v)
  );

  const initialValues = untrack(values);
  const [draggings, setDraggings] = createSignal<boolean[]>([]);
  const [focus, setFocus] = createSignal<number>();
  let dragging: boolean[] = [];
  const editable: boolean[] = [];
  let pending = initialValues;
  createRenderEffect(values, (v) => {
    pending = v;
  });
  const get = (i: number) => values()[i] ?? min();
  const thumbMin = (i: number) => (i === 0 ? min() : get(i - 1));

  const thumbMax = (i: number) =>
    i === values().length - 1 ? max() : get(i + 1);

  const isEditable = (i: number) => editable[i] ?? true;

  const update = (i: number, v: number) => {
    if (props.isDisabled === true || !isEditable(i)) {
      return;
    }

    const nextValue = snapValueToStep(v, thumbMin(i), thumbMax(i), step());

    if (pending[i] === nextValue) {
      return;
    }

    pending = pending.map((n, index) => (index === i ? nextValue : n));
    setValues(pending);
  };

  const percent = (v: number) => (v - min()) / (max() - min());

  const percentValue = (p: number) =>
    clamp(
      Math.round((p * (max() - min())) / step()) * step() + min(),
      min(),
      max()
    );

  const format = (v: number | number[] = values()) => {
    const a = Array.isArray(v) ? v : [v];
    const f = props.numberFormatter;

    if (a.length === 0) {
      return "";
    }

    if (a.length === 1) {
      return f.format(a[0] ?? min());
    }

    if (a.length === 2) {
      return f.formatRange(a[0] ?? min(), a[1] ?? max());
    }

    return new Intl.ListFormat(f.resolvedOptions().locale, {
      type: "unit",
    }).format(a.map((n) => f.format(n)));
  };

  return {
    decrementThumb(i, s = 1) {
      update(i, get(i) - Math.max(s, step()));
    },
    get defaultValues() {
      return props.defaultValue === undefined ? initialValues : defaults();
    },
    get focusedThumb() {
      return focus();
    },
    getFormattedValue: format,
    getPercentValue: percentValue,
    getThumbMaxValue: thumbMax,
    getThumbMinValue: thumbMin,
    getThumbPercent(i) {
      return percent(get(i));
    },
    getThumbValue: get,
    getThumbValueLabel(i) {
      return format(get(i));
    },
    getValuePercent: percent,
    incrementThumb(i, s = 1) {
      update(i, get(i) + Math.max(s, step()));
    },
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    isThumbDragging(i) {
      return draggings()[i] ?? false;
    },
    isThumbEditable: isEditable,
    get orientation() {
      return props.orientation ?? "horizontal";
    },
    get pageSize() {
      const size = (max() - min()) / 10;

      return Math.max(step(), snapValueToStep(size, 0, size + step(), step()));
    },
    setFocusedThumb(v) {
      setFocus(v);
    },
    setThumbDragging(i, v) {
      if (props.isDisabled === true || !isEditable(i)) {
        return;
      }

      if (v) {
        pending = values();
      }

      const was = dragging[i];
      dragging = [...dragging];
      dragging[i] = v;
      setDraggings(dragging);

      if (was === true && !dragging.some(Boolean)) {
        emit(props.onChangeEnd, pending);
      }
    },
    setThumbEditable(i, v) {
      editable[i] = v;
    },
    setThumbPercent(i, p) {
      update(i, percentValue(p));
    },
    setThumbValue: update,
    get step() {
      return step();
    },
    get values() {
      return values();
    },
  };
}
