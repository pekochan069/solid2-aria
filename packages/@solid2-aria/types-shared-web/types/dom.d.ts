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
 * Derived from Adobe React Spectrum: packages/@react-types/shared/src/dom.d.ts.
 * Modified for Solid Aria: separated web renderer declarations and adapted imports and types, including JSX data attributes, for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AriaLabelingProps,
  SubmitEvent,
  ValidationErrors,
  DOMProps,
  InputDOMProps,
  FocusableElement,
} from "@solid2-aria/types-shared";

import type {
  AnimationEventHandler,
  AriaAttributes,
  AriaRole,
  ClipboardEventHandler,
  CompositionEventHandler,
  CSSProperties,
  ClassValue,
  FormEventHandler,
  FormHTMLAttributes,
  MouseEventHandler,
  PointerEventHandler,
  NativeDOMAttributes,
  EventHandler,
  RefAttributes,
  TouchEventHandler,
  TransitionEventHandler,
  UIEventHandler,
  WheelEventHandler,
} from "./platform.js";

export interface TextInputDOMEvents<T = HTMLInputElement> {
  // Clipboard events
  /**
   * Handler that is called when the user copies text. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncopy).
   */
  onCopy?: ClipboardEventHandler<T>;

  /**
   * Handler that is called when the user cuts text. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncut).
   */
  onCut?: ClipboardEventHandler<T>;

  /**
   * Handler that is called when the user pastes text. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/onpaste).
   */
  onPaste?: ClipboardEventHandler<T>;

  // Composition events
  /**
   * Handler that is called when a text composition system starts a new text composition session.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event).
   */
  onCompositionStart?: CompositionEventHandler<T>;

  /**
   * Handler that is called when a text composition system completes or cancels the current text
   * composition session. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event).
   */
  onCompositionEnd?: CompositionEventHandler<T>;

  /**
   * Handler that is called when a new character is received in the current text composition
   * session. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionupdate_event).
   */
  onCompositionUpdate?: CompositionEventHandler<T>;

  // Selection events
  /**
   * Handler that is called when text in the input is selected. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/select_event).
   */
  onSelect?: EventHandler<T>;

  // Input events
  /**
   * Handler that is called when the input value is about to be modified. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event).
   */
  onBeforeInput?: FormEventHandler<T>;
  /**
   * Handler that is called when the input value is modified. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event).
   */
  onInput?: FormEventHandler<T>;
}

// DOM props that apply to all text inputs
// Ensure this is synced with useTextField
export interface TextInputDOMProps<T = HTMLInputElement>
  extends DOMProps, InputDOMProps, TextInputDOMEvents<T> {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string;

  /**
   * The maximum number of characters supported by the input. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefmaxlength).
   */
  maxLength?: number;

  /**
   * The minimum number of characters required by the input. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefminlength).
   */
  minLength?: number;

  /**
   * Regex pattern that the value of the input must match to be valid. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefpattern).
   */
  pattern?: string;

  /**
   * Content that appears in the input when it is empty. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefplaceholder).
   */
  placeholder?: string;

  /**
   * The type of input to render. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdeftype).
   *
   * @default 'text'
   */
  type?:
    | "text"
    | "search"
    | "url"
    | "tel"
    | "email"
    | "password"
    | (string & {});

  /**
   * Hints at the type of data that might be entered by the user while editing the element or its
   * contents. See
   * [MDN](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute).
   */
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";

  /**
   * An attribute that takes as its value a space-separated string that describes what, if any, type
   * of autocomplete functionality the input should provide. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#autocomplete).
   */
  autoCorrect?: string;

  /**
   * An enumerated attribute that defines whether the element may be checked for spelling errors.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck).
   */
  spellCheck?: string;
}

/** All DOM attributes supported across both HTML and SVG elements. */
export interface DOMAttributes<T = FocusableElement>
  extends
    AriaAttributes,
    Pick<DOMProps, `data-${string}`>,
    NativeDOMAttributes<T> {
  id?: string | false | undefined;
  role?: AriaRole | undefined;
  tabindex?: number | string | false | undefined;
  style?: CSSProperties | string | false | undefined;
  class?: ClassValue | undefined;
}

export interface DOMAttributesWithRef<T = Element>
  extends DOMAttributes<T>, RefAttributes<T> {}

export interface GroupDOMAttributes extends Omit<
  DOMAttributes<HTMLElement>,
  "role"
> {
  role?: "group" | "region" | "presentation";
}

/**
 * Global attributes that can be applied to any DOM element.
 *
 * @private
 */
// NOTE: id is handled elsewhere (DOMProps).
export interface GlobalDOMAttributes<T = Element>
  extends Pick<DOMProps, `data-${string}`>, GlobalDOMEvents<T> {
  dir?: "ltr" | "rtl" | "auto" | undefined;
  lang?: string | undefined;
  hidden?: boolean | undefined;
  inert?: boolean | undefined;
  translate?: "yes" | "no" | undefined;
}

