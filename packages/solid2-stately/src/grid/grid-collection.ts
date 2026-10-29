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
 * Derived from Adobe React Spectrum: packages/react-stately/src/grid/GridCollection.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Collection, Key, Node } from "@solid2-aria/types-shared";

import { getNodeChildren } from "../collections/get-child-nodes";
import { getNodeProps } from "../utils/get-node-props";

export interface IGridCollection<T> extends Collection<GridNode<T>> {
  /** The number of columns in the grid. */
  columnCount: number;
  /** A list of rows in the grid. */
  rows: GridNode<T>[];
}

export interface GridRow<T> extends Partial<GridNode<T>> {
  key?: Key;
  type: string;
  childNodes: Iterable<Node<T>>;
}

export interface GridNode<T> extends Node<T> {
  column?: GridNode<T>;
  /**
   * The number of columns spanned by this cell. Use `colSpan` instead.
   *
   * @deprecated
   */
  colspan?: number;
  /** The number of columns spanned by this cell. */
  colSpan?: number | null;
  /** The column index of this cell, accounting for any colSpans. */
  colIndex?: number | null;
  /** The index of this node within its parent, ignoring sibling nodes that aren't of the same type. */
  indexOfType?: number;
}

interface GridCollectionOptions<T> {
  columnCount: number;
  items: GridRow<T>[];
  visitNode?: (cell: GridNode<T>) => GridNode<T>;
}

export class GridCollection<T> implements IGridCollection<T> {
  keyMap = new Map<Key, GridNode<T>>();
  columnCount: number;
  rows: GridNode<T>[];
  constructor(opts: GridCollectionOptions<T>) {
    this.keyMap = new Map();
    this.columnCount = opts?.columnCount;
    this.rows = [];

    const remove = (node: GridNode<T>) => {
      this.keyMap.delete(node.key);

      for (const child of getNodeChildren(node)) {
        if (this.keyMap.get(child.key) === child) {
          remove(child);
        }
      }
    };

    const visit = (initialNode: GridNode<T>) => {
      let node = initialNode;

      // If the node is the same object as the previous node for the same key,
      // we can skip this node and its children. We always visit columns though,
      // because we depend on order to build the columns array.
      const prevNode = this.keyMap.get(node.key);

      if (opts.visitNode) {
        node = opts.visitNode(node);
      }

      this.keyMap.set(node.key, node);
      const childKeys = new Set();
      let last: GridNode<T> | null = null;
      let rowHasCellWithColSpan = false;

      if (node.type === "item") {
        for (const child of getNodeChildren(node)) {
          if (getNodeProps(child).colSpan !== undefined) {
            rowHasCellWithColSpan = true;
            break;
          }
        }
      }

      for (const childNode of getNodeChildren(node)) {
        const child: GridNode<T> = childNode;

        if (child.type === "cell" && rowHasCellWithColSpan) {
          const span: unknown = getNodeProps(child).colSpan;
          setColumnSpan(child, typeof span === "number" ? span : undefined);
          child.colIndex = last
            ? (last.colIndex ?? last.index) + (last.colSpan ?? 1)
            : child.index;
        }

        if (
          child.type === "cell" &&
          (child.parentKey === null || child.parentKey === undefined)
        ) {
          // if child is a cell parent key isn't already established by the collection, match child node to parent row
          child.parentKey = node.key;
        }

        childKeys.add(child.key);

        if (last) {
          last.nextKey = child.key;
          child.prevKey = last.key;
        } else {
          child.prevKey = null;
        }

        visit(child);
        last = child;
      }

      if (last) {
        last.nextKey = null;
      }

      // Remove deleted nodes and their children from the key map
      if (prevNode) {
        for (const child of getNodeChildren(prevNode)) {
          if (!childKeys.has(child.key)) {
            remove(child);
          }
        }
      }
    };

    let last: GridNode<T> | null = null;

    for (const [i, node] of opts.items.entries()) {
      const rowNode: GridNode<T> = {
        ...node,
        // oxlint-disable-next-line typescript/no-deprecated -- Node-backed collection construction must populate the upstream childNodes output contract.
        childNodes: [...getNodeChildren(node)],
        hasChildNodes: true,
        index: node.index ?? i,
        key: node.key ?? `row-${i}`,
        level: node.level ?? 0,
        rendered: node.rendered,
        textValue: node.textValue ?? "",
        type: node.type ?? "row",
        value: node.value ?? null,
      };

      if (last) {
        last.nextKey = rowNode.key;
        rowNode.prevKey = last.key;
      } else {
        rowNode.prevKey = null;
      }

      this.rows.push(rowNode);
      visit(rowNode);
      last = rowNode;
    }

    if (last) {
      last.nextKey = null;
    }
  }
  *[Symbol.iterator](): IterableIterator<GridNode<T>> {
    yield* this.rows;
  }
  get size(): number {
    return [...this.rows].length;
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
    return [...this.rows][0]?.key ?? null;
  }
  getLastKey(): Key | null {
    const rows = [...this.rows];

    return rows.at(-1)?.key ?? null;
  }
  getItem(key: Key): GridNode<T> | null {
    return this.keyMap.get(key) ?? null;
  }
  at(idx: number): GridNode<T> | null {
    const keys = [...this.getKeys()];
    const key = keys[idx];

    return key === undefined ? null : this.getItem(key);
  }
  getChildren(key: Key): Iterable<GridNode<T>> {
    const node = this.keyMap.get(key);

    return node ? getNodeChildren(node) : [];
  }
}

/** Keeps the upstream output alias synchronized for existing collection consumers. */
export function setColumnSpan<T>(
  node: GridNode<T>,
  value: number | null | undefined
): void {
  node.colSpan = value;
  // oxlint-disable-next-line typescript/no-deprecated -- Preserve the legacy output alias at this compatibility boundary only.
  node.colspan = value ?? undefined;
}
