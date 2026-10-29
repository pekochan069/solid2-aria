/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/collections/BaseCollection.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection as ICollection,
  Key,
  Node,
} from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";

import { isPresent } from "../utils/is-present";
import { requireValue } from "../utils/require-value";

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type FilterFn<T> = (textValue: string, node: Node<T>) => boolean;

/** An immutable object representing a Node in a Collection. */
export class CollectionNode<T> implements Node<T> {
  static readonly type: string;
  readonly type: string;
  readonly key: Key;
  readonly value: T | null = null;
  readonly level: number = 0;
  readonly hasChildNodes: boolean = false;
  readonly rendered: SolidElement = null;
  readonly textValue: string = "";
  readonly "aria-label"?: string = undefined;
  readonly index: number = 0;
  readonly parentKey: Key | null = null;
  readonly prevKey: Key | null = null;
  readonly nextKey: Key | null = null;
  readonly firstChildKey: Key | null = null;
  readonly lastChildKey: Key | null = null;
  readonly props = {};
  readonly render?: (node: Node<T>) => SolidElement;
  readonly colSpan: number | null = null;
  readonly colIndex: number | null = null;
  constructor(key: Key) {
    // SAFETY: Every node class declares the static type used by this constructor.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Polymorphic static members are erased on Function.
    this.type = (this.constructor as typeof CollectionNode).type;
    this.key = key;
  }
  get childNodes(): Iterable<Node<T>> {
    throw new Error("childNodes is not supported");
  }
  clone(): this {
    // SAFETY: A node clone uses its own constructor and retains the same node subtype.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- TypeScript does not model polymorphic constructors.
    const Constructor = this.constructor as new (key: Key) => Mutable<this>;
    const node = new Constructor(this.key);
    node.value = this.value;
    node.level = this.level;
    node.hasChildNodes = this.hasChildNodes;
    node.rendered = this.rendered;
    node.textValue = this.textValue;
    node["aria-label"] = this["aria-label"];
    node.index = this.index;
    node.parentKey = this.parentKey;
    node.prevKey = this.prevKey;
    node.nextKey = this.nextKey;
    node.firstChildKey = this.firstChildKey;
    node.lastChildKey = this.lastChildKey;
    node.props = this.props;
    node.render = this.render;
    node.colSpan = this.colSpan;
    node.colIndex = this.colIndex;

    return node;
  }
  filter(
    collection: BaseCollection<T>,
    newCollection: BaseCollection<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filterFn: FilterFn<T>
  ): this | null {
    const clone = this.clone();
    newCollection.addDescendants(clone, collection);

    return clone;
  }
}

export class FilterableNode<T> extends CollectionNode<T> {
  override filter(
    collection: BaseCollection<T>,
    newCollection: BaseCollection<T>,
    filterFn: FilterFn<T>
  ): this | null {
    const [firstKey, lastKey] = filterChildren(
      collection,
      newCollection,
      this.firstChildKey,
      filterFn
    );

    const newNode: Mutable<this> = this.clone();
    newNode.firstChildKey = firstKey;
    newNode.lastChildKey = lastKey;

    return newNode;
  }
}

export class HeaderNode extends CollectionNode<unknown> {
  static override readonly type = "header";
}

export class LoaderNode extends CollectionNode<unknown> {
  static override readonly type = "loader";
}

export class ItemNode<T> extends FilterableNode<T> {
  static override readonly type = "item";
  override filter(
    collection: BaseCollection<T>,
    newCollection: BaseCollection<T>,
    filterFn: FilterFn<T>
  ): this | null {
    if (filterFn(this.textValue, this)) {
      const clone = this.clone();
      newCollection.addDescendants(clone, collection);

      return clone;
    }

    return null;
  }
}

export class SectionNode<T> extends FilterableNode<T> {
  static override readonly type = "section";
  override filter(
    collection: BaseCollection<T>,
    newCollection: BaseCollection<T>,
    filterFn: FilterFn<T>
  ): this | null {
    const filteredSection = super.filter(collection, newCollection, filterFn);

    if (filteredSection && filteredSection.lastChildKey !== null) {
      const lastChild = collection.getItem(filteredSection.lastChildKey);

      if (lastChild && lastChild.type !== "header") {
        return filteredSection;
      }
    }

    return null;
  }
}

/**
 * An immutable Collection implementation. Updates are only allowed
 * when it is not marked as frozen. This can be subclassed to implement
 * custom collection behaviors.
 */
