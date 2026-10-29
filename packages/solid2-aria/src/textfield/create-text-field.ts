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
 * Derived from Adobe React Spectrum: packages/react-aria/src/textfield/useTextField.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createFormValidationState } from "@solid2-aria/stately/form/create-form-validation-state";
import { createControlledSignal } from "@solid2-aria/stately/utils/create-controlled-signal";
import type {
  AriaLabelingProps,
  AriaValidationProps,
  FocusableDOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  LabelableProps,
  TextInputBase,
  Validation,
  ValidationResult,
  ValueBase,
} from "@solid2-aria/types-shared";
import type {
  NativeDOMAttributes,
  DOMAttributes,
  TextInputDOMProps,
} from "@solid2-aria/types-shared-web";
import { merge, createMemo, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import { createFormValidation } from "../form/create-form-validation";
import { createFocusable } from "../interactions/create-focusable";
import { createField } from "../label/create-field";
import type { LabelAria } from "../label/create-label";
import type { InputHTMLAttributes, ChangeEvent, JSX } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createFormReset } from "../utils/create-form-reset";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue } from "../utils/truthy";

/**
 * A map of HTML element names and their interface types.
 * For example `'a'` -> `HTMLAnchorElement`.
 */
interface IntrinsicHTMLElements {
  input: HTMLInputElement;
  textarea: HTMLTextAreaElement;
}

/**
 * A map of HTML element names and their attribute interface types.
 * For example `'a'` -> `AnchorHTMLAttributes<HTMLAnchorElement>`.
 */
interface IntrinsicHTMLAttributes {
  input: InputHTMLAttributes;
  textarea: Omit<
    JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
    keyof JSX.EventHandlersElement<HTMLTextAreaElement>
  > &
    NativeDOMAttributes<HTMLTextAreaElement>;
}

type DefaultElementType = "input";

/**
 * The intrinsic HTML element names that `useTextField` supports; e.g. `input`,
 * `textarea`.
 */
type TextFieldIntrinsicElements = keyof Pick<
  IntrinsicHTMLElements,
  "input" | "textarea"
>;

/**
 * The HTML element interfaces that `useTextField` supports based on what is
 * defined for `TextFieldIntrinsicElements`; e.g. `HTMLInputElement`,
 * `HTMLTextAreaElement`.
 */
type TextFieldHTMLElementType = Pick<
  IntrinsicHTMLElements,
  TextFieldIntrinsicElements
>;

/**
 * The HTML attributes interfaces that `useTextField` supports based on what
 * is defined for `TextFieldIntrinsicElements`; e.g. `InputHTMLAttributes`,
 * `TextareaHTMLAttributes`.
 */
type TextFieldHTMLAttributesType = Pick<
  IntrinsicHTMLAttributes,
  TextFieldIntrinsicElements
>;

/**
 * The type of `inputProps` returned by `useTextField`; e.g. `InputHTMLAttributes`,
 * `TextareaHTMLAttributes`.
 */
type TextFieldInputProps<T extends TextFieldIntrinsicElements> =
  TextFieldHTMLAttributesType[T];

export interface TextFieldProps<T = HTMLInputElement>
  extends
    InputBase,
    Validation<string>,
    HelpTextProps,
    FocusableProps<T>,
    TextInputBase,
    ValueBase<string>,
    LabelableProps {}

export interface AriaTextFieldProps<T = HTMLInputElement>
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

export interface AriaTextFieldOptions<
  T extends TextFieldIntrinsicElements,
