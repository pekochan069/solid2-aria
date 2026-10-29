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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/TableCollection.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Collection, Node, Key } from "@solid2-aria/types-shared";

import {
  getFirstItem,
  getLastItem,
  getNodeChildren,
} from "../collections/get-child-nodes";
import { GridCollection, setColumnSpan } from "../grid/grid-collection";
import type { GridNode, IGridCollection } from "../grid/grid-collection";
import { getNodeProps } from "../utils/get-node-props";
import { requireValue } from "../utils/require-value";

export interface ITableCollection<T> extends IGridCollection<T> {
  filter?: (
    ...args: Parameters<NonNullable<Collection<GridNode<T>>["filter"]>>
  ) => ITableCollection<T>;
  // perhaps elaborate on this? maybe not clear enough, essentially returns the table header rows (e.g. in a tiered headers table, will return the nodes containing the top tier column, next tier, etc)
  /** A list of header row nodes in the table. */
  headerRows: GridNode<T>[];
  /** A list of column nodes in the table. */
  columns: GridNode<T>[];
  /**
   * A set of column keys that serve as the [row
   * header](https://www.w3.org/TR/wai-aria-1.1/#rowheader).
   */
  rowHeaderColumnKeys: Set<Key>;
  /** The node that makes up the header of the table. */
  head?: GridNode<T>;
  /** The node that makes up the body of the table. */
  body: GridNode<T>;
}

interface GridCollectionOptions {
  showSelectionCheckboxes?: boolean;
  showDragButtons?: boolean;
}

const ROW_HEADER_COLUMN_KEY = `row-header-column-${Math.random().toString(36).slice(2)}`;
let ROW_HEADER_COLUMN_KEY_DRAG = `row-header-column-${Math.random().toString(36).slice(2)}`;

while (ROW_HEADER_COLUMN_KEY === ROW_HEADER_COLUMN_KEY_DRAG) {
  ROW_HEADER_COLUMN_KEY_DRAG = `row-header-column-${Math.random().toString(36).slice(2)}`;
}

