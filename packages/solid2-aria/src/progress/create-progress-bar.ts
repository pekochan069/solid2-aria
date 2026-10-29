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
 * Derived from Adobe React Spectrum: packages/react-aria/src/progress/useProgressBar.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { clamp } from "@solid2-aria/stately/utils/number";
import type { AriaLabelingProps, DOMProps } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge } from "solid-js";
import type { Element as SolidElement } from "solid-js";

import { createNumberFormatter } from "../i18n/create-number-formatter";
import { createLabel } from "../label/create-label";
import { filterDOMProps } from "../utils/filter-dom-props";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";

export interface ProgressBarBaseProps {
  /**
   * The current value (controlled).
   *
   * @default 0
   */
  value?: number;
  /**
   * The smallest value allowed for the input.
   *
   * @default 0
   */
  minValue?: number;
  /**
   * The largest value allowed for the input.
   *
   * @default 100
   */
  maxValue?: number;
  /** The content to display as the label. */
  label?: SolidElement;
  /**
   * The display format of the value label.
   *
   * @default { style: 'percent' }
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** The content to display as the value's label (e.g. 1 of 4). */
  valueLabel?: SolidElement;
}

export interface AriaProgressBarBaseProps
  extends ProgressBarBaseProps, DOMProps, AriaLabelingProps {}

export interface ProgressBarProps extends ProgressBarBaseProps {
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean;
}

export interface AriaProgressBarProps
  extends ProgressBarProps, DOMProps, AriaLabelingProps {}

export interface ProgressBarAria {
  /** Props for the progress bar container element. */
  progressBarProps: DOMAttributes;
  /** Props for the progress bar's visual label element (if any). */
  labelProps: DOMAttributes;
}

/**
 * Provides the accessibility implementation for a progress bar component.
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 */
export function createProgressBar(
  props: AriaProgressBarProps
): ProgressBarAria {
  const field = createLabel(
    merge(props, { labelElementType: "span" as const })
  );

  const defaults: Intl.NumberFormatOptions = { style: "percent" };
  const options = merge(() => props.formatOptions ?? defaults);
  const formatter = createNumberFormatter(options);

  const value = () =>
    clamp(props.value ?? 0, props.minValue ?? 0, props.maxValue ?? 100);

  const valueLabel = () => {
    if (isPresent(props.valueLabel)) {
      return typeof props.valueLabel === "string"
        ? props.valueLabel
        : undefined;
    }

    const range = (props.maxValue ?? 100) - (props.minValue ?? 0);

    const percentage =
      range === 0 ? 0 : (value() - (props.minValue ?? 0)) / range;

    return formatter.format(options.style === "percent" ? percentage : value());
  };

  return {
    get labelProps() {
      return field.labelProps;
    },
    get progressBarProps() {
      return mergeProps(
        filterDOMProps(props, { labelable: true }),
        field.fieldProps,
        {
          "aria-valuemax": props.maxValue ?? 100,
          "aria-valuemin": props.minValue ?? 0,
          "aria-valuenow": isTruthy(props.isIndeterminate)
            ? undefined
            : value(),
          "aria-valuetext": isTruthy(props.isIndeterminate)
            ? undefined
            : valueLabel(),
          role: "progressbar" as const,
        }
      );
    },
  };
}