> extends AriaTextFieldProps<TextFieldHTMLElementType[T]> {
  /**
   * The HTML element used to render the input, e.g. 'input', or 'textarea'. It determines whether
   * certain HTML attributes will be included in `inputProps`. For example,
   * [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-type).
   *
   * @default 'input'
   */
  inputElementType?: T;
  /**
   * Controls whether inputted text is automatically capitalized and, if so, in what manner.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   */
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
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

/**
 * The type of `ref` object that can be passed to `useTextField` based on the given
 * intrinsic HTML element name; e.g.`Accessor<HTMLInputElement>`,
 * `Accessor<HTMLTextAreaElement>`.
 */
type TextFieldAccessor<T extends TextFieldIntrinsicElements> = Accessor<
  TextFieldHTMLElementType[T] | null
>;

export interface TextFieldAria<
  T extends TextFieldIntrinsicElements = DefaultElementType,
> extends ValidationResult {
  /** Props for the input element. */
  inputProps: TextFieldInputProps<T>;
  /** Props for the text field's visible label element, if any. */
  labelProps: LabelAria["labelProps"];
  /** Props for the text field's description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the text field's error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a text field.
 *
 * @param props - Props for the text field.
 * @param ref - Ref to the HTML input or textarea element.
 */
export function createTextField<
  T extends TextFieldIntrinsicElements = DefaultElementType,
>(props: AriaTextFieldOptions<T>, ref: TextFieldAccessor<T>): TextFieldAria<T> {
  const _result0 = props;

  const [value, setValue] = createControlledSignal<string>(
    () => props.value,
    untrack(() => getTruthyValue(props.defaultValue) ?? ""),
    props.onChange
  );

  const _result1 = createFocusable<TextFieldHTMLElementType[T]>(props, ref);

  const validationState = createFormValidationState(
    merge(props, {
      get value() {
        return value();
      },
    })
  );

  const _result3 = createField(
    merge(props, {
      get errorMessage() {
        return (
          getTruthyValue(props.errorMessage) ??
          validationState.displayValidation.validationErrors
        );
      },
      get isInvalid() {
        return validationState.displayValidation.isInvalid;
      },
    })
  );

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const inputOnlyProps = createMemo(() => ({
    pattern: props.pattern,
    type: _result0.type ?? "text",
  }));

  const initialValue = untrack(value);
  createFormReset(ref, () => props.defaultValue ?? initialValue, setValue);
  createFormValidation(props, validationState, ref);

  return {
    get descriptionProps() {
      return _result3.descriptionProps;
    },
    get errorMessageProps() {
      return _result3.errorMessageProps;
    },
    get inputProps() {
      return mergeProps(
        domProps(),
        (_result0.inputElementType ?? "input") === "input"
          ? inputOnlyProps()
          : undefined,
        {
          "aria-activedescendant": ariaValue(props["aria-activedescendant"]),
          "aria-autocomplete": ariaValue(props["aria-autocomplete"]),
          "aria-controls": ariaValue(props["aria-controls"]),
          "aria-errormessage": ariaValue(props["aria-errormessage"]),
          "aria-haspopup": ariaValue(props["aria-haspopup"]),
          "aria-invalid": ariaValue(
            validationState.displayValidation.isInvalid || undefined
          ),
          "aria-required": ariaValue(
            ((_result0.isRequired ?? false) &&
              (_result0.validationBehavior ?? "aria") === "aria") ||
              undefined
          ),
          autocapitalize: props.autoCapitalize,
          autocomplete: props.autoComplete,
          autocorrect: props.autoCorrect,
          // Native reset must preserve the DOM until the controlled state update commits.
          defaultValue: value(),
          disabled: _result0.isDisabled ?? false,
          enterkeyhint: props.enterKeyHint,
          form: props.form,
          inputmode: props.inputMode,
          maxlength: props.maxLength,
          minlength: props.minLength,
          name: props.name,
          // Input events
          onBeforeInput: props.onBeforeInput,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            setValue(getEventTarget(e).value);
          },
          // Composition events
          onCompositionEnd: props.onCompositionEnd,
          onCompositionStart: props.onCompositionStart,
          onCompositionUpdate: props.onCompositionUpdate,
          // Clipboard events
          onCopy: props.onCopy,
          onCut: props.onCut,
          onInput: props.onInput,
          onPaste: props.onPaste,
          // Selection events
          onSelect: props.onSelect,
          placeholder: props.placeholder,
          readonly: _result0.isReadOnly ?? false,
          required:
            (_result0.isRequired ?? false) &&
            (_result0.validationBehavior ?? "aria") === "native",
          spellcheck: props.spellCheck,
          value: value(),

          ..._result1.focusableProps,
          ..._result3.fieldProps,
        }
      );
    },
    get isInvalid() {
      return validationState.displayValidation.isInvalid;
    },
    get labelProps() {
      return _result3.labelProps;
    },
    get validationDetails() {
      return validationState.displayValidation.validationDetails;
    },
    get validationErrors() {
      return validationState.displayValidation.validationErrors;
    },
  };
}
