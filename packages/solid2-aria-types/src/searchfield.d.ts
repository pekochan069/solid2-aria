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
 * Derived from Adobe React Spectrum: packages/@react-types/searchfield/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  InputBase,
  Validation,
  HelpTextProps,
  FocusableProps,
  TextInputBase,
  ValueBase,
  LabelableProps,
  AriaLabelingProps,
  FocusableDOMProps,
  AriaValidationProps,
  SpectrumTextInputBase,
  SpectrumFieldValidation,
  SpectrumLabelableProps,
} from "@solid2-aria/types-shared";
import type {
  TextInputDOMProps,
  StyleProps,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface SearchFieldProps extends TextFieldProps {
  /** Handler that is called when the SearchField is submitted. */
  onSubmit?: (value: string) => void;

  /** Handler that is called when the clear button is pressed. */
  onClear?: () => void;
}

interface TextFieldProps<T = HTMLInputElement>
  extends
    InputBase,
    Validation<string>,
    HelpTextProps,
    FocusableProps<T>,
    TextInputBase,
    ValueBase<string>,
    LabelableProps {}

export interface AriaSearchFieldProps
  extends SearchFieldProps, Omit<AriaTextFieldProps, "type"> {
  /**
   * An enumerated attribute that defines what action label or icon to preset for the enter key on
   * virtual keyboards. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint).
   */
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
  /**
   * The type of input to render. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdeftype).
   *
   * @default 'search'
   */
  type?:
    | "text"
    | "search"
    | "url"
    | "tel"
    | "email"
    | "password"
    | (string & {});
}

interface AriaTextFieldProps<T = HTMLInputElement>
  extends
    TextFieldProps<T>,
    AriaLabelingProps,
    FocusableDOMProps,
    TextInputDOMProps<T>,
    AriaValidationProps {
  // https://www.w3.org/TR/wai-aria-1.2/#textbox
  /**
   * Identifies the currently active element when DOM focus is on a composite widget, textbox,
   * group, or application.
   */
  "aria-activedescendant"?: string;
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's
   * intended value for an input and specifies how predictions would be presented if they are made.
   */
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  /**
   * Indicates the availability and type of interactive popup element, such as menu or dialog, that
   * can be triggered by an element.
   */
  "aria-haspopup"?:
    | boolean
    | "false"
    | "true"
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog";
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   */
  "aria-controls"?: string;
  /**
   * An enumerated attribute that defines what action label or icon to preset for the enter key on
   * virtual keyboards. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint).
   */
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
}

export interface SpectrumSearchFieldProps
  extends
    SpectrumTextInputBase,
    Omit<AriaSearchFieldProps, "isInvalid" | "validationState">,
    SpectrumTextFieldProps {}

interface SpectrumTextFieldProps
  extends
    SpectrumTextInputBase,
    Omit<AriaTextFieldProps, "isInvalid" | "validationState">,
    SpectrumFieldValidation<string>,
    SpectrumLabelableProps,
    StyleProps {
  /** An icon to display at the start of the input. */
  icon?: JSX.Element | null;
  /** Whether the input should be displayed with a quiet style. */
  isQuiet?: boolean;
}
