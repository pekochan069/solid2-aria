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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/createEventHandler.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { BaseEvent } from "@solid2-aria/types-shared";

import { isCallable } from "../utils/is-callable";
import { isPropagationStopped } from "../utils/is-propagation-stopped";
import { readProperty } from "../utils/read-property";

/**
 * This function wraps a native event handler to make stopPropagation the default, and support
 * continuePropagation instead.
 */
export function createEventHandler<T extends Event>(
  handler?: (e: BaseEvent<T>) => void
): ((e: T) => void) | undefined {
  if (!handler) {
    return undefined;
  }

  return (e) => {
    let shouldStopPropagation = true;

    // SAFETY: The proxy supplies continuePropagation and stopPropagation, and binds all other native event members to the original event.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Proxy traps add the BaseEvent methods without changing the native event target.
    const event = new Proxy(e, {
      get(target, key) {
        if (key === "continuePropagation") {
          return () => {
            shouldStopPropagation = false;

            if (
              "continuePropagation" in e &&
              isCallable(e.continuePropagation)
            ) {
              e.continuePropagation();
            }
          };
        }

        if (key === "stopPropagation") {
          return () => {
            shouldStopPropagation = true;
          };
        }

        const value = readProperty(target, key);

        return isCallable(value) ? value.bind(target) : value;
      },
    }) as BaseEvent<T>;

    handler(event);

    if (shouldStopPropagation && !isPropagationStopped(e)) {
      e.stopPropagation();
    }
  };
}
