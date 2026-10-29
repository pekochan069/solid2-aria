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
 * Derived from Adobe React Spectrum: packages/@react-types/slider/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  RangeInputBase,
  ValueBase,
  LabelableProps,
  Orientation,
  FocusableProps,
  ValidationState,
  DOMProps,
  AriaLabelingProps,
  FocusableDOMProps,
  InputDOMProps,
  AriaValidationProps,
  LabelPosition,
  RangeValue,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

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

export interface SliderThumbProps extends FocusableProps, LabelableProps {
  /**
   * The orientation of the Slider.
   *
   * @deprecated - pass to the slider instead.
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /** Whether the Thumb is disabled. */
  isDisabled?: boolean;
  /**
   * Index of the thumb within the slider.
   *
   * @default 0
   */
  index?: number;
  /** @deprecated */
  isRequired?: boolean;
  /** @deprecated */
  isInvalid?: boolean;
  /** @deprecated */
  validationState?: ValidationState;
}

export interface AriaSliderProps<T = number | number[]>
  extends SliderProps<T>, DOMProps, AriaLabelingProps {}

export interface AriaSliderThumbProps
  extends
    SliderThumbProps,
    DOMProps,
    Omit<FocusableDOMProps, "excludeFromTabOrder">,
    InputDOMProps,
    AriaLabelingProps,
    AriaValidationProps {}

export interface SpectrumBarSliderBase<T>
  extends AriaSliderProps<T>, ValueBase<T>, StyleProps {
  /**
   * The display format of the value label.
   */
  formatOptions?: Intl.NumberFormatOptions;
  /**
   * The label's overall position relative to the element it is labeling.
   *
   * @default 'top'
   */
  labelPosition?: LabelPosition;
  /**
   * Whether the value's label is displayed. True by default if there's a `label`, false by default
   * if not.
   */
  showValueLabel?: boolean;
  /**
   * A function that returns the content to display as the value's label. Overrides default
   * formatted number.
   */
  getValueLabel?: (value: T) => string;
  /**
   * A ContextualHelp element to place next to the label.
   */
  contextualHelp?: JSX.Element;
}

export interface SpectrumSliderProps
  extends SpectrumBarSliderBase<number>, InputDOMProps {
  /**
   * Whether a fill color is shown between the start of the slider and the current value.
   *
   * @see https://spectrum.adobe.com/page/slider/#Fill.
   */
  isFilled?: boolean;
  /**
   * The offset from which to start the fill.
   *
   * @see https://spectrum.adobe.com/page/slider/#Fill-start.
   */
  fillOffset?: number;
  /**
   * The background of the track, specified as the stops for a CSS background: `linear-gradient(to
   * right/left, ...trackGradient)`.
   *
   * @example
   *   trackGradient={['red', 'green']}
   *
   * @example
   *   trackGradient={['red 20%', 'green 40%']}
   *
   * @see https://spectrum.adobe.com/page/slider/#Gradient.
   */
  trackGradient?: string[];
}

export interface SpectrumRangeSliderProps extends SpectrumBarSliderBase<
  RangeValue<number>
> {
  /**
   * The name of the start input element, used when submitting an HTML form. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  startName?: string;
  /**
   * The name of the end input element, used when submitting an HTML form. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  endName?: string;
  /**
   * The `<form>` element to associate the slider with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form).
   */
  form?: string;
}
