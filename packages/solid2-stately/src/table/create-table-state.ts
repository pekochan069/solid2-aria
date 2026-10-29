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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/useTableState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Expandable,
  Key,
  MultipleSelection,
  Node,
  SelectionMode,
  Sortable,
  SortDescriptor,
  SortDirection,
} from "@solid2-aria/types-shared";
import type { Element as SolidElement } from "solid-js";
import { createMemo, createSignal, merge, untrack } from "solid-js";

import { createCollection } from "../collections/create-collection";
import { createGridState } from "../grid/create-grid-state";
import type { GridState } from "../grid/create-grid-state";
import type { MultipleSelectionStateProps } from "../selection/create-multiple-selection-state";
import type { MultipleSelectionState } from "../selection/types";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { requireValue } from "../utils/require-value";
import { TableCollection } from "./table-collection";
import type { ITableCollection } from "./table-collection";

export interface TableProps<_T>
  extends MultipleSelection, Sortable, Expandable {
  /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
  children: [SolidElement, SolidElement];
  /** A list of row keys to disable. */
  disabledKeys?: Iterable<Key>;
  /**
   * Whether pressing the escape key should clear selection in the table or not.
   *
   * Most experiences should not modify this option as it eliminates a keyboard user's ability to
   * easily clear selection. Only use if the escape key is being handled externally or should not
   * trigger selection clearing contextually.
   *
   * @default 'clearSelection'
   */
  escapeKeyBehavior?: "clearSelection" | "none";
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;
  /** The id of the column that displays hierarchical data. */
  treeColumn?: Key;
  /**
   * Whether keyboard navigation to focusable elements within the cells is
   * via the left/right arrow keys or the tab key.
   *
   * @default 'arrow'
   */
  keyboardNavigationBehavior?: "arrow" | "tab";
}

export interface TableState<T> extends GridState<T, ITableCollection<T>> {
  /** A collection of rows and columns in the table. */
  collection: ITableCollection<T>;
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes: boolean;
  /** The current sorted column and direction. */
  sortDescriptor: SortDescriptor | null;
  /** Calls the provided onSortChange handler with the provided column key and sort direction. */
  sort: (columnKey: Key, direction?: "ascending" | "descending") => void;
  /**
   * Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a
   * component within a cell.
   */
  isKeyboardNavigationDisabled: boolean;
  /**
   * Set whether keyboard navigation is disabled, such as when the arrow keys should be handled by a
   * component within a cell.
   */
  setKeyboardNavigationDisabled: (val: boolean) => void;
  /** A set of keys for items that are expanded. */
  expandedKeys: Set<Key>;
  /** Toggles the expanded state for a row by its key. */
  toggleKey: (key: Key) => void;
  /** The id of the column that displays hierarchical data. */
  treeColumn: Key | null;
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean;
  showDragButtons: boolean;
  selectionMode: SelectionMode;
  columns: Node<T>[];
}

export interface TableStateProps<T>
  extends MultipleSelectionStateProps, Expandable, Sortable {
  /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
  children?: [SolidElement, SolidElement];
  /** A pre-constructed collection to use instead of building one from items and children. */
  collection?: ITableCollection<T>;
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes?: boolean;
  /**
   * Whether the row drag button should be displayed.
   *
   * @private
   */
  showDragButtons?: boolean;
  /**
   * Do not use unless you know what you're doing.
   * @private
   */
  UNSAFE_selectionState?: MultipleSelectionState;
  /** The id of the column that displays hierarchical data. */
  treeColumn?: Key;
}

const OPPOSITE_SORT_DIRECTION: Record<SortDirection, SortDirection> = {
  get ascending(): SortDirection {
    return "descending";
  },
  get descending(): SortDirection {
    return "ascending";
  },
};

/**
 * Provides state management for a table component. Handles building a collection of columns and
 * rows from props. In addition, it tracks row selection and manages sort order changes.
 */
export function createTableState<T extends object>(
  props: TableStateProps<T>
): TableState<T> {
  const [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] =
    createSignal(false, { ownedWrite: true });

  const context = createMemo<CollectionBuilderContext<T>>(() => {
    const _children = props.children;

    return {
      columns: [],
      selectionMode: props.selectionMode ?? "none",
      showDragButtons: props.showDragButtons === true,
      showSelectionCheckboxes:
        props.showSelectionCheckboxes === true &&
        (props.selectionMode ?? "none") !== "none",
    };
  });

  const collection = createCollection<T, ITableCollection<T>>(
    props,
    (nodes) => new TableCollection(nodes, null, context()),
    context
  );

  const gridState = createGridState(
    merge(props, {
      get collection() {
        return collection();
      },
      get disabledBehavior() {
        return props.disabledBehavior ?? "selection";
      },
    })
  );

  const [expandedKeys, setExpandedKeys] = createControlledSignal(
    () => (props.expandedKeys ? new Set(props.expandedKeys) : undefined),
    untrack(() =>
      props.defaultExpandedKeys
        ? new Set(props.defaultExpandedKeys)
        : new Set<Key>()
    ),
    (keys) => {
      props.onExpandedChange?.(keys);
    }
  );

  return {
    get collection() {
      return collection();
    },
    get disabledKeys() {
      return gridState.disabledKeys;
    },
    get expandedKeys() {
      return expandedKeys();
    },
    get isKeyboardNavigationDisabled() {
      return collection().size === 0 || isKeyboardNavigationDisabled();
    },
    get selectionManager() {
      return gridState.selectionManager;
    },
    get setKeyboardNavigationDisabled() {
      return setKeyboardNavigationDisabled;
    },
    get showSelectionCheckboxes() {
      return props.showSelectionCheckboxes === true || false;
    },
    sort(columnKey: Key, direction?: "ascending" | "descending") {
      const current = props.sortDescriptor;

      const nextDirection =
        direction ??
        (current?.column === columnKey
          ? OPPOSITE_SORT_DIRECTION[current.direction]
          : "ascending");

      props.onSortChange?.({ column: columnKey, direction: nextDirection });
    },
    get sortDescriptor() {
      return props.sortDescriptor ?? null;
    },
    toggleKey(key) {
      setExpandedKeys((keys) => {
        const newKeys = new Set(keys);

        if (newKeys.has(key)) {
          newKeys.delete(key);
        } else {
          newKeys.add(key);
        }

        return newKeys;
      });
    },
    get treeColumn() {
      return props.treeColumn ?? null;
    },
  };
}

/**
 * Filters a collection using the provided filter function and returns a new TableState.
 */
export function UNSTABLE_createFilteredTableState<T extends object>(
  state: TableState<T>,
  filterFn: ((nodeValue: string, node: Node<T>) => boolean) | null | undefined
): TableState<T> {
  const collection = createMemo(() =>
    filterFn
      ? requireValue(
          state.collection.filter,
          "Expected state.collection.filter to exist."
        )(filterFn)
      : state.collection
  );

  const selectionManager = createMemo(() =>
    state.selectionManager.withCollection(collection())
  );

  // handle focus key reset? That logic is in createGridState
  return merge(state, {
    get collection() {
      return collection();
    },
    get selectionManager() {
      return selectionManager();
    },
  });
}
