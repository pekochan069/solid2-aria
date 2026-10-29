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
 * Derived from Adobe React Spectrum: packages/react-aria/src/selection/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Collection, Key } from "@solid2-aria/types-shared";
import { createUniqueId } from "solid-js";
import type { Accessor } from "solid-js";

import { isAppleDevice } from "../utils/platform";
import { isTruthy } from "../utils/truthy";

interface Event {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export function isNonContiguousSelectionModifier(e: Event): boolean {
  // Ctrl + Arrow Up/Arrow Down has a system wide meaning on macOS, so use Alt instead.
  // On Windows and Ubuntu, Alt + Space has a system wide meaning.
  return isAppleDevice() ? e.altKey : e.ctrlKey;
}

export function getItemElement(
  collectionRef: Accessor<HTMLElement | null>,
  key: Key
): Element | null | undefined {
  let selector = `[data-key="${CSS.escape(String(key))}"]`;
  const collection = collectionRef()?.dataset.collection;

  if (isTruthy(collection)) {
    selector = `[data-collection="${CSS.escape(collection)}"]${selector}`;
  }

  return collectionRef()?.querySelector(selector);
}

const collectionMap = new WeakMap<Collection<unknown>, string>();

export function createCollectionId(collection: Collection<unknown>): string {
  const id = createUniqueId();
  collectionMap.set(collection, id);

  return id;
}

export function getCollectionId(
  collection: Collection<unknown>
): string | undefined {
  return collectionMap.get(collection);
}
