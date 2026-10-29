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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useSlot.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; included data attributes in slot results.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMProps } from "@solid2-aria/types-shared";
import { createSignal, untrack, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import type { RefCallback } from "../types";
import { createId } from "./create-id";
import { isTruthy } from "./truthy";

export function createSlot(
  initialState: boolean | (() => boolean) = true
): [RefCallback<Element>, Accessor<boolean>] {
  // Initial state is typically based on the parent having an aria-label or aria-labelledby.
  // An explicit accessible name means the optional label slot starts absent.
  const [hasSlot, setHasSlot] = createSignal(
    typeof initialState === "function" ? untrack(initialState) : initialState,
    { ownedWrite: true }
  );

  let hasRun = false;

  // A callback ref which will run when the slotted element mounts.
  // The renderer assigns the ref before the owner settles.
  const ref = (el: Element | null) => {
    hasRun = true;
    setHasSlot(isTruthy(el));
  };

  // If the callback hasn't been called, then reset to false.
  onSettled(() => {
    if (!hasRun) {
      setHasSlot(false);
    }
  });

  return [ref, hasSlot];
}

interface SlotAria extends Pick<DOMProps, `data-${string}`> {
  id: string | undefined;
  ref: RefCallback<Element>;
}

export function createSlotId2(
  initialState: boolean | (() => boolean) = true
): SlotAria {
  const id = createId();
  const [ref, hasSlot] = createSlot(initialState);

  return {
    get id() {
      return hasSlot() ? id() : undefined;
    },
    get ref() {
      return ref;
    },
  };
}
