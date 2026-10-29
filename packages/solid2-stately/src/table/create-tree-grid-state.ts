/*
 * Copyright 2023 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/table/useTreeGridState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key, Node } from "@solid2-aria/types-shared";
import { createMemo, merge, untrack } from "solid-js";

import { CollectionBuilder } from "../collections/collection-builder";
import { getNodeChildren } from "../collections/get-child-nodes";
import { tableNestedRows } from "../flags/flags";
import type { GridNode } from "../grid/grid-collection";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { getNodeProps } from "../utils/get-node-props";
import type {
  CollectionBuilderContext,
  TableState,
  TableStateProps,
} from "./create-table-state";
import { createTableState } from "./create-table-state";
import { TableCollection } from "./table-collection";

export interface TreeGridState<T> extends Omit<TableState<T>, "expandedKeys"> {
  /** A set of keys for items that are expanded. */
  expandedKeys: "all" | Set<Key>;
  /** Toggles the expanded state for a row by its key. */
  toggleKey: (key: Key) => void;
  /** The key map containing nodes representing the collection's tree grid structure. */
  keyMap: Map<Key, GridNode<T>>;
  /** The number of leaf columns provided by the user. */
  userColumnCount: number;
}

export interface TreeGridStateProps<T> extends Omit<
  TableStateProps<T>,
  "collection"
> {
  /** The currently expanded keys in the collection (controlled). */
  UNSTABLE_expandedKeys?: "all" | Iterable<Key>;
  /** The initial expanded keys in the collection (uncontrolled). */
  UNSTABLE_defaultExpandedKeys?: "all" | Iterable<Key>;
  /** Handler that is called when items are expanded or collapsed. */
  UNSTABLE_onExpandedChange?: (keys: Set<Key>) => void;
}

/**
 * Provides state management for a tree grid component. Handles building a collection of columns and
 * rows from props. In addition, it tracks and manages expanded rows, row selection, and sort order
 * changes.
 */
export function UNSTABLE_createTreeGridState<T extends object>(
  props: TreeGridStateProps<T>
): TreeGridState<T> {
  if (!tableNestedRows()) {
    throw new Error(
      "Feature flag for table nested rows must be enabled to use createTreeGridState."
    );
  }

  const [expandedKeys, setExpandedKeys] = createControlledSignal<
    "all" | Set<Key>
  >(
    () =>
      props.UNSTABLE_expandedKeys === undefined
        ? undefined
        : convertExpanded(props.UNSTABLE_expandedKeys),
    untrack(() =>
      props.UNSTABLE_defaultExpandedKeys === undefined
        ? new Set<Key>()
        : convertExpanded(props.UNSTABLE_defaultExpandedKeys)
    ),
    (keys) => {
      if (keys !== "all") {
        props.UNSTABLE_onExpandedChange?.(keys);
      }
    }
  );

  const treeGridCollection = createMemo(() => {
    const context: CollectionBuilderContext<T> = {
      columns: [],
      selectionMode: props.selectionMode ?? "none",
      showDragButtons: props.showDragButtons === true,
      showSelectionCheckboxes:
        props.showSelectionCheckboxes === true &&
        props.selectionMode !== "none",
    };

    const nodes = new CollectionBuilder<T>().build(
      { children: props.children },
      context
    );

    const tree = generateTreeGridCollection<T>(nodes, {
      expandedKeys: expandedKeys(),
      showDragButtons: props.showDragButtons,
      showSelectionCheckboxes: props.showSelectionCheckboxes,
    });

    return {
      collection: new TableCollection<T>(tree.tableNodes, null, context),
      tree,
    };
  });

  const tableState = createTableState<T>(
    merge(props, {
      get collection() {
        return treeGridCollection().collection;
      },
    })
  );

  return merge(tableState, {
    get expandedKeys() {
      return expandedKeys();
    },
    get keyMap() {
      return treeGridCollection().tree.keyMap;
    },
    toggleKey(key: Key) {
      setExpandedKeys((current) =>
        toggleKey(current, key, treeGridCollection().tree)
      );
    },
    get treeColumn() {
      return (
        tableState.treeColumn ??
        treeGridCollection().collection.rowHeaderColumnKeys.keys().next()
          .value ??
        null
      );
    },
    get userColumnCount() {
      return treeGridCollection().tree.userColumnCount;
    },
  });
}

