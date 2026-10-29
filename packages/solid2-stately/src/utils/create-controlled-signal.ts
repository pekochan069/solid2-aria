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
 * Derived from Adobe React Spectrum: packages/react-stately/src/utils/useControlledState.ts.
 * Modified for Solid Aria: adapted state handling, APIs, or formatting for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Accessor } from "solid-js";
import { createRenderEffect, createSignal, untrack } from "solid-js";

type StateUpdate<T> = T | ((previous: T) => T);

type ControlledSetter<T, Args extends unknown[]> = (
  value: StateUpdate<T>,
  ...args: Args
) => void;

function isUpdater<T>(update: StateUpdate<T>): update is (previous: T) => T {
  return typeof update === "function";
}

export function createControlledSignal<T, Args extends unknown[] = []>(
  value: Accessor<T>,
  defaultValue: undefined,
  onChange?: (value: NoInfer<T>, ...args: Args) => void
): [Accessor<T>, ControlledSetter<T, Args>];
export function createControlledSignal<T, Args extends unknown[] = []>(
  value: Accessor<T | undefined>,
  defaultValue: T,
  onChange?: (value: NoInfer<T>, ...args: Args) => void
): [Accessor<T>, ControlledSetter<T, Args>];
export function createControlledSignal<T, Args extends unknown[] = []>(
  value: Accessor<T | undefined>,
  defaultValue: T,
  onChange?: (value: NoInfer<T>, ...args: Args) => void
): [Accessor<T>, ControlledSetter<T, Args>] {
  const initialValue = untrack(value);

  let initialState = defaultValue;

  if (initialValue !== undefined) {
    initialState = initialValue;
  }

  const [state, setState] = createSignal(
    { value: initialState },
    { ownedWrite: true }
  );

  let pendingValue = initialState;
  let wasControlled = initialValue !== undefined;

  const currentValue = () => {
    const controlledValue = value();

    if (controlledValue !== undefined) {
      return controlledValue;
    }

    return state().value;
  };

  createRenderEffect(
    () => ({
      controlled: value() !== undefined,
      state: state(),
      value: currentValue(),
    }),
    (current) => {
      if (
        wasControlled !== current.controlled &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          `WARN: A component changed from ${wasControlled ? "controlled" : "uncontrolled"} to ${current.controlled ? "controlled" : "uncontrolled"}.`
        );
      }

      wasControlled = current.controlled;
      pendingValue = current.value;
    }
  );

  const setValue: ControlledSetter<T, Args> = (update, ...args) => {
    const nextValue = isUpdater(update) ? update(pendingValue) : update;

    if (Object.is(pendingValue, nextValue)) {
      return;
    }

    pendingValue = nextValue;
    setState({ value: nextValue });
    untrack(() => onChange?.(nextValue, ...args));
  };

  return [currentValue, setValue];
}
