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
 * Derived from Adobe React Spectrum: packages/react-stately/src/searchfield/useSearchFieldState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  FocusableProps,
  HelpTextProps,
  InputBase,
  LabelableProps,
  TextInputBase,
  Validation,
  ValueBase,
} from "@solid2-aria/types-shared";
import { untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";

// Copied here to avoid depending on @react-aria/textfield from stately.
export interface TextFieldProps<T = HTMLInputElement>
  extends
    InputBase,
    Validation<string>,
    HelpTextProps,
    FocusableProps<T>,
    TextInputBase,
    ValueBase<string>,
    LabelableProps {}

export interface SearchFieldProps extends TextFieldProps {
  /** Handler that is called when the SearchField is submitted. */
  onSubmit?: (value: string) => void;
  /** Handler that is called when the clear button is pressed. */
  onClear?: () => void;
}

export interface SearchFieldState {
  /** The current value of the search field. */
  readonly value: string;
  /** Sets the value of the search field. */
  setValue: (value: string) => void;
}

/**
 * Provides state management for a search field.
 */
export function createSearchFieldState(
  props: SearchFieldProps
): SearchFieldState {
  const [value, setValue] = createControlledSignal(
    () => props.value ?? undefined,
    untrack(() => props.defaultValue ?? ""),
    (localValue) => props.onChange?.(localValue)
  );

  return {
    setValue,
    get value() {
      return value();
    },
  };
}
