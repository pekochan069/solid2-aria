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
 * Derived from Adobe React Spectrum: packages/react-aria/src/grid/GridKeyboardDelegate.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  getChildNodes,
  getFirstItem,
  getLastItem,
  getNthItem,
} from "@solid2-aria/stately/collections/get-child-nodes";
import type {
  IGridCollection as GridCollection,
  GridNode,
} from "@solid2-aria/stately/grid/grid-collection";
import type {
  Direction,
  DisabledBehavior,
  Key,
  KeyboardDelegate,
  LayoutDelegate,
  Node,
  Rect,
  Size,
} from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";

import { DOMLayoutDelegate } from "../selection/dom-layout-delegate";
import { getCollectionNodeProps } from "../utils/get-collection-node-props";
import { isPresent } from "../utils/is-present";
import { getLegacyOption } from "../utils/legacy-option";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";

export interface GridKeyboardDelegateOptions<C> {
  collection: C;
  disabledKeys: Set<Key>;
  disabledBehavior?: DisabledBehavior;
  ref?: Accessor<HTMLElement | null>;
  direction: Direction;
  collator?: Intl.Collator;
  layoutDelegate?: LayoutDelegate;
  /** @deprecated - Use layoutDelegate instead. */
  layout?: DeprecatedLayout;
  focusMode?: "row" | "cell";
}

export class GridKeyboardDelegate<
  T,
  C extends GridCollection<T>,
