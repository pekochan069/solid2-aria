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
 * Derived from Adobe React Spectrum: packages/react-aria/src/button/useToggleButton.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ToggleState } from "@solid2-aria/stately/toggle/create-toggle-state";
import type { FocusableElement } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge } from "solid-js";
import type { Accessor } from "solid-js";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
} from "../types";
import { ariaValue } from "../utils/aria-value";
import { chain } from "../utils/chain";
import { mergeProps } from "../utils/merge-props";
import { getTruthyValue } from "../utils/truthy";
import { createButton } from "./create-button";
import type {
  AriaBaseButtonProps,
  AriaButtonElementTypeProps,
  ButtonAria,
  ButtonProps,
} from "./create-button";

export interface ToggleButtonProps extends ButtonProps {
  /** Whether the element should be selected (controlled). */
  isSelected?: boolean;
  /** Whether the element should be selected (uncontrolled). */
  defaultSelected?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (isSelected: boolean) => void;
}

export interface AriaToggleButtonProps<T extends ElementType = "button">
  extends
    ToggleButtonProps,
    Omit<
      AriaBaseButtonProps,
      | "aria-current"
      | "form"
      | "formAction"
      | "formEncType"
      | "formMethod"
      | "formNoValidate"
      | "formTarget"
      | "name"
      | "value"
      | "type"
    >,
    AriaButtonElementTypeProps<T> {}

export type AriaToggleButtonOptions<E extends ElementType> = Omit<
  AriaToggleButtonProps<E>,
  "children"
>;

export interface ToggleButtonAria<T> extends ButtonAria<T> {
  /** Whether the button is selected. */
  isSelected: boolean;
  /** Whether the button is disabled. */
  isDisabled: boolean;
}

// Order with overrides is important: 'button' should be default
export function createToggleButton(
  props: AriaToggleButtonOptions<"button">,
  state: ToggleState,
  ref: Accessor<HTMLButtonElement | null>
): ToggleButtonAria<ButtonHTMLAttributes>;
export function createToggleButton(
  props: AriaToggleButtonOptions<"a">,
  state: ToggleState,
  ref: Accessor<HTMLAnchorElement | null>
): ToggleButtonAria<AnchorHTMLAttributes>;
export function createToggleButton(
  props: AriaToggleButtonOptions<"div">,
  state: ToggleState,
  ref: Accessor<HTMLDivElement | null>
): ToggleButtonAria<HTMLAttributes<HTMLDivElement>>;
export function createToggleButton(
  props: AriaToggleButtonOptions<"input">,
  state: ToggleState,
  ref: Accessor<HTMLInputElement | null>
): ToggleButtonAria<InputHTMLAttributes>;
export function createToggleButton(
  props: AriaToggleButtonOptions<"span">,
  state: ToggleState,
  ref: Accessor<HTMLSpanElement | null>
): ToggleButtonAria<HTMLAttributes<HTMLSpanElement>>;
export function createToggleButton(
  props: AriaToggleButtonOptions<ElementType>,
  state: ToggleState,
  ref: Accessor<FocusableElement | null>
): ToggleButtonAria<DOMAttributes>;
/**
 * Provides the behavior and accessibility implementation for a toggle button component.
 * ToggleButtons allow users to toggle a selection on or off, for example switching between two
 * states or modes.
 */
export function createToggleButton(
  props: AriaToggleButtonOptions<ElementType>,
  state: ToggleState,
  ref: Accessor<FocusableElement | null>
) {
  const _result0 = state;

  const _result1 = createButton(
    merge(props, {
      get onPress() {
        return chain(state.toggle, props.onPress);
      },
    }),
    ref
  );

  return {
    get buttonProps() {
      return mergeProps(_result1.buttonProps, {
        "aria-pressed": ariaValue(_result0.isSelected),
      });
    },
    get isDisabled() {
      return getTruthyValue(props.isDisabled) ?? false;
    },
    get isPressed() {
      return _result1.isPressed;
    },
    get isSelected() {
      return _result0.isSelected;
    },
  };
}
