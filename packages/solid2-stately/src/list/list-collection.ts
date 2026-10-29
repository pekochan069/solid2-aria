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
 * Derived from Adobe React Spectrum: packages/react-stately/src/list/ListCollection.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Collection, Key, Node } from "@solid2-aria/types-shared";

import { getNodeChildren } from "../collections/get-child-nodes";

export class ListCollection<T> implements Collection<Node<T>> {
  private readonly keyMap = new Map<Key, Node<T>>();
  private readonly iterable: Iterable<Node<T>>;
  private readonly firstKey: Key | null = null;
  private readonly lastKey: Key | null = null;
  private readonly _size: number;
  constructor(nodes: Iterable<Node<T>>) {
    this.iterable = nodes;

    const visit = (node: Node<T>) => {
      this.keyMap.set(node.key, node);

      if (node.type === "section") {
        for (const child of getNodeChildren(node)) {
          visit(child);
        }
      }
    };

    for (const node of nodes) {
      visit(node);
    }

    let last: Node<T> | null = null;
    let index = 0;
    let size = 0;

    for (const [key, node] of this.keyMap) {
      if (last) {
        last.nextKey = key;
        node.prevKey = last.key;
      } else {
        this.firstKey = key;
        node.prevKey = undefined;
      }

      if (node.type === "item") {
        node.index = index;
        index += 1;
      }

      // Only count sections and items when determining size so that
      // loaders and separators in RAC/S2 don't influence the emptyState determination
      if (node.type === "section" || node.type === "item") {
        size += 1;
      }

      last = node;
      // Set nextKey as undefined since this might be the last node
      // If it isn't the last node, last.nextKey will properly set at start of new loop
      last.nextKey = undefined;
    }

    this._size = size;
    this.lastKey = last?.key ?? null;
  }
  *[Symbol.iterator](): IterableIterator<Node<T>> {
    yield* this.iterable;
  }
  get size(): number {
    return this._size;
  }
  getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }
  getKeyBefore(key: Key): Key | null {
    const node = this.keyMap.get(key);

    return node ? (node.prevKey ?? null) : null;
  }
  getKeyAfter(key: Key): Key | null {
    const node = this.keyMap.get(key);

    return node ? (node.nextKey ?? null) : null;
  }
  getFirstKey(): Key | null {
    return this.firstKey;
  }
  getLastKey(): Key | null {
    return this.lastKey;
  }
  getItem(key: Key): Node<T> | null {
    return this.keyMap.get(key) ?? null;
  }
  at(idx: number): Node<T> | null {
    const keys = [...this.getKeys()];
    const key = keys[idx];

    return key === null || key === undefined ? null : this.getItem(key);
  }
  getChildren(key: Key): Iterable<Node<T>> {
    const node = this.keyMap.get(key);

    return node ? getNodeChildren(node) : [];
  }
}
