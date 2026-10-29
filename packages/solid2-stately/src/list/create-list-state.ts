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
 * Derived from Adobe React Spectrum: packages/react-stately/src/list/useListState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  CollectionStateBase,
  Key,
  LayoutDelegate,
  Node,
} from "@solid2-aria/types-shared";
import { createMemo, createRenderEffect, untrack } from "solid-js";

import { createCollection } from "../collections/create-collection";
import { createMultipleSelectionState } from "../selection/create-multiple-selection-state";
import type { MultipleSelectionStateProps } from "../selection/create-multiple-selection-state";
import { SelectionManager } from "../selection/selection-manager";
import { ListCollection } from "./list-collection";

export interface ListProps<T>
  extends CollectionStateBase<T>, MultipleSelectionStateProps {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>;
  /** @private */
  suppressTextValueWarning?: boolean;
  /**
   * A delegate object that provides layout information for items in the collection.
   * This can be used to override the behavior of shift selection.
   */
  layoutDelegate?: LayoutDelegate;
}

export interface ListState<T> {
  /** A collection of items in the list. */
  collection: Collection<Node<T>>;
  /** A set of items that are disabled. */
  disabledKeys: Set<Key>;
  /** A selection manager to read and update multiple selection state. */
  selectionManager: SelectionManager;
}

/**
 * Provides state management for list-like components. Handles building a collection
 * of items from props, and manages multiple selection state.
 */
export function createListState<T extends object>(
  props: ListProps<T>
): ListState<T> {
  const filter = createMemo(() => props.filter);
  const layoutDelegate = createMemo(() => props.layoutDelegate);
  const selectionState = createMultipleSelectionState(props);

  const disabledKeys = createMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  const factory = (nodes: Iterable<Node<T>>) => {
    const currentFilter = filter();

    return currentFilter
      ? new ListCollection(currentFilter(nodes))
      : new ListCollection(nodes);
  };

  const context = {
    get suppressTextValueWarning() {
      return props.suppressTextValueWarning;
    },
  };

  const collection = createCollection(props, factory, context);

  const selectionManager = createMemo(() => {
    const currentCollection = collection();
    const currentLayoutDelegate = layoutDelegate();

    return new SelectionManager(currentCollection, selectionState, {
      layoutDelegate: currentLayoutDelegate,
    });
  });

  createFocusedKeyReset(collection, selectionManager);

  return {
    get collection() {
      return collection();
    },
    get disabledKeys() {
      return disabledKeys();
    },
    get selectionManager() {
      return selectionManager();
    },
  };
}

/**
 * Filters a collection using the provided filter function and returns a new ListState.
 */
export function UNSTABLE_createFilteredListState<T>(
  state: ListState<T>,
  filterFn: ((nodeValue: string, node: Node<T>) => boolean) | null | undefined
): ListState<T> {
  const collection = createMemo(() => {
    const current = state.collection;

    if (!filterFn) {
      return current;
    }

    if (!current.filter) {
      throw new Error("The collection does not support filtering.");
    }

    return current.filter(filterFn);
  });

  const selectionManager = createMemo(() =>
    state.selectionManager.withCollection(collection())
  );

  createFocusedKeyReset(collection, selectionManager);

  return {
    get collection() {
      return collection();
    },
    get disabledKeys() {
      return state.disabledKeys;
    },
    get selectionManager() {
      return selectionManager();
    },
  };
}

function createFocusedKeyReset<T>(
  getCollection: () => Collection<Node<T>>,
  getSelectionManager: () => SelectionManager
) {
  // Reset focused key if that item is deleted from the collection.
  let cachedCollection: Collection<Node<T>> | null = null;
  createRenderEffect(
    () => {
      const collection = getCollection();
      const selectionManager = getSelectionManager();
      const { focusedKey } = selectionManager;
      let nextFocusedKey: Key | null | undefined;

      if (
        focusedKey !== null &&
        !collection.getItem(focusedKey) &&
        cachedCollection
      ) {
        let key = cachedCollection.getKeyAfter(focusedKey);
        nextFocusedKey = null;

        while (key !== null && key !== undefined) {
          const node = collection.getItem(key);

          if (node?.type === "item" && !selectionManager.isDisabled(key)) {
            nextFocusedKey = key;
            break;
          }

          key = cachedCollection.getKeyAfter(key);
        }

        if (nextFocusedKey === null) {
          key = cachedCollection.getKeyBefore(focusedKey);

          while (key !== null && key !== undefined) {
            const node = collection.getItem(key);

            if (node?.type === "item" && !selectionManager.isDisabled(key)) {
              nextFocusedKey = key;
              break;
            }

            key = cachedCollection.getKeyBefore(key);
          }
        }
      }

      return { collection, nextFocusedKey, selectionManager };
    },
    ({ collection, nextFocusedKey, selectionManager }) => {
      cachedCollection = collection;

      if (nextFocusedKey !== undefined) {
        untrack(() => {
          selectionManager.setFocusedKey(nextFocusedKey);
        });
      }
    }
  );
}
