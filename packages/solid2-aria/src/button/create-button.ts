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
 * Derived from Adobe React Spectrum: packages/react-aria/src/button/useButton.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusableElement,
  AriaLabelingProps,
  FocusableDOMProps,
  FocusableProps,
  PressEvents,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createMemo } from "solid-js";
import type { Component, Element as SolidElement, Accessor } from "solid-js";

import { createFocusable } from "../interactions/create-focusable";
import { createPress } from "../interactions/create-press";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { filterDOMProps } from "../utils/filter-dom-props";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";

export interface ButtonProps extends PressEvents, FocusableProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean;
  /** The content to display in the button. */
  children?: SolidElement;
}

export interface AriaBaseButtonProps
  extends FocusableDOMProps, AriaLabelingProps {
  /** Indicates whether the element is disabled to users of assistive technology. */
  "aria-disabled"?: boolean | "true" | "false";
  /**
   * Indicates whether the element, or another grouping element it controls, is currently expanded
   * or collapsed.
   */
  "aria-expanded"?: boolean | "true" | "false";
  /**
   * Indicates the availability and type of interactive popup element, such as menu or dialog, that
   * can be triggered by an element.
   */
  "aria-haspopup"?:
    | boolean
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog"
    | "true"
    | "false";
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   */
  "aria-controls"?: string;
  /** Indicates the current "pressed" state of toggle buttons. */
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  /**
   * Indicates whether this element represents the current item within a container or set of related
   * elements.
   */
  "aria-current"?:
    | boolean
    | "true"
    | "false"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
  /**
   * The behavior of the button when used in an HTML form.
   *
   * @default 'button'
   */
  type?: "button" | "submit" | "reset";
  /**
   * Whether to prevent focus from moving to the button when pressing it.
   *
   * Caution, this can make the button inaccessible and should only be used when alternative
   * keyboard interaction is provided, such as ComboBox's MenuTrigger or a NumberField's
   * increment/decrement control.
   */
  preventFocusOnPress?: boolean;
  /**
   * The `<form>` element to associate the button with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#form).
   */
  form?: string;
  /** Whether a disabled button remains focusable. */
  allowFocusWhenDisabled?: boolean;
  /**
   * The URL that processes the information submitted by the button.
   * Overrides the action attribute of the button's form owner.
   */
  formAction?: ButtonHTMLAttributes["formaction"];
  /** Indicates how to encode the form data that is submitted. */
  formEncType?: string;
  /** Indicates the HTTP method used to submit the form. */
  formMethod?: string;
  /** Indicates that the form is not to be validated when it is submitted. */
  formNoValidate?: boolean;
  /** Overrides the target attribute of the button's form owner. */
  formTarget?: string;
  /** Submitted as a pair with the button's value as part of the form data. */
  name?: string;
  /** The value associated with the button's name when it's submitted with the form data. */
  value?: string;
}

export interface AriaButtonElementTypeProps<T extends ElementType = "button"> {
  /**
   * The HTML element or Solid component used to render the button, e.g. 'div', 'a', or `RouterLink`.
   *
   * @default 'button'
   */
  elementType?: T | Component<never>;
}

export interface LinkButtonProps<
  T extends ElementType = "button",
> extends AriaButtonElementTypeProps<T> {
  /** A URL to link to if elementType="a". */
  href?: string;
  /** The target window for the link. */
  target?: string;
  /**
   * The relationship between the linked resource and the current page. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel).
   */
  rel?: string;
}

export interface AriaButtonProps<T extends ElementType = "button">
  extends ButtonProps, LinkButtonProps<T>, AriaBaseButtonProps {}

export type AriaButtonOptions<E extends ElementType> = Omit<
  AriaButtonProps<E>,
  "children"
>;

export interface ButtonAria<T> {
  /** Props for the button element. */
  buttonProps: T;
  /** Whether the button is currently pressed. */
  isPressed: boolean;
}

