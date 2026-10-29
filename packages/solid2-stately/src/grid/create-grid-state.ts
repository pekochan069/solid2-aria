/*
 * Derived from Adobe React Spectrum: packages/react-stately/src/grid/useGridState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import { createMemo, createRenderEffect, untrack } from "solid-js";

import {
  getChildNodes,
  getFirstItem,
  getLastItem,
} from "../collections/get-child-nodes";
import { createMultipleSelectionState } from "../selection/create-multiple-selection-state";
import type { MultipleSelectionStateProps } from "../selection/create-multiple-selection-state";
import { SelectionManager } from "../selection/selection-manager";
import type { MultipleSelectionState } from "../selection/types";
import { requireValue } from "../utils/require-value";
import type { GridNode, IGridCollection } from "./grid-collection";

export interface GridState<T, C extends IGridCollection<T>> {
  collection: C;
  /** A set of keys for rows that are disabled. */
  disabledKeys: Set<Key>;
  /** A selection manager to read and update row selection state. */
  selectionManager: SelectionManager;
  /**
   * Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a
   * component within a cell.
   */
  isKeyboardNavigationDisabled: boolean;
}

export interface GridStateOptions<
  T,
  C extends IGridCollection<T>,
> extends MultipleSelectionStateProps {
  collection: C;
  disabledKeys?: Iterable<Key>;
  focusMode?: "row" | "cell";
  /**
   * Do not use unless you know what you're doing.
   * @private
   */
  UNSAFE_selectionState?: MultipleSelectionState;
}

/**
 * Provides state management for a grid component. Handles row selection and focusing a grid cell's
 * focusable child if applicable.
 */
export function createGridState<T extends object, C extends IGridCollection<T>>(
  props: GridStateOptions<T, C>
): GridState<T, C> {
  const selectionState =
    untrack(() => props.UNSAFE_selectionState) ??
    createMultipleSelectionState(props);

  const disabledKeys = createMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  const { setFocusedKey } = selectionState;
  // oxlint-disable-next-line solid/reactivity -- The returned callback runs in its consumer's scope.
  selectionState.setFocusedKey = (initialKey, child) => {
    let key = initialKey;

    // If focusMode is cell and an item is focused, focus a child cell instead.
    if (props.focusMode === "cell" && key !== null && key !== undefined) {
      const item = props.collection.getItem(key);

      if (item?.type === "item") {
        const children = getChildNodes(item, props.collection);

        key =
          child === "last"
            ? (getLastItem(children)?.key ?? null)
            : (getFirstItem(children)?.key ?? null);
      }
    }

    setFocusedKey(key, child);
  };

  const selectionManager = createMemo(
    () => new SelectionManager(props.collection, selectionState)
  );

  // Reset focused key if that item is deleted from the collection.
  let cachedCollection: C | null = null;

  createRenderEffect(
    () => {
      const { collection } = props;
      const { focusedKey } = selectionState;
      let nextFocusedKey: Key | null | undefined;

      if (
        focusedKey !== null &&
        cachedCollection &&
        !collection.getItem(focusedKey)
      ) {
        const node = cachedCollection.getItem(focusedKey);

        const parentNode =
          node?.parentKey !== null &&
          node?.parentKey !== undefined &&
          (node.type === "cell" ||
            node.type === "rowheader" ||
            node.type === "column")
            ? cachedCollection.getItem(node.parentKey)
            : node;

        nextFocusedKey = null;

        if (parentNode) {
          const cachedRows = cachedCollection.rows;
          const { rows } = collection;
          const diff = cachedRows.length - rows.length;

          const parentIndex = cachedRows.findIndex(
            (row) => row.key === parentNode.key
          );

          const index = Math.min(
            diff > 1 ? Math.max(parentIndex - diff + 1, 0) : parentIndex,
            rows.length - 1
          );

          const newRow = findFocusableRow(rows, index, (key) =>
            selectionManager().isDisabled(key)
          );

          if (newRow) {
            const childNodes = newRow.hasChildNodes
              ? [...getChildNodes(newRow, collection)]
              : [];

            nextFocusedKey =
              newRow.hasChildNodes &&
              parentNode !== node &&
              node &&
              node.index < childNodes.length
                ? requireValue(
                    childNodes[node.index],
                    "Expected childNodes[node.index] to exist."
                  ).key
                : newRow.key;
          }
        }
      }

      return { collection, nextFocusedKey };
    },
    ({ collection, nextFocusedKey }) => {
      cachedCollection = collection;

      if (nextFocusedKey !== undefined) {
        untrack(() => {
          selectionState.setFocusedKey(nextFocusedKey);
        });
      }
    }
  );

  return {
    get collection() {
      return props.collection;
    },
    get disabledKeys() {
      return disabledKeys();
    },
    get isKeyboardNavigationDisabled() {
      return false;
    },
    get selectionManager() {
      return selectionManager();
    },
  };
}

function findFocusableRow<T>(
  rows: GridNode<T>[],
  startIndex: number,
  isDisabled: (key: Key) => boolean
): GridNode<T> | null {
  for (const row of rows.slice(Math.max(0, startIndex))) {
    if (!isDisabled(row.key) && row.type !== "headerrow") {
      return row;
    }
  }

  for (const row of rows.slice(0, Math.max(0, startIndex)).toReversed()) {
    if (!isDisabled(row.key) && row.type !== "headerrow") {
      return row;
    }
  }

  return null;
}