> implements KeyboardDelegate {
  collection: C;
  protected disabledKeys: Set<Key>;
  protected disabledBehavior: DisabledBehavior;
  protected direction: Direction;
  protected collator: Intl.Collator | undefined;
  protected layoutDelegate: LayoutDelegate;
  protected focusMode: "row" | "cell";
  constructor(options: GridKeyboardDelegateOptions<C>) {
    this.collection = options.collection;
    this.disabledKeys = options.disabledKeys;
    this.disabledBehavior = getTruthyValue(options.disabledBehavior) ?? "all";
    this.direction = options.direction;
    this.collator = options.collator;

    const legacyLayout = getLegacyOption(options, "layout");

    if (!legacyLayout && !options.ref) {
      throw new Error("Either a layout or a ref must be specified.");
    }

    this.layoutDelegate =
      getTruthyValue(options.layoutDelegate) ??
      (legacyLayout
        ? new DeprecatedLayoutDelegate(legacyLayout)
        : new DOMLayoutDelegate(
            requireValue(options.ref, "Expected options.ref")
          ));
    this.focusMode = options.focusMode ?? "row";
  }
  // oxlint-disable-next-line eslint/class-methods-use-this -- Subclasses override this instance hook to recognize their own cell nodes.
  protected isCell(node: Node<T>): boolean {
    return node.type === "cell";
  }
  // oxlint-disable-next-line eslint/class-methods-use-this -- Subclasses override this instance hook to recognize their own row nodes.
  protected isRow(node: Node<T>): boolean {
    return node.type === "row" || node.type === "item";
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
  protected findPreviousKey(
    fromKey?: Key,
    pred?: (item: Node<T>) => boolean,
    includeDisabled = false
  ): Key | null {
    let key = isPresent(fromKey)
      ? this.collection.getKeyBefore(fromKey)
      : this.collection.getLastKey();

    while (isPresent(key)) {
      const item = this.collection.getItem(key);

      if (!item) {
        return null;
      }

      if (
        (includeDisabled || !isTruthy(this.isDisabled(item))) &&
        (!pred || pred(item))
      ) {
        return key;
      }

      key = this.collection.getKeyBefore(key);
    }

    return null;
  }
  protected findNextKey(
    fromKey?: Key,
    pred?: (item: Node<T>) => boolean,
    includeDisabled = false
  ): Key | null {
    let key = isPresent(fromKey)
      ? this.collection.getKeyAfter(fromKey)
      : this.collection.getFirstKey();

    while (isPresent(key)) {
      const item = this.collection.getItem(key);

      if (!item) {
        return null;
      }

      if (
        (includeDisabled || !isTruthy(this.isDisabled(item))) &&
        (!pred || pred(item))
      ) {
        return key;
      }

      key = this.collection.getKeyAfter(key);

      if (!isPresent(key)) {
        return null;
      }
    }

    return null;
  }
  protected getKeyForItemInRowByIndex(key: Key, index = 0): Key | null {
    if (index < 0) {
      return null;
    }

    const item = this.collection.getItem(key);

    if (!item) {
      return null;
    }

    let i = 0;

    const rowChildren: Iterable<GridNode<T>> = getChildNodes(
      item,
      this.collection
    );

    for (const child of rowChildren) {
      if (isTruthy(child.colSpan) && child.colSpan + i > index) {
        return child.key ?? null;
      }

      if (isTruthy(child.colSpan)) {
        i = i + child.colSpan - 1;
      }

      if (i === index) {
        return child.key ?? null;
      }

      i += 1;
    }

    return null;
  }
  getKeyBelow(
    fromKey: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    let key: Key | null = fromKey;
    const startItem = this.collection.getItem(key);

    if (!startItem) {
      return null;
    }

    // If focus was on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey ?? null;
    }

    if (!isPresent(key)) {
      return null;
    }

    // Find the next item
    key = this.findNextKey(
      key,
      (item) => item.type === "item",
      options?.includeDisabled
    );

    if (isPresent(key)) {
      // If focus was on a cell, focus the cell with the same index in the next row.
      if (this.isCell(startItem)) {
        const startIndex = isTruthy(startItem.colIndex)
          ? startItem.colIndex
          : startItem.index;

        return this.getKeyForItemInRowByIndex(key, startIndex);
      }

      // Otherwise, focus the next row
      if (this.focusMode === "row") {
        return key;
      }
    }

    return null;
  }
  getKeyAbove(
    fromKey: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    let key: Key | null = fromKey;
    const startItem = this.collection.getItem(key);

    if (!startItem) {
      return null;
    }

    // If focus is on a cell, start searching from the parent row
    if (this.isCell(startItem)) {
      key = startItem.parentKey ?? null;
    }

    if (!isPresent(key)) {
      return null;
    }

    // Find the previous item
    key = this.findPreviousKey(
      key,
      (item) => item.type === "item",
      options?.includeDisabled
    );

    if (isPresent(key)) {
      // If focus was on a cell, focus the cell with the same index in the previous row.
      if (this.isCell(startItem)) {
        const startIndex = isTruthy(startItem.colIndex)
          ? startItem.colIndex
          : startItem.index;

        return this.getKeyForItemInRowByIndex(key, startIndex);
      }

      // Otherwise, focus the previous row
      if (this.focusMode === "row") {
        return key;
      }
    }

    return null;
  }
  getKeyRightOf(key: Key): Key | null {
    const item = this.collection.getItem(key);

    if (!item) {
      return null;
    }

    // If focus is on a row, focus the first child cell.
    if (this.isRow(item)) {
      const children = getChildNodes(item, this.collection);

      return (
        (this.direction === "rtl"
          ? getLastItem(children)?.key
          : getFirstItem(children)?.key) ?? null
      );
    }

    // If focus is on a cell, focus the next cell if any,
    // otherwise focus the parent row.
    if (
      this.isCell(item) &&
      item.parentKey !== null &&
      item.parentKey !== undefined
    ) {
      const parent = this.collection.getItem(item.parentKey);

      if (!parent) {
        return null;
      }

      const children = getChildNodes(parent, this.collection);

      const next =
        (this.direction === "rtl"
          ? getNthItem(children, item.index - 1)
          : getNthItem(children, item.index + 1)) ?? null;

      if (next) {
        return next.key ?? null;
      }

      // focus row only if focusMode is set to row
      if (this.focusMode === "row") {
        return item.parentKey ?? null;
      }

      return (
        (this.direction === "rtl"
          ? this.getFirstKey(key)
          : this.getLastKey(key)) ?? null
      );
    }

    return null;
  }
  getKeyLeftOf(key: Key): Key | null {
    const item = this.collection.getItem(key);

    if (!item) {
      return null;
    }

    // If focus is on a row, focus the last child cell.
    if (this.isRow(item)) {
      const children = getChildNodes(item, this.collection);

      return (
        (this.direction === "rtl"
          ? getFirstItem(children)?.key
          : getLastItem(children)?.key) ?? null
      );
    }

    // If focus is on a cell, focus the previous cell if any,
    // otherwise focus the parent row.
    if (
      this.isCell(item) &&
      item.parentKey !== null &&
      item.parentKey !== undefined
    ) {
      const parent = this.collection.getItem(item.parentKey);

      if (!parent) {
        return null;
      }

      const children = getChildNodes(parent, this.collection);

      const prev =
        (this.direction === "rtl"
          ? getNthItem(children, item.index + 1)
          : getNthItem(children, item.index - 1)) ?? null;

      if (prev) {
        return prev.key ?? null;
      }

      // focus row only if focusMode is set to row
      if (this.focusMode === "row") {
        return item.parentKey ?? null;
      }

      return (
        (this.direction === "rtl"
          ? this.getLastKey(key)
          : this.getFirstKey(key)) ?? null
      );
    }

    return null;
  }
  getFirstKey(fromKey?: Key, global?: boolean): Key | null {
    let key: Key | null = fromKey ?? null;
    let item: Node<T> | undefined | null;

    if (isPresent(key)) {
      item = this.collection.getItem(key);

      if (!item) {
        return null;
      }

      // If global flag is not set, and a cell is currently focused,
      // move focus to the first cell in the parent row.
      if (
        this.isCell(item) &&
        !isTruthy(global) &&
        item.parentKey !== null &&
        item.parentKey !== undefined
      ) {
        const parent = this.collection.getItem(item.parentKey);

        if (!parent) {
          return null;
        }

        return (
          getFirstItem(getChildNodes(parent, this.collection))?.key ?? null
        );
      }
    }

    // Find the first row
    key = this.findNextKey(undefined, (itemValue) => itemValue.type === "item");

    // If global flag is set (or if focus mode is cell), focus the first cell in the first row.
    if (
      isPresent(key) &&
      ((item && this.isCell(item) && isTruthy(global)) ||
        this.focusMode === "cell")
    ) {
      const itemValue2 = this.collection.getItem(key);

      if (!itemValue2) {
        return null;
      }

      key =
        getFirstItem(getChildNodes(itemValue2, this.collection))?.key ?? null;
    }

    // Otherwise, focus the row itself.
    return key;
  }
  getLastKey(fromKey?: Key, global?: boolean): Key | null {
    let key: Key | null = fromKey ?? null;
    let item: Node<T> | undefined | null;

    if (isPresent(key)) {
      item = this.collection.getItem(key);

      if (!item) {
        return null;
      }

      // If global flag is not set, and a cell is currently focused,
      // move focus to the last cell in the parent row.
      if (
        this.isCell(item) &&
        !isTruthy(global) &&
        item.parentKey !== null &&
        item.parentKey !== undefined
      ) {
        const parent = this.collection.getItem(item.parentKey);

        if (!parent) {
          return null;
        }

        const children = getChildNodes(parent, this.collection);

        return getLastItem(children)?.key ?? null;
      }
    }

    // Find the last row
    key = this.findPreviousKey(
      undefined,
      (itemValue3) => itemValue3.type === "item"
    );

    // If global flag is set (or if focus mode is cell), focus the last cell in the last row.
    if (
      isPresent(key) &&
      ((item && this.isCell(item) && isTruthy(global)) ||
        this.focusMode === "cell")
    ) {
      const itemValue4 = this.collection.getItem(key);

      if (!itemValue4) {
        return null;
      }

      const children = getChildNodes(itemValue4, this.collection);
      key = getLastItem(children)?.key ?? null;
    }

    // Otherwise, focus the row itself.
    return key;
  }
  getKeyPageAbove(fromKey: Key): Key | null {
    let key: Key | null = fromKey;
    let itemRect = this.layoutDelegate.getItemRect(key);

    if (!itemRect) {
      return null;
    }

    const pageY = Math.max(
      0,
      itemRect.y + itemRect.height - this.layoutDelegate.getVisibleRect().height
    );

    while (
      itemRect &&
      itemRect.y > pageY &&
      key !== null &&
      key !== undefined
    ) {
      key = this.getKeyAbove(key) ?? null;

      if (!isPresent(key)) {
        break;
      }

      itemRect = this.layoutDelegate.getItemRect(key);
    }

    return key;
  }
  getKeyPageBelow(fromKey: Key): Key | null {
    let key: Key | null = fromKey;
    let itemRect = this.layoutDelegate.getItemRect(key);

    if (!itemRect) {
      return null;
    }

    const pageHeight = this.layoutDelegate.getVisibleRect().height;

    const pageY = Math.min(
      this.layoutDelegate.getContentSize().height,
      itemRect.y + pageHeight
    );

    while (itemRect && itemRect.y + itemRect.height < pageY) {
      const nextKey = this.getKeyBelow(key);

      // If nextKey is undefined, we've reached the last row already
      if (!isPresent(nextKey)) {
        break;
      }

      itemRect = this.layoutDelegate.getItemRect(nextKey);
      key = nextKey;
    }

    return key;
  }
  getKeyForSearch(search: string, fromKey?: Key): Key | null {
    let key: Key | null = fromKey ?? null;

    if (!this.collator) {
      return null;
    }

    const { collection } = this;
    key = fromKey ?? this.getFirstKey();

    if (!isPresent(key)) {
      return null;
    }

    // If the starting key is a cell, search from its parent row.
    const startItem = collection.getItem(key);

    if (!startItem) {
      return null;
    }

    if (startItem.type === "cell") {
      key = startItem.parentKey ?? null;
    }

    let hasWrapped = false;

    while (isPresent(key)) {
      const item = collection.getItem(key);

      if (!item) {
        return null;
      }

      // check row text value for match
      if (item.textValue) {
        const substring = item.textValue.slice(0, search.length);

        if (this.collator.compare(substring, search) === 0) {
          if (this.isRow(item) && this.focusMode === "cell") {
            return (
              getFirstItem(getChildNodes(item, this.collection))?.key ?? null
            );
          }

          return item.key;
        }
      }

      key = this.findNextKey(key, (itemValue5) => itemValue5.type === "item");

      // Wrap around when reaching the end of the collection
      if (!isPresent(key) && !hasWrapped) {
        key = this.getFirstKey();
        hasWrapped = true;
      }
    }

    return null;
  }
}

/* Backward compatibility for old Virtualizer Layout interface. */
interface DeprecatedLayout {
  getLayoutInfo: (key: Key) => DeprecatedLayoutInfo;
  getContentSize: () => Size;
  virtualizer: DeprecatedVirtualizer;
}

interface DeprecatedLayoutInfo {
  rect: Rect;
}

interface DeprecatedVirtualizer {
  visibleRect: Rect;
}

class DeprecatedLayoutDelegate implements LayoutDelegate {
  layout: DeprecatedLayout;
  constructor(layout: DeprecatedLayout) {
    this.layout = layout;
  }
  getContentSize(): Size {
    return this.layout.getContentSize();
  }
  getItemRect(key: Key): Rect | null {
    return getTruthyValue(this.layout.getLayoutInfo(key)?.rect) ?? null;
  }
  getVisibleRect(): Rect {
    return this.layout.virtualizer.visibleRect;
  }
}
