/*
 * Copyright 2021 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/useEvent.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { EventMapType } from "@solid2-aria/types-shared";
import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { addEvent } from "./dom-helpers";

export function createEvent<
  T extends EventTarget,
  K extends keyof EventMapType<T>,
>(
  ref: Accessor<T | null>,
  event: Extract<K, string> | (string & Record<never, never>),
  listener?: (
    this: T,
    ev: EventMapType<Exclude<T, null>>[K] & { readonly currentTarget: T }
  ) => void,
  options?: boolean | AddEventListenerOptions
): void {
  createEffect(ref, (target) => addEvent(target, event, listener, options), {
    ssrSource: "client",
  });
}
