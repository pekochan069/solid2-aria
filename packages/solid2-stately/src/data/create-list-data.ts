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
 * Derived from Adobe React Spectrum: packages/react-stately/src/data/useListData.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key, Selection } from "@solid2-aria/types-shared";
import { createMemo, createSignal, untrack, merge } from "solid-js";

import { getItemKey } from "../utils/get-item-key";

export interface ListOptions<T> {
  /** Initial items in the list. */
  initialItems?: T[];
  /** The keys for the initially selected items. */
  initialSelectedKeys?: "all" | Iterable<Key>;
  /** The initial text to filter the list by. */
  initialFilterText?: string;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that returns whether a item matches the current filter text. */
  filter?: (item: T, filterText: string) => boolean;
}

export interface ListData<T> {
  /** The items in the list. */
  items: T[];
  /** The keys of the currently selected items in the list. */
  selectedKeys: Selection;
  /** Sets the selected keys. */
  setSelectedKeys: (keys: Selection) => void;
  /** Adds the given keys to the current selected keys. */
  addKeysToSelection: (keys: Selection) => void;
  /** Removes the given keys from the current selected keys. */
  removeKeysFromSelection: (keys: Selection) => void;
  /** The current filter text. */
  filterText: string;
  /** Sets the filter text. */
  setFilterText: (filterText: string) => void;
  /**
   * Gets an item from the list by key.
   *
   * @param key - The key of the item to retrieve.
   */
  getItem: (key: Key) => T | undefined;
  /**
   * Inserts items into the list at the given index.
   *
   * @param index - The index to insert into.
   * @param values - The values to insert.
   */
  insert: (index: number, ...values: T[]) => void;
  /**
   * Inserts items into the list before the item at the given key.
   *
   * @param key - The key of the item to insert before.
   * @param values - The values to insert.
   */
  insertBefore: (key: Key, ...values: T[]) => void;
  /**
   * Inserts items into the list after the item at the given key.
   *
   * @param key - The key of the item to insert after.
   * @param values - The values to insert.
   */
  insertAfter: (key: Key, ...values: T[]) => void;
  /**
   * Appends items to the list.
   *
   * @param values - The values to insert.
   */
  append: (...values: T[]) => void;
  /**
   * Prepends items to the list.
   *
   * @param value - The value to insert.
   */
  prepend: (...values: T[]) => void;
  /**
   * Removes items from the list by their keys.
   *
   * @param keys - The keys of the item to remove.
   */
  remove: (...keys: Key[]) => void;
  /**
   * Removes all items from the list that are currently
   * in the set of selected items.
   */
  removeSelectedItems: () => void;
  /**
   * Moves an item within the list.
   *
   * @param key - The key of the item to move.
   * @param toIndex - The index to move the item to.
   */
  move: (key: Key, toIndex: number) => void;
  /**
   * Moves one or more items before a given key.
   *
   * @param key - The key of the item to move the items before.
   * @param keys - The keys of the items to move.
   */
  moveBefore: (key: Key, keys: Iterable<Key>) => void;
  /**
   * Moves one or more items after a given key.
   *
   * @param key - The key of the item to move the items after.
   * @param keys - The keys of the items to move.
   */
  moveAfter: (key: Key, keys: Iterable<Key>) => void;
  /**
   * Updates an item in the list.
   *
   * @param key - The key of the item to update.
   * @param newValue - The new value for the item, or a function that returns the new value based on
   *   the previous value.
   */
  update: (key: Key, newValue: T | ((prev: T) => T)) => void;
}

export interface ListState<T> {
  items: T[];
  selectedKeys: Selection;
  filterText: string;
}

interface CreateListOptions<T, C> extends ListOptions<T> {
  cursor?: C;
}

/**
 * Manages state for an immutable list data structure, and provides convenience methods to
 * update the data over time.
 */
