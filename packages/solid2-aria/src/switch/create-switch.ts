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
 * Derived from Adobe React Spectrum: packages/react-aria/src/switch/useSwitch.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  ToggleProps,
  ToggleState,
} from "@solid2-aria/stately/toggle/create-toggle-state";
import type {
  InputDOMProps,
  ValidationResult,
} from "@solid2-aria/types-shared";
import type { DOMAttributesWithRef } from "@solid2-aria/types-shared-web";
import { omit, merge } from "solid-js";
import type { Accessor } from "solid-js";

import { createToggle } from "../toggle/create-toggle";
import type { AriaToggleProps } from "../toggle/create-toggle";
import type { InputHTMLAttributes, LabelHTMLAttributes } from "../types";

export type SwitchProps = ToggleProps;

export interface AriaSwitchProps
  extends SwitchProps, InputDOMProps, AriaToggleProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   */
  "aria-controls"?: string;
}

export interface SwitchAria extends ValidationResult {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes;
  /** Props for the switch description element, if any. */
  descriptionProps: DOMAttributesWithRef<HTMLElement>;
  /** Props for the switch error message element, if any. */
  errorMessageProps: DOMAttributesWithRef<HTMLElement>;
  /** Whether the switch is selected. */
  isSelected: boolean;
  /** Whether the switch is in a pressed state. */
  isPressed: boolean;
  /** Whether the switch is disabled. */
  isDisabled: boolean;
  /** Whether the switch is read only. */
  isReadOnly: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a switch component.
 * A switch is similar to a checkbox, but represents on/off values as opposed to selection.
 *
 * @param props - Props for the switch.
 * @param state - State for the switch, as returned by `useToggleState`.
 * @param ref - Ref to the HTML input element.
 */
export function createSwitch(
  props: AriaSwitchProps,
  state: ToggleState,
  ref: Accessor<HTMLInputElement | null>
): SwitchAria {
  const _result0 = createToggle(props, state, ref);

  return merge(
    {
      get inputProps() {
        return merge(_result0.inputProps, {
          get checked() {
            return _result0.isSelected;
          },
          get role(): "switch" {
            return "switch";
          },
        });
      },
      get isSelected() {
        return _result0.isSelected;
      },
      get labelProps() {
        return _result0.labelProps;
      },
    },
    omit(_result0, "labelProps", "inputProps", "isSelected")
  );
}