// Order with overrides is important: 'button' should be default
export function createButton(
  props: AriaButtonOptions<"button">,
  ref: Accessor<HTMLButtonElement | null>
): ButtonAria<ButtonHTMLAttributes>;
export function createButton(
  props: AriaButtonOptions<"a">,
  ref: Accessor<HTMLAnchorElement | null>
): ButtonAria<AnchorHTMLAttributes>;
export function createButton(
  props: AriaButtonOptions<"div">,
  ref: Accessor<HTMLDivElement | null>
): ButtonAria<HTMLAttributes<HTMLDivElement>>;
export function createButton(
  props: AriaButtonOptions<"input">,
  ref: Accessor<HTMLInputElement | null>
): ButtonAria<InputHTMLAttributes>;
export function createButton(
  props: AriaButtonOptions<"span">,
  ref: Accessor<HTMLSpanElement | null>
): ButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function createButton(
  props: AriaButtonOptions<ElementType>,
  ref: Accessor<FocusableElement | null>
): ButtonAria<DOMAttributes>;
/**
 * Provides the behavior and accessibility implementation for a button component. Handles mouse,
 * keyboard, and touch interactions, focus behavior, and ARIA props for both native button elements
 * and custom element types.
 *
 * @param props - Props to be applied to the button.
 * @param ref - A ref to a DOM element for the button.
 */
export function createButton(
  props: AriaButtonOptions<ElementType>,
  ref: Accessor<FocusableElement | null>
) {
  const _result0 = props;

  const additionalProps = createMemo(() => {
    const elementType = props.elementType ?? "button";

    if (elementType === "button") {
      return {
        disabled: props.isDisabled,
        form: props.form,
        formaction: props.formAction,
        formenctype: props.formEncType,
        formmethod: props.formMethod,
        formnovalidate: props.formNoValidate,
        formtarget: props.formTarget,
        name: props.name,
        type: props.type ?? "button",
        value: props.value,
      };
    }

    return {
      "aria-disabled": ariaValue(
        !isTruthy(props.isDisabled) || elementType === "input"
          ? undefined
          : props.isDisabled
      ),
      disabled: elementType === "input" ? props.isDisabled : undefined,
      href:
        elementType === "a" && !isTruthy(props.isDisabled)
          ? props.href
          : undefined,
      rel: elementType === "a" ? props.rel : undefined,
      role: "button" as const,
      target: elementType === "a" ? props.target : undefined,
      type: elementType === "input" ? (props.type ?? "button") : undefined,
    };
  });

  const _result1 = createPress({
    get isDisabled() {
      return _result0.isDisabled;
    },
    get onClick() {
      return _result0.onClick;
    },
    get onPress() {
      return _result0.onPress;
    },
    get onPressChange() {
      return _result0.onPressChange;
    },
    get onPressEnd() {
      return _result0.onPressEnd;
    },
    get onPressStart() {
      return _result0.onPressStart;
    },
    get onPressUp() {
      return _result0.onPressUp;
    },
    get preventFocusOnPress() {
      return _result0.preventFocusOnPress;
    },
    get ref() {
      return ref;
    },
  });

  const _result2 = createFocusable(props, ref);

  const buttonProps = createMemo(() =>
    mergeProps(
      _result2.focusableProps,
      _result1.pressProps,
      filterDOMProps(props, { labelable: true }),
      isTruthy(props.allowFocusWhenDisabled)
        ? {
            tabindex: isTruthy(props.isDisabled)
              ? -1
              : _result2.focusableProps.tabindex,
          }
        : {}
    )
  );

  return {
    get buttonProps() {
      return mergeProps(additionalProps(), buttonProps(), {
        "aria-controls": ariaValue(props["aria-controls"]),
        "aria-current": ariaValue(props["aria-current"]),
        "aria-disabled": ariaValue(props["aria-disabled"]),
        "aria-expanded": ariaValue(props["aria-expanded"]),
        "aria-haspopup": ariaValue(props["aria-haspopup"]),
        "aria-pressed": ariaValue(props["aria-pressed"]),
      });
    },
    get isPressed() {
      return _result1.isPressed;
    },
  };
}
