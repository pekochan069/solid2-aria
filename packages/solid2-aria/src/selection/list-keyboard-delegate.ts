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
 * Derived from Adobe React Spectrum: packages/react-aria/src/selection/ListKeyboardDelegate.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  Direction,
  DisabledBehavior,
  Key,
  KeyboardDelegate,
  LayoutDelegate,
  Node,
  Orientation,
  Rect,
} from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";

import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { isScrollable } from "../utils/is-scrollable";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";
import { DOMLayoutDelegate } from "./dom-layout-delegate";
import { getItemElement } from "./utils";

interface KeyboardLayoutDelegate extends LayoutDelegate {
  getKeyRightOf?: (key: Key) => Key | null;
  getKeyLeftOf?: (key: Key) => Key | null;
}

interface ListKeyboardDelegateOptions<T> {
  collection: Collection<Node<T>>;
  ref: Accessor<HTMLElement | null>;
  collator?: Intl.Collator;
  layout?: "stack" | "grid";
  orientation?: Orientation;
  direction?: Direction;
  disabledKeys?: Set<Key>;
  disabledBehavior?: DisabledBehavior;
  layoutDelegate?: KeyboardLayoutDelegate;
}

export class ListKeyboardDelegate<T> implements KeyboardDelegate {
  private readonly collection: Collection<Node<T>>;
  private readonly disabledKeys: Set<Key>;
  private readonly disabledBehavior: DisabledBehavior;
  private readonly ref: Accessor<HTMLElement | null>;
  private readonly collator: Intl.Collator | undefined;
  private readonly layout: "stack" | "grid";
  private readonly orientation?: Orientation;
  private readonly direction?: Direction;
  private readonly layoutDelegate: KeyboardLayoutDelegate;
  constructor(
    collection: Collection<Node<T>>,
    disabledKeys: Set<Key>,
    ref: Accessor<HTMLElement | null>,
    collator?: Intl.Collator,
    expandedKeys?: Set<Key>
  );
  constructor(options: ListKeyboardDelegateOptions<T>);
  constructor(
    ...args:
      | [options: ListKeyboardDelegateOptions<T>]
      | [
          collection: Collection<Node<T>>,
          disabledKeys: Set<Key>,
          ref: Accessor<HTMLElement | null>,
          collator?: Intl.Collator,
          expandedKeys?: Set<Key>,
        ]
  ) {
    if (args.length === 1) {
      const [opts] = args;
      this.collection = opts.collection;
      this.ref = opts.ref;
      this.collator = opts.collator;
      this.disabledKeys = getTruthyValue(opts.disabledKeys) ?? new Set();
      this.disabledBehavior = getTruthyValue(opts.disabledBehavior) ?? "all";
      this.orientation = getTruthyValue(opts.orientation) ?? "vertical";
      this.direction = opts.direction;
      this.layout = getTruthyValue(opts.layout) ?? "stack";
      this.layoutDelegate =
        getTruthyValue(opts.layoutDelegate) ?? new DOMLayoutDelegate(opts.ref);
    } else {
      [this.collection, this.disabledKeys, this.ref, this.collator] = args;
      this.layout = "stack";
      this.orientation = "vertical";
      this.disabledBehavior = "all";
      this.layoutDelegate = new DOMLayoutDelegate(this.ref);
    }

    // If this is a vertical stack, remove the left/right methods completely
    // so they aren't called by useDroppableCollection.
    if (this.layout === "stack" && this.orientation === "vertical") {
      this.getKeyLeftOf = undefined;
      this.getKeyRightOf = undefined;
    }
  }
  private isDisabled(item: Node<unknown>) {
    return whenTruthy(
      whenTruthy(
        this.disabledBehavior === "all",
        () =>
          getTruthyValue(getCollectionNodeProps(item)?.isDisabled) ??
          this.disabledKeys.has(item.key)
      ),
      () => getCollectionNodeProps(item)?.disabledBehavior !== "selection"
    );
  }
  private findNextNonDisabled(
    key: Key | null,
    getNext: (key: Key) => Key | null,
    includeDisabled = false
  ): Key | null {
    let nextKey = key;

    while (isPresent(nextKey)) {
      const item = this.collection.getItem(nextKey);

      if (
        item?.type === "item" &&
        (includeDisabled || !isTruthy(this.isDisabled(item)))
      ) {
        return nextKey;
      }

      nextKey = getNext(nextKey);
    }

    return null;
  }
  getNextKey(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    let nextKey: Key | null = key;
    nextKey = this.collection.getKeyAfter(nextKey);

    return this.findNextNonDisabled(
      nextKey,
      (keyValue) => this.collection.getKeyAfter(keyValue),
      options?.includeDisabled
    );
  }
  getPreviousKey(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    let nextKey: Key | null = key;
    nextKey = this.collection.getKeyBefore(nextKey);

    return this.findNextNonDisabled(
      nextKey,
      (keyValue2) => this.collection.getKeyBefore(keyValue2),
      options?.includeDisabled
    );
  }
  private findKey(
    key: Key,
    nextKey: (key: Key) => Key | null,
    shouldSkip: (prevRect: Rect, itemRect: Rect) => boolean
  ) {
    let tempKey: Key | null = key;
    let itemRect = this.layoutDelegate.getItemRect(tempKey);

    if (!itemRect || tempKey === null || tempKey === undefined) {
      return null;
    }

    // Find the item above or below in the same column.
    const prevRect = itemRect;

    do {
      tempKey = nextKey(tempKey);

      if (!isPresent(tempKey)) {
        break;
      }

      itemRect = this.layoutDelegate.getItemRect(tempKey);
    } while (
      itemRect &&
      shouldSkip(prevRect, itemRect) &&
      tempKey !== null &&
      tempKey !== undefined
    );

    return tempKey;
  }
  private static isSameRow(prevRect: Rect, itemRect: Rect) {
    return prevRect.y === itemRect.y || prevRect.x !== itemRect.x;
  }
  private static isSameColumn(prevRect: Rect, itemRect: Rect) {
    return prevRect.x === itemRect.x || prevRect.y !== itemRect.y;
  }
  // checks to see if the next/prev key is spatially above/below the current key. If not, that means we are in
  // a reversed column layout and need to adjust appropriately
  // Follow-up: still need to see how this works with virtualizer once there is handling for the reverse layout
  // this felt like a simpler approach then changing getKeyAbove/Below to be purely spatial calculations
  private isReversed(key: Key): boolean {
    const nextKey = this.getNextKey(key);
    const currentEl = getItemElement(this.ref, key);

    if (isPresent(nextKey)) {
      const nextEl = getItemElement(this.ref, nextKey);

      if (!currentEl || !nextEl) {
        return false;
      }

      return (
        currentEl.getBoundingClientRect().top >
        nextEl.getBoundingClientRect().top
      );
    }

    const prevKey = this.getPreviousKey(key);

    if (isPresent(prevKey)) {
      const prevEl = getItemElement(this.ref, prevKey);

      if (!currentEl || !prevEl) {
        return false;
      }

      return (
        prevEl.getBoundingClientRect().top >
        currentEl.getBoundingClientRect().top
      );
    }

    return false;
  }
  getKeyBelow(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    if (this.layout === "grid" && this.orientation === "vertical") {
      return this.findKey(
        key,
        (keyValue3) => this.getNextKey(keyValue3, options),
        (prev, item) => ListKeyboardDelegate.isSameRow(prev, item)
      );
    } else if (this.orientation === "vertical") {
      return this.isReversed(key)
        ? this.getPreviousKey(key, options)
        : this.getNextKey(key, options);
    }

    return this.getNextKey(key, options);
  }
  getKeyAbove(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    if (this.layout === "grid" && this.orientation === "vertical") {
      return this.findKey(
        key,
        (keyValue4) => this.getPreviousKey(keyValue4, options),
        (prev, item) => ListKeyboardDelegate.isSameRow(prev, item)
      );
    } else if (this.orientation === "vertical") {
      return this.isReversed(key)
        ? this.getNextKey(key, options)
        : this.getPreviousKey(key, options);
    }

    return this.getPreviousKey(key, options);
  }
  private getNextColumn(
    key: Key,
    right: boolean,
    options?: {
      includeDisabled?: boolean;
    }
  ) {
    return right
      ? this.getPreviousKey(key, options)
      : this.getNextKey(key, options);
  }
  getKeyRightOf?(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    // This is a temporary solution for CardView until we refactor useSelectableCollection.
    // https://github.com/orgs/adobe/projects/19/views/32?pane=issue&itemId=77825042
    const layoutDelegateMethod: "getKeyRightOf" | "getKeyLeftOf" =
      this.direction === "ltr" ? "getKeyRightOf" : "getKeyLeftOf";

    const method = this.layoutDelegate[layoutDelegateMethod];

    if (method) {
      const nextKey = method.call(this.layoutDelegate, key);

      return isPresent(nextKey)
        ? this.findNextNonDisabled(
            nextKey,
            (keyValue5) => method.call(this.layoutDelegate, keyValue5),
            options?.includeDisabled
          )
        : null;
    }

    if (this.layout === "grid") {
      if (this.orientation === "vertical") {
        return this.getNextColumn(key, this.direction === "rtl", options);
      }

      return this.findKey(
        key,
        (keyValue6) =>
          this.getNextColumn(keyValue6, this.direction === "rtl", options),
        (prev, item) => ListKeyboardDelegate.isSameColumn(prev, item)
      );
    } else if (this.orientation === "horizontal") {
      return this.getNextColumn(key, this.direction === "rtl", options);
    }

    return null;
  }
  getKeyLeftOf?(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    const layoutDelegateMethod: "getKeyRightOf" | "getKeyLeftOf" =
      this.direction === "ltr" ? "getKeyLeftOf" : "getKeyRightOf";

    const method = this.layoutDelegate[layoutDelegateMethod];

    if (method) {
      const nextKey = method.call(this.layoutDelegate, key);

      return isPresent(nextKey)
        ? this.findNextNonDisabled(
            nextKey,
            (keyValue7) => method.call(this.layoutDelegate, keyValue7),
            options?.includeDisabled
          )
        : null;
    }

    if (this.layout === "grid") {
      if (this.orientation === "vertical") {
        return this.getNextColumn(key, this.direction === "ltr", options);
      }

      return this.findKey(
        key,
        (keyValue8) =>
          this.getNextColumn(keyValue8, this.direction === "ltr", options),
        (prev, item) => ListKeyboardDelegate.isSameColumn(prev, item)
      );
    } else if (this.orientation === "horizontal") {
      return this.getNextColumn(key, this.direction === "ltr", options);
    }

    return null;
  }
  getFirstKey(): Key | null {
    const key = this.collection.getFirstKey();

    return this.findNextNonDisabled(key, (keyValue9) =>
      this.collection.getKeyAfter(keyValue9)
    );
  }
  getLastKey(): Key | null {
    const key = this.collection.getLastKey();

    return this.findNextNonDisabled(key, (keyValue10) =>
      this.collection.getKeyBefore(keyValue10)
    );
  }
  getKeyPageAbove(key: Key): Key | null {
    const menu = this.ref();
    let itemRect = this.layoutDelegate.getItemRect(key);

    if (!itemRect) {
      return null;
    }

    const reversed = this.isReversed(key);

    if (menu && !isScrollable(menu)) {
      return this.getFirstKey();
    }

    let nextKey: Key | null = key;

    if (this.orientation === "horizontal") {
      const pageX = Math.max(
        0,
        itemRect.x + itemRect.width - this.layoutDelegate.getVisibleRect().width
      );

      while (
        itemRect &&
        itemRect.x > pageX &&
        nextKey !== null &&
        nextKey !== undefined
      ) {
        nextKey = this.getKeyAbove(nextKey);
        itemRect = isPresent(nextKey)
          ? this.layoutDelegate.getItemRect(nextKey)
          : null;
      }
    } else {
      const visibleRect = this.layoutDelegate.getVisibleRect();

      // column reverse makes y negative for items so we need to instead do current pos - height instead
      const pageY = reversed
        ? itemRect.y - visibleRect.height
        : Math.max(0, itemRect.y + itemRect.height - visibleRect.height);

      while (
        itemRect &&
        itemRect.y > pageY &&
        nextKey !== null &&
        nextKey !== undefined
      ) {
        nextKey = this.getKeyAbove(nextKey);
        itemRect = isPresent(nextKey)
          ? this.layoutDelegate.getItemRect(nextKey)
          : null;
      }
    }

    return nextKey ?? (reversed ? this.getLastKey() : this.getFirstKey());
  }
  getKeyPageBelow(key: Key): Key | null {
    const menu = this.ref();
    let itemRect = this.layoutDelegate.getItemRect(key);

    if (!itemRect) {
      return null;
    }

    const reversed = this.isReversed(key);

    if (menu && !isScrollable(menu)) {
      return this.getLastKey();
    }

    let nextKey: Key | null = key;

    if (this.orientation === "horizontal") {
      const pageX = Math.min(
        this.layoutDelegate.getContentSize().width,
        itemRect.x - itemRect.width + this.layoutDelegate.getVisibleRect().width
      );

      while (
        itemRect &&
        itemRect.x < pageX &&
        nextKey !== null &&
        nextKey !== undefined
      ) {
        nextKey = this.getKeyBelow(nextKey);
        itemRect = isPresent(nextKey)
          ? this.layoutDelegate.getItemRect(nextKey)
          : null;
      }
    } else {
      const pageY = Math.min(
        this.layoutDelegate.getContentSize().height,
        itemRect.y -
          itemRect.height +
          this.layoutDelegate.getVisibleRect().height
      );

      while (
        itemRect &&
        itemRect.y < pageY &&
        nextKey !== null &&
        nextKey !== undefined
      ) {
        nextKey = this.getKeyBelow(nextKey);
        itemRect = isPresent(nextKey)
          ? this.layoutDelegate.getItemRect(nextKey)
          : null;
      }
    }

    return nextKey ?? (reversed ? this.getFirstKey() : this.getLastKey());
  }
  getKeyForSearch(search: string, fromKey?: Key): Key | null {
    if (!this.collator) {
      return null;
    }

    const { collection } = this;
    let key = getTruthyValue(fromKey) ?? this.getFirstKey();

    while (isPresent(key)) {
      const item = collection.getItem(key);

      if (!item) {
        return null;
      }

      const substring = item.textValue.slice(0, search.length);

      if (item.textValue && this.collator.compare(substring, search) === 0) {
        return key;
      }

      key = this.getNextKey(key);
    }

    return null;
  }
}
