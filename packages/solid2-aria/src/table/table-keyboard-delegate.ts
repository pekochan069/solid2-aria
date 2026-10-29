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
 * Derived from Adobe React Spectrum: packages/react-aria/src/table/TableKeyboardDelegate.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import {
  getChildNodes,
  getFirstItem,
} from "@solid2-aria/stately/collections/get-child-nodes";
import type { ITableCollection } from "@solid2-aria/stately/table/table-collection";
import type { Key, Node } from "@solid2-aria/types-shared";

import { GridKeyboardDelegate } from "../grid/grid-keyboard-delegate";
import { isPresent } from "../utils/is-present";

export class TableKeyboardDelegate<T> extends GridKeyboardDelegate<
  T,
  ITableCollection<T>
> {
  protected override isCell(node: Node<T>): boolean {
    return (
      node.type === "cell" ||
      node.type === "rowheader" ||
      node.type === "column"
    );
  }
  override getKeyBelow(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    const startItem = this.collection.getItem(key);

    if (!startItem) {
      return null;
    }

    // If focus was on a column, then focus the first child column if any,
    // or find the corresponding cell in the first row.
    if (startItem.type === "column") {
      const child = getFirstItem(getChildNodes(startItem, this.collection));

      if (child) {
        return child.key;
      }

      const firstKey = this.getFirstKey();

      if (!isPresent(firstKey)) {
        return null;
      }

      const firstItem = this.collection.getItem(firstKey);

      if (!firstItem) {
        return null;
      }

      return super.getKeyForItemInRowByIndex(firstKey, startItem.index);
    }

    return super.getKeyBelow(key, options);
  }
  override getKeyAbove(
    key: Key,
    options?: {
      includeDisabled?: boolean;
    }
  ): Key | null {
    const startItem = this.collection.getItem(key);

    if (!startItem) {
      return null;
    }

    // If focus was on a column, focus the parent column if any
    if (startItem.type === "column") {
      const parent = isPresent(startItem.parentKey)
        ? this.collection.getItem(startItem.parentKey)
        : null;

      if (parent && parent.type === "column") {
        return parent.key;
      }

      return null;
    }

    // only return above row key if not header row
    const superKey = super.getKeyAbove(key, options);

    const superItem = isPresent(superKey)
      ? this.collection.getItem(superKey)
      : null;

    if (superItem && superItem.type !== "headerrow") {
      return superKey;
    }

    // If no item was found, and focus was on a cell, then focus the
    // corresponding column header.
    if (this.isCell(startItem)) {
      return this.collection.columns[startItem.index]?.key ?? null;
    }

    // If focus was on a row, then focus the first column header.
    return this.collection.columns[0]?.key ?? null;
  }
  private findNextColumnKey(column: Node<T>): Key | null {
    // Search following columns
    const key = this.findNextKey(column.key, (item) => item.type === "column");

    if (isPresent(key)) {
      return key;
    }

    // Wrap around to the first column
    const row = this.collection.headerRows[column.level];

    if (!row) {
      return null;
    }

    for (const item of getChildNodes(row, this.collection)) {
      if (item?.type === "column") {
        return item.key;
      }
    }

    return null;
  }
  private findPreviousColumnKey(column: Node<T>): Key | null {
    // Search previous columns
    const key = this.findPreviousKey(
      column.key,
      (item) => item.type === "column"
    );

    if (isPresent(key)) {
      return key;
    }

    // Wrap around to the last column
    const row = this.collection.headerRows[column.level];

    if (!row) {
      return null;
    }

    const childNodes = [...getChildNodes(row, this.collection)];

    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const item = childNodes[i];

      if (item?.type === "column") {
        return item.key;
      }
    }

    return null;
  }
  override getKeyRightOf(key: Key): Key | null {
    const item = this.collection.getItem(key);

    if (!item) {
      return null;
    }

    // If focus was on a column, then focus the next column
    if (item.type === "column") {
      return this.direction === "rtl"
        ? this.findPreviousColumnKey(item)
        : this.findNextColumnKey(item);
    }

    return super.getKeyRightOf(key);
  }
  override getKeyLeftOf(key: Key): Key | null {
    const item = this.collection.getItem(key);

    if (!item) {
      return null;
    }

    // If focus was on a column, then focus the previous column
    if (item.type === "column") {
      return this.direction === "rtl"
        ? this.findNextColumnKey(item)
        : this.findPreviousColumnKey(item);
    }

    return super.getKeyLeftOf(key);
  }
  private getMatchingRowHeader(item: Node<T>, search: string): Key | null {
    if (!this.collator) {
      return null;
    }

    for (const cell of getChildNodes(item, this.collection)) {
      const column = this.collection.columns[cell.index];

      if (
        column &&
        this.collection.rowHeaderColumnKeys.has(column.key) &&
        cell.textValue &&
        this.collator.compare(
          cell.textValue.slice(0, search.length),
          search
        ) === 0
      ) {
        return cell.key;
      }
    }

    return null;
  }
  override getKeyForSearch(search: string, fromKey?: Key): Key | null {
    if (!this.collator) {
      return null;
    }

    const { collection } = this;
    let key = fromKey ?? this.getFirstKey();

    if (!isPresent(key)) {
      return null;
    }

    // If the starting key is a cell, search from its parent row.
    const startItem = collection.getItem(key);

    if (startItem?.type === "cell") {
      key = startItem.parentKey ?? null;
    }

    let hasWrapped = false;

    while (isPresent(key)) {
      const item = collection.getItem(key);

      if (!item) {
        return null;
      }

      if (item.textValue) {
        const substring = item.textValue.slice(0, search.length);

        if (this.collator.compare(substring, search) === 0) {
          return item.key;
        }
      }

      const matchingCell = this.getMatchingRowHeader(item, search);

      if (isPresent(matchingCell)) {
        const fromItem = isPresent(fromKey)
          ? collection.getItem(fromKey)
          : startItem;

        return fromItem?.type === "cell" ? matchingCell : item.key;
      }

      key = this.getKeyBelow(key);

      // Wrap around when reaching the end of the collection
      if (!isPresent(key) && !hasWrapped) {
        key = this.getFirstKey();
        hasWrapped = true;
      }
    }

    return null;
  }
}