export function createListData<T>(options: ListOptions<T>): ListData<T> {
  const initialItems = createMemo(() => options.initialItems ?? []);
  const initialSelectedKeys = createMemo(() => options.initialSelectedKeys);
  const getKey = createMemo(() => options.getKey ?? getItemKey);
  const filter = createMemo(() => options.filter);
  const initialFilterText = createMemo(() => options.initialFilterText ?? "");

  // Store both items and filteredItems in state so we can go back to the unfiltered list
  const [state, setState] = createSignal<ListState<T>>(
    untrack(() => {
      const currentInitialItems = initialItems();
      const currentInitialSelectedKeys = initialSelectedKeys();
      const currentInitialFilterText = initialFilterText();

      return {
        filterText: currentInitialFilterText,
        items: currentInitialItems,
        selectedKeys:
          currentInitialSelectedKeys === "all"
            ? "all"
            : new Set(currentInitialSelectedKeys),
      };
    }),
    { ownedWrite: true }
  );

  const filteredItems = createMemo(() => {
    const currentFilter = filter();
    const currentState = state();

    return currentFilter
      ? currentState.items.filter((item) =>
          currentFilter(item, currentState.filterText)
        )
      : currentState.items;
  });

  return merge(
    {
      get filterText() {
        return state().filterText;
      },
      get selectedKeys() {
        return state().selectedKeys;
      },
    },
    {
      get items() {
        return filteredItems();
      },
    } satisfies Partial<ListData<T>>,
    createListActions(
      {
        get getKey() {
          return getKey();
        },
      },
      (update) => {
        setState(update);
      }
    ),
    {
      getItem(key: Key) {
        const currentState = state();

        return currentState.items.find((item) => {
          const currentGetKey = getKey();

          return currentGetKey(item) === key;
        });
      },
    } satisfies Partial<ListData<T>>
  );
}

