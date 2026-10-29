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
 * Derived from Adobe React Spectrum: packages/@react-types/form/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DOMProps,
  SpectrumLabelableProps,
  ValidationState,
} from "@solid2-aria/types-shared";
import type { FormProps, StyleProps } from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface SpectrumFormProps
  extends
    FormProps,
    DOMProps,
    StyleProps,
    Omit<SpectrumLabelableProps, "contextualHelp" | "label"> {
  /** The contents of the Form. */
  children: JSX.Element | JSX.Element[];
  /** Whether the Form elements are displayed with their quiet style. */
  isQuiet?: boolean;
  /** Whether the Form elements are rendered with their emphasized style. */
  isEmphasized?: boolean;
  /** Whether the Form elements are disabled. */
  isDisabled?: boolean;
  /** Whether user input is required on each of the Form elements before Form submission. */
  isRequired?: boolean;
  /** Whether the Form elements can be selected but not changed by the user. */
  isReadOnly?: boolean;
  /**
   * Whether the Form elements should display their "valid" or "invalid" visual styling.
   *
   * @default 'valid'
   */
  validationState?: ValidationState;
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when a field value is missing or invalid, or mark fields as required
   * or invalid via ARIA.
   *
   * @default 'aria'
   */
  validationBehavior?: "aria" | "native";
}
