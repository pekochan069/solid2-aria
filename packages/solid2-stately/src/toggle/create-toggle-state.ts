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
 * Derived from Adobe React Spectrum: packages/react-stately/src/toggle/useToggleState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusableProps,
  InputBase,
  Validation,
} from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";
import { untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";

export interface ToggleStateOptions extends InputBase {
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: boolean;
  /**
   * Whether the element should be selected (controlled).
   */
  isSelected?: boolean;
  /**
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void;
}

export interface ToggleProps
  extends ToggleStateOptions, Validation<boolean>, FocusableProps {
  /**
   * The label for the element.
   */
  children?: SolidElement;
  /**
   * The value of the input element, used when submitting an HTML form. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string;
}

export interface ToggleState {
  /** Whether the toggle is selected. */
  readonly isSelected: boolean;
  /** Whether the toggle is selected by default. */
  readonly defaultSelected: boolean;
  /** Updates selection state. */
  setSelected: (isSelected: boolean) => void;
  /** Toggle the selection state. */
  toggle: () => void;
}

/**
 * Provides state management for toggle components like checkboxes and switches.
 */
export function createToggleState(props: ToggleStateOptions = {}): ToggleState {
  const [isSelected, setSelected] = createControlledSignal(
    () => props.isSelected,
    untrack(() => props.defaultSelected ?? false),
    (value) => props.onChange?.(value)
  );

  const initialValue = untrack(isSelected);

  return {
    get defaultSelected() {
      return props.defaultSelected ?? initialValue;
    },
    get isSelected() {
      return isSelected();
    },
    setSelected(value) {
      if (!(props.isReadOnly === true)) {
        setSelected(value);
      }
    },
    toggle() {
      if (!(props.isReadOnly === true)) {
        setSelected((value) => !value);
      }
    },
  };
}
