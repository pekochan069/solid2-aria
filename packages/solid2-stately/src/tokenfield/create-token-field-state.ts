/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/tokenfield/useTokenFieldState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ValueBase } from "@solid2-aria/types-shared";
import { createSignal, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { TokenFieldValue } from "./token-field-value";

export type TokenFieldProps<T extends TokenFieldValue = TokenFieldValue> =
  ValueBase<T> &
    (TokenFieldValue extends T ? unknown : { value: T } | { defaultValue: T });

export interface TokenFieldState<T extends TokenFieldValue = TokenFieldValue> {
  /** The current value of the token field. */
  value: T;
  /** Sets the value of the token field. */
  setValue: (fn: T | ((value: T) => T)) => void;
  /** Whether the token field is composing. */
  isComposing: boolean;
  /** Sets the composing state of the token field. */
  setComposing: (isComposing: boolean) => void;
}

/**
 * Provides state management for a token field. Tracks the field value and the
 * composition state.
 */
export function createTokenFieldState<
  T extends TokenFieldValue = TokenFieldValue,
>(props: TokenFieldProps<T>): TokenFieldState<T> {
  // SAFETY: TokenFieldProps requires an initial value for specialized T; only the base value type may use the empty fallback.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const fallback = untrack(
    () => props.defaultValue ?? props.value ?? new TokenFieldValue([])
  ) as T;

  const [value, setValue] = createControlledSignal(
    () => props.value,
    fallback,
    (localValue) => props.onChange?.(localValue)
  );

  const [isComposing, setComposing] = createSignal(false, { ownedWrite: true });

  return {
    get isComposing() {
      return isComposing();
    },
    setComposing(next) {
      setComposing(next);
    },
    setValue,
    get value() {
      return value();
    },
  };
}
