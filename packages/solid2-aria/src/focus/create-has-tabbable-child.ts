/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/focus/useHasTabbableChild.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createMemo, createSignal, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { isTruthy } from "../utils/truthy";
import { getFocusableTreeWalker } from "./focus-scope";

interface AriaHasTabbableChildOptions {
  isDisabled?: boolean;
}

// This was created for a special empty case of a component that can have child or
// be empty, like Collection/Virtualizer/Table/ListView/etc. When these components
// are empty they can have a message with a tabbable element, which is like them
// being not empty, when it comes to focus and tab order.
/**
 * Returns whether an element has a tabbable child, and updates as children change.
 *
 * @private
 */
export function createHasTabbableChild(
  ref: Accessor<Element | null>,
  options?: AriaHasTabbableChildOptions
): Accessor<boolean> {
  const isDisabled = createMemo(() => options?.isDisabled);

  const [hasTabbableChild, setHasTabbableChild] = createSignal(false, {
    ownedWrite: true,
  });

  createEffect(
    () => ({ disabled: isDisabled(), element: ref() }),
    ({ element, disabled }): undefined | (() => void) => {
      if (element && !isTruthy(disabled)) {
        const update = () => {
          const walker = getFocusableTreeWalker(element, { tabbable: true });
          setHasTabbableChild(!!walker.nextNode());
        };

        update();
        // Update when new elements are inserted, or the tabIndex/disabled attribute updates.
        const observer = new MutationObserver(update);
        observer.observe(element, {
          attributeFilter: ["tabindex", "disabled"],
          attributes: true,
          childList: true,
          subtree: true,
        });

        return () => {
          observer.disconnect();
        };
      }

      return undefined;
    },
    { ssrSource: "client" }
  );

  return () => (isTruthy(isDisabled()) ? false : hasTabbableChild());
}