/**
 * Global DOM events that are supported on all DOM elements.
 *
 * @private
 */
// NOTES:
//   - Drag and drop events are omitted for now.
//   - Keyboard and focus events are supported directly on focusable elements (FocusableProps).
//   - Text input events (e.g. onInput, onCompositionStart, onCopy) are
//     supported only directly on input elements (TextInputDOMProps).
//     We don't support contentEditable on our components.
//   - Media events should be handled directly on the <video>/<audio><img> element.
export interface GlobalDOMEvents<T = Element> {
  // MouseEvents
  onClick?: MouseEventHandler<T> | undefined;
  onAuxClick?: MouseEventHandler<T> | undefined;
  onContextMenu?: MouseEventHandler<T> | undefined;
  onDblClick?: MouseEventHandler<T> | undefined;
  onMouseDown?: MouseEventHandler<T> | undefined;
  onMouseEnter?: MouseEventHandler<T> | undefined;
  onMouseLeave?: MouseEventHandler<T> | undefined;
  onMouseMove?: MouseEventHandler<T> | undefined;
  onMouseOut?: MouseEventHandler<T> | undefined;
  onMouseOver?: MouseEventHandler<T> | undefined;
  onMouseUp?: MouseEventHandler<T> | undefined;

  // Touch Events
  onTouchCancel?: TouchEventHandler<T> | undefined;
  onTouchEnd?: TouchEventHandler<T> | undefined;
  onTouchMove?: TouchEventHandler<T> | undefined;
  onTouchStart?: TouchEventHandler<T> | undefined;

  // Pointer Events
  onPointerDown?: PointerEventHandler<T> | undefined;
  onPointerMove?: PointerEventHandler<T> | undefined;
  onPointerUp?: PointerEventHandler<T> | undefined;
  onPointerCancel?: PointerEventHandler<T> | undefined;
  onPointerEnter?: PointerEventHandler<T> | undefined;
  onPointerLeave?: PointerEventHandler<T> | undefined;
  onPointerOver?: PointerEventHandler<T> | undefined;
  onPointerOut?: PointerEventHandler<T> | undefined;
  onGotPointerCapture?: PointerEventHandler<T> | undefined;
  onLostPointerCapture?: PointerEventHandler<T> | undefined;

  // UI Events
  onScroll?: EventHandler<T> | undefined;

  // Wheel Events
  onWheel?: WheelEventHandler<T> | undefined;

  // Animation Events
  onAnimationStart?: AnimationEventHandler<T> | undefined;
  onAnimationEnd?: AnimationEventHandler<T> | undefined;
  onAnimationIteration?: AnimationEventHandler<T> | undefined;

  // Transition Events
  onTransitionCancel?: TransitionEventHandler<T> | undefined;
  onTransitionEnd?: TransitionEventHandler<T> | undefined;
  onTransitionRun?: TransitionEventHandler<T> | undefined;
  onTransitionStart?: TransitionEventHandler<T> | undefined;
}

export interface FormProps extends AriaLabelingProps {
  /**
   * Validation errors for the form, typically returned by a server.
   * This should be set to an object mapping from input names to errors.
   */
  validationErrors?: ValidationErrors;
  /**
   * Where to send the form-data when the form is submitted.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#action).
   */
  action?: string | FormHTMLAttributes<HTMLFormElement>["action"];
  /**
   * The enctype attribute specifies how the form-data should be encoded when submitting it to the
   * server. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#enctype).
   */
  encType?:
    | "application/x-www-form-urlencoded"
    | "multipart/form-data"
    | "text/plain";
  /**
   * The HTTP method to submit the form with.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#method).
   */
  method?: "get" | "post" | "dialog";
  /**
   * The target attribute specifies a name or a keyword that indicates where to display the response
   * that is received after submitting the form. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#target).
   */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /**
   * Triggered when a user submits the form.
   */
  onSubmit?: (event: SubmitEvent<HTMLFormElement>) => void;
  /**
   * Triggered when a user resets the form.
   */
  onReset?: (event: SubmitEvent<HTMLFormElement>) => void;
  /**
   * Triggered for each invalid field when a user submits the form.
   */
  onInvalid?: (event: SubmitEvent<HTMLFormElement>) => void;
  /**
   * Indicates whether input elements can by default have their values automatically completed by
   * the browser. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#autocomplete).
   */
  autoComplete?: "off" | "on";
  /**
   * Controls whether inputted text is automatically capitalized and, if so, in what manner.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   */
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
  /**
   * An ARIA role override to apply to the form element.
   */
  role?: "search" | "presentation";
}
