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
 * Derived from Adobe React Spectrum: packages/react-aria/src/meter/useMeter.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge } from "solid-js";

import { createProgressBar } from "../progress/create-progress-bar";
import type {
  AriaProgressBarBaseProps,
  ProgressBarBaseProps,
} from "../progress/create-progress-bar";

export type MeterProps = ProgressBarBaseProps;

export type AriaMeterProps = AriaProgressBarBaseProps;

export interface MeterAria {
  /** Props for the meter container element. */
  meterProps: DOMAttributes;
  /** Props for the meter's visual label (if any). */
  labelProps: DOMAttributes;
}

/**
 * Provides the accessibility implementation for a meter component.
 * Meters represent a quantity within a known range, or a fractional value.
 */
export function createMeter(props: AriaMeterProps): MeterAria {
  const _result0 = createProgressBar(props);

  return {
    get labelProps() {
      return _result0.labelProps;
    },
    get meterProps() {
      return merge(_result0.progressBarProps, {
        get role(): "meter" {
          return "meter";
        },
      });
    },
  };
}
