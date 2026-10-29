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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tabs/TabsKeyboardDelegate.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  Direction,
  Key,
  KeyboardDelegate,
  Node,
  Orientation,
} from "@solid2-aria/types-shared";

import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { isTruthy } from "../utils/truthy";

export class TabsKeyboardDelegate<T> implements KeyboardDelegate {
  private readonly collection: Collection<Node<T>>;
  private readonly flipDirection: boolean;
  private readonly disabledKeys: Set<Key>;
  private readonly tabDirection: boolean;
  constructor(
    collection: Collection<Node<T>>,
    direction: Direction,
    orientation: Orientation,
    disabledKeys = new Set<Key>()
  ) {
    this.collection = collection;
    // getKeyLeftOf/getKeyRightOf follow the locale's text direction regardless of orientation,
    // so ArrowLeft always moves to the next tab in RTL. getKeyAbove/getKeyBelow are never flipped.
    this.flipDirection = direction === "rtl";
    this.disabledKeys = disabledKeys;
    this.tabDirection = orientation === "horizontal";
  }
  getKeyLeftOf(key: Key): Key | null {
    if (this.flipDirection) {
      return this.getNextKey(key);
    }

    return this.getPreviousKey(key);
  }
  getKeyRightOf(key: Key): Key | null {
    if (this.flipDirection) {
      return this.getPreviousKey(key);
    }

    return this.getNextKey(key);
  }
  private isDisabled(key: Key) {
    return (
      this.disabledKeys.has(key) ||
      isTruthy(getCollectionNodeProps(this.collection.getItem(key))?.isDisabled)
    );
  }
  getFirstKey(): Key | null {
    let key = this.collection.getFirstKey();

    if (isPresent(key) && this.isDisabled(key)) {
      key = this.getNextKey(key);
    }

    return key;
  }
  getLastKey(): Key | null {
    let key = this.collection.getLastKey();

    if (isPresent(key) && this.isDisabled(key)) {
      key = this.getPreviousKey(key);
    }

    return key;
  }
  getKeyAbove(key: Key): Key | null {
    if (this.tabDirection) {
      return null;
    }

    return this.getPreviousKey(key);
  }
  getKeyBelow(key: Key): Key | null {
    if (this.tabDirection) {
      return null;
    }

    return this.getNextKey(key);
  }
  getNextKey(startKey: Key): Key | null {
    let key: Key | null = startKey;

    do {
      key = this.collection.getKeyAfter(key);

      key ??= this.collection.getFirstKey();
    } while (isPresent(key) && this.isDisabled(key) && key !== startKey);

    return key;
  }
  getPreviousKey(startKey: Key): Key | null {
    let key: Key | null = startKey;

    do {
      key = this.collection.getKeyBefore(key);

      key ??= this.collection.getLastKey();
    } while (isPresent(key) && this.isDisabled(key) && key !== startKey);

    return key;
  }
}