export class BaseCollection<T> implements ICollection<Node<T>> {
  protected keyMap = new Map<Key, CollectionNode<T>>();
  protected firstKey: Key | null = null;
  protected lastKey: Key | null = null;
  protected frozen = false;
  protected itemCount = 0;
  get size(): number {
    return this.itemCount;
  }
  getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }
  *[Symbol.iterator](): IterableIterator<Node<T>> {
    let node: Node<T> | undefined = isPresent(this.firstKey)
      ? this.keyMap.get(this.firstKey)
      : undefined;

    while (node) {
      yield node;
      node = isPresent(node.nextKey)
        ? this.keyMap.get(node.nextKey)
        : undefined;
    }
  }
  getChildren(key: Key): Iterable<CollectionNode<T>> {
    const { keyMap } = this;

    return {
      *[Symbol.iterator]() {
        const parent = keyMap.get(key);

        let node = isPresent(parent?.firstChildKey)
          ? keyMap.get(parent.firstChildKey)
          : null;

        while (node) {
          yield node;
          node = isPresent(node.nextKey) ? keyMap.get(node.nextKey) : undefined;
        }
      },
    };
  }
  getKeyBefore(key: Key): Key | null {
    let node = this.keyMap.get(key);

    if (!node) {
      return null;
    }

    if (isPresent(node.prevKey)) {
      node = this.keyMap.get(node.prevKey);

      while (
        node &&
        node.type !== "item" &&
        node.lastChildKey !== null &&
        node.lastChildKey !== undefined
      ) {
        node = this.keyMap.get(node.lastChildKey);
      }

      return node?.key ?? null;
    }

    return node.parentKey;
  }
  getKeyAfter(key: Key): Key | null {
    let node = this.keyMap.get(key);

    if (!node) {
      return null;
    }

    if (
      node.type !== "item" &&
      node.firstChildKey !== null &&
      node.firstChildKey !== undefined
    ) {
      return node.firstChildKey;
    }

    while (node) {
      if (isPresent(node.nextKey)) {
        return node.nextKey;
      }

      if (!isPresent(node.parentKey)) {
        return null;
      }

      node = this.keyMap.get(node.parentKey);
    }

    return null;
  }
  getFirstKey(): Key | null {
    return this.firstKey;
  }
  getLastKey(): Key | null {
    let node = isPresent(this.lastKey) ? this.keyMap.get(this.lastKey) : null;

    while (isPresent(node?.lastChildKey)) {
      node = this.keyMap.get(node.lastChildKey);
    }

    return node?.key ?? null;
  }
  getItem(key: Key): CollectionNode<T> | null {
    return this.keyMap.get(key) ?? null;
  }
  at(): Node<T> {
    throw new Error("Not implemented");
  }
  clone(): this {
    // We need to clone using this.constructor so that subclasses have the right prototype.
    // TypeScript isn't happy about this yet.
    // https://github.com/microsoft/TypeScript/issues/3841
    // SAFETY: Collection subclasses use their own constructor when cloning.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- TypeScript does not model polymorphic constructors.
    const Constructor = this.constructor as new () => this;
    const collection: this = new Constructor();
    collection.keyMap = new Map(this.keyMap);
    collection.firstKey = this.firstKey;
    collection.lastKey = this.lastKey;
    collection.itemCount = this.itemCount;

    return collection;
  }
  addNode(node: CollectionNode<T>): void {
    if (this.frozen) {
      throw new Error("Cannot add a node to a frozen collection");
    }

    if (node.type === "item" && !isPresent(this.keyMap.get(node.key))) {
      this.itemCount += 1;
    }

    this.keyMap.set(node.key, node);
  }
  // Deeply add a node and its children to the collection from another collection, primarily used when filtering a collection
  addDescendants(
    node: CollectionNode<T>,
    oldCollection: BaseCollection<T>
  ): void {
    this.addNode(node);
    const children = oldCollection.getChildren(node.key);

    for (const child of children) {
      this.addDescendants(child, oldCollection);
    }
  }
  removeNode(key: Key): void {
    if (this.frozen) {
      throw new Error("Cannot remove a node to a frozen collection");
    }

    const node = this.keyMap.get(key);

    if (isPresent(node) && node.type === "item") {
      this.itemCount -= 1;
    }

    this.keyMap.delete(key);
  }
  commit(firstKey: Key | null, lastKey: Key | null, isSSR = false): void {
    if (this.frozen) {
      throw new Error("Cannot commit a frozen collection");
    }

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.frozen = !isSSR;
  }
  filter(filterFn: FilterFn<T>): this {
    // SAFETY: Filtering creates the same collection subtype through its own constructor.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- TypeScript does not model polymorphic constructors.
    const Constructor = this.constructor as new () => this;
    const newCollection = new Constructor();

    const [firstKey, lastKey] = filterChildren(
      this,
      newCollection,
      this.firstKey,
      filterFn
    );

    newCollection?.commit(firstKey, lastKey);

    return newCollection;
  }
}

function filterChildren<T>(
  collection: BaseCollection<T>,
  newCollection: BaseCollection<T>,
  firstChildKey: Key | null,
  filterFn: FilterFn<T>
): [Key | null, Key | null] {
  // loop over the siblings for firstChildKey
  // create new nodes based on calling node.filter for each child
  // if it returns null then don't include it, otherwise update its prev/next keys
  // add them to the newCollection
  if (!isPresent(firstChildKey)) {
    return [null, null];
  }

  let firstNode: Node<T> | null = null;
  let lastNode: Node<T> | null = null;
  let currentNode = collection.getItem(firstChildKey);

  while (isPresent(currentNode)) {
    const newNode: Mutable<CollectionNode<T>> | null = currentNode.filter(
      collection,
      newCollection,
      filterFn
    );

    if (isPresent(newNode)) {
      newNode.nextKey = null;

      if (lastNode) {
        newNode.prevKey = lastNode.key;
        lastNode.nextKey = newNode.key;
      }

      firstNode ??= newNode;

      newCollection.addNode(newNode);
      lastNode = newNode;
    }

    currentNode = isPresent(currentNode.nextKey)
      ? collection.getItem(currentNode.nextKey)
      : null;
  }

  // Follow-up: this is pretty specific to dividers but doesn't feel like there is a good way to get around it since we only can know
  // to filter the last separator in a collection only after performing a filter for the rest of the contents after it
  // Its gross that it needs to live here, might be nice if somehow we could have this live in the separator code
  if (lastNode && lastNode.type === "separator") {
    const { prevKey } = lastNode;
    newCollection.removeNode(lastNode.key);

    if (isPresent(prevKey)) {
      lastNode = requireValue(
        newCollection.getItem(prevKey),
        "Expected the previous collection node"
      );
      lastNode.nextKey = null;
    } else {
      lastNode = null;
    }
  }

  return [firstNode?.key ?? null, lastNode?.key ?? null];
}