/** @private */
export function buildHeaderRows<T>(
  keyMap: Map<Key, GridNode<T>>,
  columnNodes: GridNode<T>[]
): GridNode<T>[] {
  const columns: (GridNode<T> | null)[][] = [];

  const seen = new Map<
    GridNode<T>,
    { column: (GridNode<T> | null)[]; index: number }
  >();

  for (const column of columnNodes) {
    let { parentKey } = column;
    const col: (GridNode<T> | null)[] = [column];

    while (parentKey !== null && parentKey !== undefined) {
      const parent: GridNode<T> | undefined = keyMap.get(parentKey);

      if (!parent) {
        break;
      }

      // If we've already seen this parent, than it is shared
      // with a previous column. If the current column is taller
      // than the previous column, than we need to shift the parent
      // in the previous column so it's level with the current column.
      const seenParent = seen.get(parent);

      if (seenParent) {
        setColumnSpan(parent, (parent.colSpan ?? 0) + 1);
        const { column: localColumn, index } = seenParent;

        if (index > col.length) {
          break;
        }

        for (let i = index; i < col.length; i += 1) {
          localColumn.splice(i, 0, null);
        }

        // Adjust shifted indices
        for (let i = col.length; i < localColumn.length; i += 1) {
          const shifted = localColumn[i];
          const shiftedEntry = shifted ? seen.get(shifted) : undefined;

          if (shiftedEntry) {
            shiftedEntry.index = i;
          }
        }
      } else {
        setColumnSpan(parent, 1);
        col.push(parent);
        seen.set(parent, { column: col, index: col.length - 1 });
      }

      ({ parentKey } = parent);
    }

    columns.push(col);
    column.index = columns.length - 1;
  }

  const maxLength = Math.max(0, ...columns.map((c) => c.length));

  const headerRows: GridNode<T>[][] = Array.from(
    { length: maxLength },
    () => []
  );

  // Convert columns into rows.
  let colIndex = 0;

  for (const column of columns) {
    let i = maxLength - 1;

    for (const item of column) {
      if (item) {
        // Fill the space up until the current column with a placeholder
        const row = requireValue(
          headerRows[i],
          "Missing header row for a column level."
        );

        const rowLength = row.reduce((p, c) => p + (c.colSpan ?? 1), 0);

        if (rowLength < colIndex) {
          const placeholder: GridNode<T> = {
            // oxlint-disable-next-line typescript/no-deprecated -- Node-backed collection construction must populate the upstream childNodes output contract.
            childNodes: [],
            colSpan: colIndex - rowLength,
            // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
            colspan: colIndex - rowLength,
            hasChildNodes: false,
            index: rowLength,
            key: `placeholder-${item.key}`,
            level: i,
            rendered: null,
            textValue: "",
            type: "placeholder",
            value: null,
          };

          const previous = row.at(-1);

          if (previous) {
            previous.nextKey = placeholder.key;
            placeholder.prevKey = previous.key;
          }

          row.push(placeholder);
        }

        const previous = row.at(-1);

        if (previous) {
          previous.nextKey = item.key;
          item.prevKey = previous.key;
        }

        item.level = i;
        item.colIndex = colIndex;
        row.push(item);
      }

      i -= 1;
    }

    colIndex += 1;
  }

  // Add placeholders at the end of each row that is shorter than the maximum
  let i = 0;

  for (const row of headerRows) {
    const rowLength = row.reduce((p, c) => p + (c.colSpan ?? 1), 0);

    if (rowLength < columnNodes.length) {
      const previous = requireValue(
        row.at(-1),
        "A header placeholder must follow a column."
      );

      const placeholder: GridNode<T> = {
        // oxlint-disable-next-line typescript/no-deprecated -- Node-backed collection construction must populate the upstream childNodes output contract.
        childNodes: [],
        colSpan: columnNodes.length - rowLength,
        // oxlint-disable-next-line typescript/no-deprecated -- Expose the legacy output alias for existing consumers; internal state uses its modern replacement.
        colspan: columnNodes.length - rowLength,
        hasChildNodes: false,
        index: rowLength,
        key: `placeholder-${previous.key}`,
        level: i,
        prevKey: previous.key,
        rendered: null,
        textValue: "",
        type: "placeholder",
        value: null,
      };

      row.push(placeholder);
    }

    i += 1;
  }

  return headerRows.map((childNodes, index) => {
    const row: GridNode<T> = {
      // oxlint-disable-next-line typescript/no-deprecated -- Node-backed collection construction must populate the upstream childNodes output contract.
      childNodes,
      hasChildNodes: true,
      index,
      key: `headerrow-${index}`,
      level: 0,
      rendered: null,
      textValue: "",
      type: "headerrow",
      value: null,
    };

    return row;
  });
}

