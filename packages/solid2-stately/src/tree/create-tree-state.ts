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
 * Derived from Adobe React Spectrum: packages/react-stately/src/tree/useTreeState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  CollectionStateBase,
  DisabledBehavior,
  Expandable,
  Key,
  MultipleSelection,
  Node,
} from "@solid2-aria/types-shared";
import { createMemo, createRenderEffect, untrack } from "solid-js";

import { createCollection } from "../collections/create-collection";
import { createMultipleSelectionState } from "../selection/create-multiple-selection-state";
import { SelectionManager } from "../selection/selection-manager";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { TreeCollection } from "./tree-collection";

export interface TreeProps<T>
  extends CollectionStateBase<T>, Expandable, MultipleSelection {
  /** Whether `disabledKeys` applies to all interactions, or only selection. */
  disabledBehavior?: DisabledBehavior;
}

export interface TreeState<T> {
  /** A collection of items in the tree. */
  readonly collection: Collection<Node<T>>;
  /** A set of keys for items that are disabled. */
  readonly disabledKeys: Set<Key>;
  /** A set of keys for items that are expanded. */
  readonly expandedKeys: Set<Key>;
  /** Toggles the expanded state for an item by its key. */
  toggleKey: (key: Key) => void;
  /** Replaces the set of expanded keys. */
  setExpandedKeys: (keys: Set<Key>) => void;
  /** A selection manager to read and update multiple selection state. */
  readonly selectionManager: SelectionManager;
}

/**
 * Provides state management for tree-like components. Handles building a collection
 * of items from props, item expanded state, and manages multiple selection state.
 */
export function createTreeState<T extends object>(
  props: TreeProps<T>
): TreeState<T> {
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

  const selectionState = createMultipleSelectionState(props);

  const disabledKeys = createMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  const tree = createCollection(
    props,
    (nodes) =>
      new TreeCollection(nodes, {
        get expandedKeys() {
          return expandedKeys();
        },
      }),
    null
  );

  // Reset focused key if that item is deleted from the collection.
  createRenderEffect(
    () => {
      const { focusedKey } = selectionState;

      return focusedKey !== null && !tree().getItem(focusedKey);
    },
    (removed) => {
      if (removed) {
        selectionState.setFocusedKey(null);
      }
    }
  );

  const onToggle = (key: Key) => {
    setExpandedKeys((current) => toggleKey(current, key));
  };

  return {
    get collection() {
      return tree();
    },
    get disabledKeys() {
      return disabledKeys();
    },
    get expandedKeys() {
      return expandedKeys();
    },
    get selectionManager() {
      return new SelectionManager(tree(), selectionState);
    },
    get setExpandedKeys() {
      return setExpandedKeys;
    },
    get toggleKey() {
      return onToggle;
    },
  };
}

function toggleKey(set: Set<Key>, key: Key): Set<Key> {
  const res = new Set(set);

  if (res.has(key)) {
    res.delete(key);
  } else {
    res.add(key);
  }

  return res;
}
