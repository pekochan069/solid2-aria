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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/TableColumnLayout.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";

import type { GridNode } from "../grid/grid-collection";
import { getNodeProps } from "../utils/get-node-props";
import { requireValue } from "../utils/require-value";
import type { ColumnSize } from "./column";
import type { ITableCollection as TableCollection } from "./table-collection";
import { calculateColumnSizes, getMaxWidth, getMinWidth } from "./table-utils";

export interface TableColumnLayoutOptions<T> {
  getDefaultWidth?: (column: GridNode<T>) => ColumnSize | null | undefined;
  getDefaultMinWidth?: (column: GridNode<T>) => ColumnSize | null | undefined;
}

export class TableColumnLayout<T> {
  getDefaultWidth: (column: GridNode<T>) => ColumnSize | null | undefined;
  getDefaultMinWidth: (column: GridNode<T>) => ColumnSize | null | undefined;
  columnWidths = new Map<Key, number>();
  columnMinWidths = new Map<Key, number>();
  columnMaxWidths = new Map<Key, number>();
  constructor(options: TableColumnLayoutOptions<T>) {
    this.getDefaultWidth = options?.getDefaultWidth ?? (() => "1fr");
    this.getDefaultMinWidth = options?.getDefaultMinWidth ?? (() => 75);
  }
  /**
   * Takes an array of columns and splits it into 2 maps of columns with controlled and columns with
   * uncontrolled widths.
   */
  splitColumnsIntoControlledAndUncontrolled(
    columns: GridNode<T>[]
  ): [Map<Key, GridNode<T>>, Map<Key, GridNode<T>>] {
    const controlled = new Map<Key, GridNode<T>>();
    const uncontrolled = new Map<Key, GridNode<T>>();

    for (const column of columns) {
      const target =
        getNodeProps(column).width === undefined ? uncontrolled : controlled;

      target.set(column.key, column);
    }

    return [controlled, uncontrolled];
  }
  /** Takes uncontrolled and controlled widths and joins them into a single Map. */
  recombineColumns(
    columns: GridNode<T>[],
    uncontrolledWidths: Map<Key, ColumnSize>,
    uncontrolledColumns: Map<Key, GridNode<T>>,
    controlledColumns: Map<Key, GridNode<T>>
  ): Map<Key, ColumnSize> {
    return new Map(
      columns.map((col) => {
        if (uncontrolledColumns.has(col.key)) {
          return [
            col.key,
            requireValue(
              uncontrolledWidths.get(col.key),
              "Missing uncontrolled column width."
            ),
          ];
        }

        return [
          col.key,
          requireValue(
            getNodeProps(controlledColumns.get(col.key)).width,
            "Missing controlled column width."
          ),
        ];
      })
    );
  }
  /** Used to make an initial Map of the uncontrolled widths based on default widths. */
  getInitialUncontrolledWidths(
    uncontrolledColumns: Map<Key, GridNode<T>>
  ): Map<Key, ColumnSize> {
    return new Map(
      [...uncontrolledColumns].map(([key, col]) => [
        key,
        getNodeProps(col).defaultWidth ?? this.getDefaultWidth?.(col) ?? "1fr",
      ])
    );
  }
  getColumnWidth(key: Key): number {
    return this.columnWidths.get(key) ?? 0;
  }
  getColumnMinWidth(key: Key): number {
    return this.columnMinWidths.get(key) ?? 0;
  }
  getColumnMaxWidth(key: Key): number {
    return this.columnMaxWidths.get(key) ?? 0;
  }
  resizeColumnWidth(
    collection: TableCollection<T>,
    uncontrolledWidths: Map<Key, ColumnSize>,
    col: Key,
    initialWidth: number
  ): Map<Key, ColumnSize> {
    let width = initialWidth;

    const prevColumnWidths = this.columnWidths;
    let freeze = true;
    const newWidths = new Map<Key, ColumnSize>();
    width = Math.max(
      this.getColumnMinWidth(col),
      Math.min(this.getColumnMaxWidth(col), Math.floor(width))
    );

    for (const column of collection.columns) {
      if (column.key === col) {
        newWidths.set(column.key, width);
        freeze = false;
      } else if (freeze) {
        // freeze columns to the left to their previous pixel value
        newWidths.set(column.key, prevColumnWidths.get(column.key) ?? 0);
      } else {
        newWidths.set(
          column.key,
          requireValue(
            getNodeProps(column).width ?? uncontrolledWidths.get(column.key),
            "A column must have a controlled or uncontrolled width."
          )
        );
      }
    }

    return newWidths;
  }
  buildColumnWidths(
    tableWidth: number,
    collection: TableCollection<T>,
    widths: Map<Key, ColumnSize>
  ): Map<Key, number> {
    this.columnWidths = new Map();
    this.columnMinWidths = new Map();
    this.columnMaxWidths = new Map();

    // initial layout or table/window resizing
    const columnWidths = calculateColumnSizes(
      tableWidth,
      collection.columns.map((col) => ({ ...getNodeProps(col), key: col.key })),
      widths,
      (i) =>
        this.getDefaultWidth(
          requireValue(
            collection.columns[i],
            "Expected collection.columns[i] to exist."
          )
        ),
      (i) =>
        this.getDefaultMinWidth(
          requireValue(
            collection.columns[i],
            "Expected collection.columns[i] to exist."
          )
        )
    );

    // columns going in will be the same order as the columns coming out
    for (const [index, width] of columnWidths.entries()) {
      const column = requireValue(
        collection.columns[index],
        "Column widths must correspond to collection columns."
      );

      const { key } = column;
      this.columnWidths.set(key, width);
      this.columnMinWidths.set(
        key,
        getMinWidth(
          getNodeProps(column).minWidth ?? this.getDefaultMinWidth(column),
          tableWidth
        )
      );
      this.columnMaxWidths.set(
        key,
        getMaxWidth(getNodeProps(column).maxWidth, tableWidth)
      );
    }

    return this.columnWidths;
  }
}
