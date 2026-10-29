/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/autocomplete/useAutocompleteState.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Element as SolidElement } from "solid-js";
import { createSignal, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";

export interface AutocompleteState {
  /** The current value of the autocomplete input. */
  inputValue: string;
  /** Sets the value of the autocomplete input. */
  setInputValue: (value: string) => void;
  /** The id of the current aria-activedescendant of the autocomplete input. */
  focusedNodeId: string | null;
  /** Sets the id of the current aria-activedescendant of the autocomplete input. */
  setFocusedNodeId: (value: string | null) => void;
}

export interface AutocompleteProps {
  /** The value of the autocomplete input (controlled). */
  inputValue?: string;
  /** The default value of the autocomplete input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the autocomplete input value changes. */
  onInputChange?: (value: string) => void;
  /**
   * The children wrapped by the autocomplete. Consists of at least an input element and a
   * collection element to filter.
   */
  children: SolidElement;
}

// Emulate our other stately hooks which accept all "base" props even if not used
export type AutocompleteStateOptions = Omit<AutocompleteProps, "children">;

/**
 * Provides state management for an autocomplete component.
 */
export function createAutocompleteState(
  props: AutocompleteStateOptions
): AutocompleteState {
  const [focusedNodeId, setFocusedNodeId] = createSignal<string | null>(null);

  const [inputValue, setInputValue] = createControlledSignal(
    () => props.inputValue,
    untrack(() => props.defaultInputValue) ?? "",
    (value) => props.onInputChange?.(value)
  );

  return {
    get focusedNodeId() {
      return focusedNodeId();
    },
    get inputValue() {
      return inputValue();
    },
    setFocusedNodeId(value: string | null) {
      setFocusedNodeId(value);
    },
    setInputValue,
  };
}
