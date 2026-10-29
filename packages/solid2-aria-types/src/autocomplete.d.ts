/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/@react-types/autocomplete/src/index.d.ts.
 * Modified for Solid Aria: adapted type declarations, imports, and formatting for Solid.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CollectionBase,
  InputBase,
  Validation,
  HelpTextProps,
  FocusableProps,
  TextInputBase,
  ValueBase,
  LabelableProps,
  Key,
  AriaLabelingProps,
  FocusableDOMProps,
  AriaValidationProps,
  DOMProps,
  SpectrumTextInputBase,
  SpectrumFieldValidation,
  SpectrumLabelableProps,
  AsyncLoadable,
  LoadingState,
  DimensionValue,
} from "@solid2-aria/types-shared";
import type {
  TextInputDOMProps,
  StyleProps,
} from "@solid2-aria/types-shared-web";
import type { JSX } from "@solidjs/web";

export interface SearchAutocompleteProps<T>
  extends
    CollectionBase<T>,
    Omit<SearchFieldProps, "onChange" | "onSubmit" | "defaultValue" | "value"> {
  /** The list of SearchAutocomplete items (uncontrolled). */
  defaultItems?: Iterable<T>;
  /** The list of SearchAutocomplete items (controlled). */
  items?: Iterable<T>;
  /**
   * Method that is called when the open state of the menu changes. Returns the new open state and
   * the action that caused the opening of the menu.
   */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void;
  /** The value of the SearchAutocomplete input (controlled). */
  inputValue?: string;
  /** The default value of the SearchAutocomplete input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the SearchAutocomplete input value changes. */
  onInputChange?: (value: string) => void;
  /**
   * The interaction required to display the SearchAutocomplete menu.
   *
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction;
  /**
   * Handler that is called when the SearchAutocomplete is submitted.
   *
   * A `value` will be passed if the submission is a custom value (e.g. a user types then presses
   * enter). If the input is a selected item, `value` will be null.
   *
   * A `key` will be passed if the submission is a selected item (e.g. a user clicks or presses
   * enter on an option). If the input is a custom value, `key` will be null.
   */
  onSubmit?: (value: string | null, key: Key | null) => void;
}

interface SearchFieldProps extends TextFieldProps {
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

type MenuTriggerAction = "focus" | "input" | "manual";

export interface AriaSearchAutocompleteProps<T>
  extends
    SearchAutocompleteProps<T>,
    Omit<
      AriaSearchFieldProps,
      "onChange" | "onSubmit" | "defaultValue" | "value"
    >,
    DOMProps,
    AriaLabelingProps {}

interface AriaSearchFieldProps
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

export interface SpectrumSearchAutocompleteProps<T>
  extends
    SpectrumTextInputBase,
    Omit<
      AriaSearchAutocompleteProps<T>,
      "menuTrigger" | "isInvalid" | "validationState" | "validate"
    >,
    SpectrumFieldValidation<string>,
    SpectrumLabelableProps,
    StyleProps,
    Omit<AsyncLoadable, "isLoading"> {
  /**
   * The interaction required to display the SearchAutocomplete menu. Note that this prop has no
   * effect on the mobile SearchAutocomplete experience.
   *
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction;
  /** Whether the SearchAutocomplete should be displayed with a quiet style. */
  isQuiet?: boolean;
  /**
   * Alignment of the menu relative to the input target.
   *
   * @default 'start'
   */
  align?: "start" | "end";
  /**
   * Direction the menu will render relative to the SearchAutocomplete.
   *
   * @default 'bottom'
   */
  direction?: "bottom" | "top";
  /**
   * The current loading state of the SearchAutocomplete. Determines whether or not the progress
   * circle should be shown.
   */
  loadingState?: LoadingState;
  /**
   * Whether the menu should automatically flip direction when space is limited.
   *
   * @default true
   */
  shouldFlip?: boolean;
  /**
   * Width of the menu. By default, matches width of the trigger. Note that the minimum width of the
   * dropdown is always equal to the trigger's width.
   */
  menuWidth?: DimensionValue;
  onLoadMore?: () => void;
  /** An icon to display at the start of the input. */
  icon?: JSX.Element | null;
}
