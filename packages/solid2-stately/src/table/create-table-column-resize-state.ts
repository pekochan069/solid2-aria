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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/useTableColumnResizeState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import {
  createMemo,
  createSignal,
  createRenderEffect,
  untrack,
} from "solid-js";

import type { GridNode } from "../grid/grid-collection";
import { requireValue } from "../utils/require-value";
import type { ColumnSize } from "./column";
import type { TableState } from "./create-table-state";
import { TableColumnLayout } from "./table-column-layout";

export interface TableColumnResizeStateProps<T> {
  /**
   * Current width of the table or table viewport that the columns
   * should be calculated against.
   */
  tableWidth: number;
  /** A function that is called to find the default width for a given column. */
  getDefaultWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
  /** A function that is called to find the default minWidth for a given column. */
  getDefaultMinWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
}

export interface TableColumnResizeState<T> {
  /**
   * Called to update the state that a resize event has occurred.
   * Returns the new widths for all columns based on the resized column.
   */
  updateResizedColumns: (key: Key, width: number) => Map<Key, ColumnSize>;
  /** Callback for when onColumnResize has started. */
  startResize: (key: Key) => void;
  /** Callback for when onColumnResize has ended. */
  endResize: () => void;
  /** Gets the current width for the specified column. */
  getColumnWidth: (key: Key) => number;
  /** Gets the current minWidth for the specified column. */
  getColumnMinWidth: (key: Key) => number;
  /** Gets the current maxWidth for the specified column. */
  getColumnMaxWidth: (key: Key) => number;
  /** Key of the currently resizing column. */
  resizingColumn: Key | null;
  /** A reference to the table state. */
  tableState: TableState<T>;
  /** A map of the current column widths. */
  columnWidths: Map<Key, number>;
}

/**
 * Provides column width state management for a table component with column resizing support.
 * Handles building a map of column widths calculated from the table's width and any provided column
 * width information from the collection. In addition, it tracks the currently resizing column and
 * provides callbacks for updating the widths upon resize operations.
 *
 * @param props - Props for the table.
 * @param state - State for the table, as returned by `createTableState`.
 */
export function createTableColumnResizeState<T>(
  props: TableColumnResizeStateProps<T>,
  state: TableState<T>
): TableColumnResizeState<T> {
  const [resizingColumn, setResizingColumn] = createSignal<Key | null>(null, {
    ownedWrite: true,
  });

  const columnLayout = createMemo(
    () =>
      new TableColumnLayout({
        get getDefaultMinWidth() {
          return props.getDefaultMinWidth;
        },
        get getDefaultWidth() {
          return props.getDefaultWidth;
        },
      })
  );

  const columnGroups = createMemo(() =>
    columnLayout().splitColumnsIntoControlledAndUncontrolled(
      state.collection.columns
    )
  );

  // uncontrolled column widths
  const [uncontrolledWidths, setUncontrolledWidths] = createSignal(
    untrack(() =>
      columnLayout().getInitialUncontrolledWidths(columnGroups()[1])
    ),
    { ownedWrite: true }
  );

  // Update uncontrolled widths if the columns changed.
  let lastColumns = untrack(() => state.collection.columns);

  createRenderEffect(
    () => {
      const { columns } = state.collection;

      const changed =
        columns.length !== lastColumns.length ||
        columns.some((column, i) => column.key !== lastColumns[i]?.key);

      return {
        columns,
        widths: changed
          ? columnLayout().getInitialUncontrolledWidths(columnGroups()[1])
          : undefined,
      };
    },
    ({ columns, widths }) => {
      if (widths) {
        setUncontrolledWidths(widths);
      }

      lastColumns = columns;
    }
  );

  // combine columns back into one map that maintains same order as the columns
  const colWidths = createMemo(() =>
    columnLayout().recombineColumns(
      state.collection.columns,
      uncontrolledWidths(),
      columnGroups()[1],
      columnGroups()[0]
    )
  );

  const startResize = (key: Key) => {
    setResizingColumn(key);
  };

  const updateResizedColumns = (
    key: Key,
    width: number
  ): Map<Key, ColumnSize> => {
    const newSizes = columnLayout().resizeColumnWidth(
      state.collection,
      uncontrolledWidths(),
      key,
      width
    );

    const map = new Map(
      [...columnGroups()[1]].map(([localKey]) => [
        localKey,
        requireValue(
          newSizes.get(localKey),
          "Resizing must produce a width for each column."
        ),
      ])
    );

    map.set(key, width);
    setUncontrolledWidths(map);

    return newSizes;
  };

  const endResize = () => {
    setResizingColumn(null);
  };

  const columnWidths = createMemo(() =>
    columnLayout().buildColumnWidths(
      props.tableWidth ?? 0,
      state.collection,
      colWidths()
    )
  );

  return {
    get columnWidths() {
      return columnWidths();
    },
    get endResize() {
      return endResize;
    },
    get getColumnMaxWidth() {
      return (key: Key) => columnLayout().getColumnMaxWidth(key);
    },
    get getColumnMinWidth() {
      return (key: Key) => columnLayout().getColumnMinWidth(key);
    },
    get getColumnWidth() {
      return (key: Key) => columnLayout().getColumnWidth(key);
    },
    get resizingColumn() {
      return resizingColumn();
    },
    get startResize() {
      return startResize;
    },
    get tableState() {
      return state;
    },
    get updateResizedColumns() {
      return updateResizedColumns;
    },
  };
}
