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
 * Derived from Adobe React Spectrum: packages/@react-types/statuslight/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMProps, AriaLabelingProps } from "@solid2-aria/types-shared";
import type { StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface SpectrumStatusLightProps
  extends DOMProps, StyleProps, AriaLabelingProps {
  /** The content to display as the label. */
  children?: JSX.Element;
  /**
   * The variant changes the color of the status light.
   * When status lights have a semantic meaning, they should use the variant for semantic colors.
   */
  variant:
    | "positive"
    | "negative"
    | "notice"
    | "info"
    | "neutral"
    | "celery"
    | "chartreuse"
    | "yellow"
    | "magenta"
    | "fuchsia"
    | "purple"
    | "indigo"
    | "seafoam";
  /** Whether the status light is disabled. */
  isDisabled?: boolean;
  /**
   * An accessibility role for the status light. Should be set when the status
   * can change at runtime, and no more than one status light will update simultaneously.
   * For cases where multiple statuses can change at the same time, use a Toast instead.
   */
  role?: "status";
}
