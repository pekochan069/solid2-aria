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
 * Derived from Adobe React Spectrum: packages/@react-types/label/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DOMProps,
  LabelPosition,
  Alignment,
  NecessityIndicator,
  SpectrumHelpTextProps,
  Validation,
  SpectrumFieldValidation,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type {
  ElementType,
  HTMLAttributes,
  LabelHTMLAttributes,
  StyleProps,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface LabelProps {
  children?: JSX.Element;
  for?: string;
  elementType?: ElementType;
}

export interface SpectrumLabelProps
  extends
    SpectrumLabelPropsBase,
    Omit<HTMLAttributes<HTMLElement>, keyof SpectrumLabelPropsBase> {}

interface SpectrumLabelPropsBase extends LabelProps, DOMProps, StyleProps {
  // default top
  labelPosition?: LabelPosition;
  // default start
  labelAlign?: Alignment;
  isRequired?: boolean;
  // default icon
  necessityIndicator?: NecessityIndicator;
  includeNecessityIndicatorInAccessibilityName?: boolean;
}

export interface SpectrumFieldProps
  extends
    SpectrumLabelPropsBase,
    SpectrumHelpTextProps,
    Omit<Validation<any>, "validationState">,
    SpectrumFieldValidation<any>,
    Partial<ValidationResult> {
  children: JSX.Element;
  label?: JSX.Element;
  contextualHelp?: JSX.Element;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  descriptionProps?: HTMLAttributes<HTMLElement>;
  errorMessageProps?: HTMLAttributes<HTMLElement>;
  wrapperClass?: JSX.ClassValue;
  wrapperProps?: HTMLAttributes<HTMLElement>;
}
