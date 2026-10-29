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
 * Derived from Adobe React Spectrum: packages/@react-types/buttongroup/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DOMProps,
  Orientation,
  Alignment,
} from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface SpectrumButtonGroupProps extends DOMProps, StyleProps {
  /** Whether the Buttons in the ButtonGroup are all disabled. */
  isDisabled?: boolean;
  /**
   * The axis the ButtonGroup should align with. Setting this to 'vertical' will prevent
   * any switching behaviors between 'vertical' and 'horizontal'.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /** The Buttons contained within the ButtonGroup. */
  children: JSX.Element;
  /**
   * The alignment of the buttons within the ButtonGroup.
   *
   * @default 'start'
   */
  align?: Alignment | "center";
}