function toggleKey<T>(
  currentExpandedKeys: "all" | Set<Key>,
  key: Key,
  collection: TreeGridCollection<T>
): Set<Key> {
  let updatedExpandedKeys: Set<Key>;

  if (currentExpandedKeys === "all") {
    updatedExpandedKeys = new Set(
      collection.flattenedRows
        .filter(
          (row) =>
            getNodeProps(row).hasChildItems ||
            getNodeProps(row).children > collection.userColumnCount
        )
        .map((row) => row.key)
    );
    updatedExpandedKeys.delete(key);
  } else {
    updatedExpandedKeys = new Set(currentExpandedKeys);

    if (updatedExpandedKeys.has(key)) {
      updatedExpandedKeys.delete(key);
    } else {
      updatedExpandedKeys.add(key);
    }
  }

  return updatedExpandedKeys;
}

function convertExpanded(expanded: "all" | Iterable<Key>): "all" | Set<Key> {
  if (expanded === null || expanded === undefined) {
    return new Set<Key>();
  }

  return expanded === "all" ? "all" : new Set(expanded);
}

interface TreeGridCollectionOptions {
  showSelectionCheckboxes?: boolean;
  showDragButtons?: boolean;
  expandedKeys: "all" | Set<Key>;
}

interface TreeGridCollection<T> {
  keyMap: Map<Key, GridNode<T>>;
  tableNodes: GridNode<T>[];
  flattenedRows: GridNode<T>[];
  userColumnCount: number;
}

function generateTreeGridCollection<T>(
  nodes: Iterable<Node<T>>,
  opts: TreeGridCollectionOptions
): TreeGridCollection<T> {
  const { expandedKeys } = opts;
  let body: GridNode<T> | null = null;
  const flattenedRows: GridNode<T>[] = [];
  let userColumnCount = 0;
  const originalColumns: GridNode<T>[] = [];
  const keyMap = new Map();
  const topLevelRows: GridNode<T>[] = [];

  const visit = (node: GridNode<T>) => {
    switch (node.type) {
      case "body": {
        body = node;
        keyMap.set(body.key, body);
        break;
      }

      case "column": {
        if (!node.hasChildNodes) {
          userColumnCount += 1;
        }

        break;
      }

      case "item": {
        topLevelRows.push(node);

        return;
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
    if (node.type === "column") {
      originalColumns.push(node);
    }

    visit(node);
  }

  // Update each grid node in the treegrid table with values specific to a treegrid structure. Also store a set of flattened row nodes for TableCollection to consume
  const visitNode = (node: GridNode<T>) => {
    if (node.type === "item") {
      flattenedRows.push(node);
    }

    keyMap.set(node.key, node);

    for (const child of getNodeChildren(node)) {
      if (
        child.type !== "item" ||
        expandedKeys === "all" ||
        expandedKeys.has(node.key)
      ) {
        if (child.type === "item") {
          visitNode(child);
        } else {
          // We enforce that the cells come before rows so can just reuse cell index
          visitNode(child);
        }
      }
    }
  };

  for (const node of topLevelRows) {
    visitNode(node);
  }

  return {
    get flattenedRows() {
      return flattenedRows;
    },
    get keyMap() {
      return keyMap;
    },
    get tableNodes() {
      return [
        ...originalColumns,
        // oxlint-disable solid/reactivity -- Keep prop filtering in the renderer's lazy evaluation.
        merge(body, {
          get childNodes() {
            return flattenedRows;
          },
        }),
        // oxlint-enable solid/reactivity
      ];
    },
    get userColumnCount() {
      return userColumnCount;
    },
  };
}
