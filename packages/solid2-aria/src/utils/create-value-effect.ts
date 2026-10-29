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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useValueEffect.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Accessor } from "solid-js";
import { createEffect, onSettled, untrack, createSignal } from "solid-js";

type SetValueAction<S> = (previous: S) => Generator<S, void, unknown>;

export function createValueEffect<S>(
  initial: S
): [Accessor<S>, (update: SetValueAction<S>) => void] {
  const [value, setValue] = createSignal<S>(() => initial, {
    ownedWrite: true,
  });

  let current = untrack(value);
  let generator: Generator<S, void, unknown> | undefined;
  let disposed = false;

  function advance() {
    while (generator) {
      if (disposed) {
        return;
      }

      const next = generator.next();

      if (next.done === true) {
        generator = undefined;

        return;
      }

      if (!Object.is(current, next.value)) {
        current = next.value;
        setValue(() => next.value);

        return;
      }
    }
  }

  createEffect(value, (committed) => {
    current = committed;
    advance();
  });
  onSettled(() => () => {
    disposed = true;
    generator?.return();
    generator = undefined;
  });

  return [
    value,
    (update) => {
      generator?.return();
      generator = update(current);
      advance();
    },
  ];
}