export function createListActions<T, C>(
  opts: CreateListOptions<T, C>,
  dispatch: (updater: (state: ListState<T>) => ListState<T>) => void
): Omit<ListData<T>, "items" | "selectedKeys" | "getItem" | "filterText"> {
  const getKey = (item: T) => (opts.getKey ?? getItemKey)(item);

  return {
    addKeysToSelection(selectedKeys: Selection) {
      dispatch((state) => {
        if (state.selectedKeys === "all") {
          return state;
        }

        if (selectedKeys === "all") {
          return {
            ...state,
            selectedKeys: "all",
          };
        }

        return {
          ...state,
          selectedKeys: new Set([...state.selectedKeys, ...selectedKeys]),
        };
      });
    },
    append(...values: T[]) {
      dispatch((state) => insert(state, state.items.length, ...values));
    },
    insert(index: number, ...values: T[]) {
      dispatch((state) => insert(state, index, ...values));
    },
    insertAfter(key: Key, ...values: T[]) {
      dispatch((state) => {
        let index = state.items.findIndex((item) => getKey?.(item) === key);

        if (index === -1) {
          if (state.items.length === 0) {
            index = 0;
          } else {
            return state;
          }
        }

        return insert(state, index + 1, ...values);
      });
    },
    insertBefore(key: Key, ...values: T[]) {
      dispatch((state) => {
        let index = state.items.findIndex((item) => getKey?.(item) === key);

        if (index === -1) {
          if (state.items.length === 0) {
            index = 0;
          } else {
            return state;
          }
        }

        return insert(state, index, ...values);
      });
    },
    move(key: Key, toIndex: number) {
      dispatch((state) => {
        const index = state.items.findIndex((item) => getKey(item) === key);

        if (index === -1) {
          return state;
        }

        const copy = [...state.items];
        const removed = copy.splice(index, 1);
        copy.splice(toIndex, 0, ...removed);

        return {
          ...state,
          items: copy,
        };
      });
    },
    moveAfter(key: Key, keys: Iterable<Key>) {
      dispatch((state) => {
        const toIndex = state.items.findIndex((item) => getKey(item) === key);

        if (toIndex === -1) {
          return state;
        }

        const keyArray = [...keys];

        const indices = keyArray
          .map((localKey) =>
            state.items.findIndex((item) => getKey(item) === localKey)
          )
          .toSorted((a, b) => a - b);

        return move(state, indices, toIndex + 1);
      });
    },
    moveBefore(key: Key, keys: Iterable<Key>) {
      dispatch((state) => {
        const toIndex = state.items.findIndex((item) => getKey(item) === key);

        if (toIndex === -1) {
          return state;
        }

        // Find indices of keys to move. Sort them so that the order in the list is retained.
        const keyArray = [...keys];

        const indices = keyArray
          .map((localKey) =>
            state.items.findIndex((item) => getKey(item) === localKey)
          )
          .toSorted((a, b) => a - b);

        return move(state, indices, toIndex);
      });
    },
    prepend(...values: T[]) {
      dispatch((state) => insert(state, 0, ...values));
    },
    remove(...keys: Key[]) {
      dispatch((state) => {
        const keySet = new Set(keys);
        const items = state.items.filter((item) => !keySet.has(getKey(item)));
        let selection: Selection = "all";

        if (state.selectedKeys !== "all") {
          selection = new Set(state.selectedKeys);

          for (const key of keys) {
            selection.delete(key);
          }
        }

        if (
          (opts.cursor === null || opts.cursor === undefined) &&
          items.length === 0
        ) {
          selection = new Set();
        }

        return {
          ...state,
          items,
          selectedKeys: selection,
        };
      });
    },
    removeKeysFromSelection(selectedKeys: Selection) {
      dispatch((state) => {
        if (selectedKeys === "all") {
          return {
            ...state,
            selectedKeys: new Set(),
          };
        }

        const selection: Selection =
          state.selectedKeys === "all"
            ? new Set(state.items.map(getKey))
            : new Set(state.selectedKeys);

        for (const key of selectedKeys) {
          selection.delete(key);
        }

        return {
          ...state,
          selectedKeys: selection,
        };
      });
    },
    removeSelectedItems() {
      dispatch((state) => {
        if (state.selectedKeys === "all") {
          return {
            ...state,
            items: [],
            selectedKeys: new Set(),
          };
        }

        const { selectedKeys } = state;

        const items = state.items.filter(
          (item) => !selectedKeys.has(getKey(item))
        );

        return {
          ...state,
          items,
          selectedKeys: new Set(),
        };
      });
    },
    setFilterText(filterText: string) {
      dispatch((state) => ({
        ...state,
        filterText,
      }));
    },
    setSelectedKeys(selectedKeys: Selection) {
      dispatch((state) => ({
        ...state,
        selectedKeys,
      }));
    },
    update(key: Key, newValue: T | ((prev: T) => T)) {
      dispatch((state) => {
        const index = state.items.findIndex((item) => getKey(item) === key);

        if (index === -1) {
          return state;
        }

        const items = state.items.map((item, itemIndex) => {
          if (itemIndex !== index) {
            return item;
          }

          if (typeof newValue === "function") {
            // SAFETY: the public update contract treats functions as updaters, including when T is callable.
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            return (newValue as (prev: T) => T)(item);
          }

          return newValue;
        });

        return {
          ...state,
          items,
        };
      });
    },
  };
}

function insert<T>(
  state: ListState<T>,
  index: number,
  ...values: T[]
): ListState<T> {
  return {
    ...state,
    items: [
      ...state.items.slice(0, index),
      ...values,
      ...state.items.slice(index),
    ],
  };
}

function move<T>(
  state: ListState<T>,
  indices: number[],
  initialToIndex: number
): ListState<T> {
  let toIndex = initialToIndex;

  // Shift the target down by the number of items being moved from before the target
  toIndex -= indices.filter((index) => index < toIndex).length;

  const moves = indices.map((from) => {
    const localMove = { from, to: toIndex };
    toIndex += 1;

    return localMove;
  });

  // Shift later from indices down if they have a larger index
  for (const [i, currentMove] of moves.entries()) {
    const a = currentMove.from;

    for (const laterMove of moves.slice(i)) {
      if (laterMove.from > a) {
        laterMove.from -= 1;
      }
    }
  }

  // Interleave the moves so they can be applied one by one rather than all at once
  for (const [i, a] of moves.entries()) {
    for (const b of moves.slice(i + 1).toReversed()) {
      if (b.from < a.to) {
        a.to += 1;
      } else {
        b.from += 1;
      }
    }
  }

  const copy = [...state.items];

  for (const localMove of moves) {
    const removed = copy.splice(localMove.from, 1);
    copy.splice(localMove.to, 0, ...removed);
  }

  return {
    ...state,
    items: copy,
  };
}
