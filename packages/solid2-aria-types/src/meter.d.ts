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
 * Derived from Adobe React Spectrum: packages/@react-types/meter/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DOMProps,
  AriaLabelingProps,
  LabelPosition,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export type MeterProps = ProgressBarBaseProps;

interface ProgressBarBaseProps {
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
  label?: JSX.Element;
  /**
   * The display format of the value label.
   *
   * @default { style: 'percent' }
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** The content to display as the value's label (e.g. 1 of 4). */
  valueLabel?: JSX.Element;
}

export interface AriaMeterProps extends AriaProgressBarBaseProps {}

interface AriaProgressBarBaseProps
  extends ProgressBarBaseProps, DOMProps, AriaLabelingProps {}

export interface SpectrumMeterProps extends SpectrumProgressBarBaseProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/meter/#Options) of the Meter.
   *
   * @default 'informative'
   */
  variant?: "informative" | "positive" | "warning" | "critical";
}

interface SpectrumProgressBarBaseProps
  extends AriaProgressBarBaseProps, StyleProps {
  /**
   * How thick the bar should be.
   *
   * @default 'L'
   */
  size?: "S" | "L";
  /**
   * The label's overall position relative to the element it is labeling.
   *
   * @default 'top'
   */
  labelPosition?: LabelPosition;
  /**
   * Whether the value's label is displayed. True by default if there's a label, false by default if
   * not.
   */
  showValueLabel?: boolean;
}
