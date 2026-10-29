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
 * Derived from Adobe React Spectrum: packages/react-stately/src/collections/getItemCount.ts.
 * Modified for Solid Aria: adapted state, collection descriptors, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Collection, Node } from "@solid2-aria/types-shared";

import { getChildNodes } from "./get-child-nodes";

const cache = new WeakMap<Iterable<unknown>, number>();

export function getItemCount<T>(collection: Collection<Node<T>>): number {
  const count = cache.get(collection);

  if (count !== null && count !== undefined) {
    return count;
  }

  // TS isn't smart enough to know we've ensured count is a number, so use a new variable
  let counter = 0;

  const countItems = (items: Iterable<Node<T>>) => {
    for (const item of items) {
      if (item.type === "section") {
        countItems(getChildNodes(item, collection));
      } else if (item.type === "item") {
        counter += 1;
      }
    }
  };

  countItems(collection);
  cache.set(collection, counter);

  return counter;
}