export class TableCollection<T>
  extends GridCollection<T>
  implements ITableCollection<T>
{
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  body: GridNode<T>;
  _size = 0;
  constructor(
    nodes: Iterable<GridNode<T>>,
    prev?: ITableCollection<T> | null,
    opts?: GridCollectionOptions
  ) {
    const rowHeaderColumnKeys = new Set<Key>();
    let body: GridNode<T> | null = null;
    const columns: GridNode<T>[] = [];

    // Add cell for selection checkboxes if needed.
    if (opts?.showSelectionCheckboxes === true) {
      const rowHeaderColumn: GridNode<T> = {
        // oxlint-disable-next-line typescript/no-deprecated -- Node-backed collection construction must populate the upstream childNodes output contract.
        childNodes: [],
        hasChildNodes: false,
        index: opts?.showDragButtons === true ? 1 : 0,
        key: ROW_HEADER_COLUMN_KEY,
        level: 0,
        props: {
          isSelectionCell: true,
        },
        rendered: null,
        textValue: "",
        type: "column",
        value: null,
      };

      columns.unshift(rowHeaderColumn);
    }

    // Add cell for drag buttons if needed.
    if (opts?.showDragButtons === true) {
      const rowHeaderColumn: GridNode<T> = {
        // oxlint-disable-next-line typescript/no-deprecated -- Node-backed collection construction must populate the upstream childNodes output contract.
        childNodes: [],
        hasChildNodes: false,
        index: 0,
        key: ROW_HEADER_COLUMN_KEY_DRAG,
        level: 0,
        props: {
          isDragButtonCell: true,
        },
        rendered: null,
        textValue: "",
        type: "column",
        value: null,
      };

      columns.unshift(rowHeaderColumn);
    }

    const rows: GridNode<T>[] = [];
    const columnKeyMap = new Map<Key, GridNode<T>>();

    const visit = (node: GridNode<T>) => {
      switch (node.type) {
        case "body": {
          body = node;
          break;
        }

        case "column": {
          columnKeyMap.set(node.key, node);

          if (!node.hasChildNodes) {
            columns.push(node);

            if (getNodeProps(node).isRowHeader) {
              rowHeaderColumnKeys.add(node.key);
            }
          }

          break;
        }

        case "item": {
          rows.push(node);

          return;
          // do not go into childNodes
        }

        default: {
          break;
        }
      }

      for (const child of getNodeChildren(node)) {
        visit(child);
      }
    };

    for (const node of nodes) {
      visit(node);
    }

    const headerRows = buildHeaderRows(columnKeyMap, columns);

    for (const [i, row] of headerRows.entries()) {
      rows.splice(i, 0, row);
    }

    super({
      columnCount: columns.length,
      items: rows,
      visitNode: (node) => {
        node.column = columns[node.index];

        return node;
      },
    });
    this.columns = columns;
    this.rowHeaderColumnKeys = rowHeaderColumnKeys;
    this.body = requireValue(body, "Table collections require a body node.");
    this.headerRows = headerRows;
    this._size = [...getNodeChildren(this.body)].length;

    // Default row header column to the first one.
    if (this.rowHeaderColumnKeys.size === 0) {
      const col = this.columns.find(
        (column) =>
          !getNodeProps(column).isDragButtonCell &&
          !getNodeProps(column).isSelectionCell
      );

      if (col) {
        this.rowHeaderColumnKeys.add(col.key);
      }
    }
  }
  override *[Symbol.iterator](): IterableIterator<GridNode<T>> {
    yield* getNodeChildren(this.body);
  }
  override get size(): number {
    return this._size;
  }
  override getKeys(): IterableIterator<Key> {
    return this.keyMap.keys();
  }
  override getKeyBefore(key: Key): Key | null {
    const node = this.keyMap.get(key);

    return node?.prevKey ?? null;
  }
  override getKeyAfter(key: Key): Key | null {
    const node = this.keyMap.get(key);

    return node?.nextKey ?? null;
  }
  override getFirstKey(): Key | null {
    return getFirstItem(getNodeChildren(this.body))?.key ?? null;
  }
  override getLastKey(): Key | null {
    return getLastItem(getNodeChildren(this.body))?.key ?? null;
  }
  override getItem(key: Key): GridNode<T> | null {
    if (key === this.body.key) {
      return this.body;
    }

    return this.keyMap.get(key) ?? null;
  }
  override at(idx: number): GridNode<T> | null {
    const keys = [...this.getKeys()];
    const key = keys[idx];

    return key === undefined ? null : this.getItem(key);
  }
  override getChildren(key: Key): Iterable<GridNode<T>> {
    if (key === this.body.key) {
      return getNodeChildren(this.body);
    }

    const node = this.getItem(key);

    if (node?.type === "item") {
      return [...getNodeChildren(node)].filter((n) => n.type === "cell");
    }

    return super.getChildren(key);
  }
  getTextValue(key: Key): string {
    const row = this.getItem(key);

    if (!row) {
      return "";
    }

    // If the row has a textValue, use that.
    if (row.textValue) {
      return row.textValue;
    }

    // Otherwise combine the text of each of the row header columns.
    const { rowHeaderColumnKeys } = this;

    const text: string[] = [];

    for (const cell of getNodeChildren(row)) {
      const column = this.columns[cell.index];

      if (
        rowHeaderColumnKeys.has(
          requireValue(column, "Expected column to exist.").key
        ) &&
        cell.textValue
      ) {
        text.push(cell.textValue);
      }

      if (text.length === rowHeaderColumnKeys.size) {
        break;
      }
    }

    return text.join(" ");
  }
}

export function isTableCollection<T>(
  collection: Collection<Node<T>>
): collection is ITableCollection<T> {
  return (
    "columns" in collection &&
    Array.isArray(collection.columns) &&
    "headerRows" in collection &&
    Array.isArray(collection.headerRows) &&
    "rows" in collection &&
    Array.isArray(collection.rows) &&
    "columnCount" in collection &&
    typeof collection.columnCount === "number" &&
    "rowHeaderColumnKeys" in collection &&
    collection.rowHeaderColumnKeys instanceof Set &&
    "body" in collection &&
    typeof collection.body === "object" &&
    collection.body !== null
  );
}
