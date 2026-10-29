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
 * Derived from Adobe React Spectrum: packages/react-stately/src/data/useAsyncList.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Key,
  LoadingState,
  Selection,
  SortDescriptor,
} from "@solid2-aria/types-shared";
import { createMemo, createSignal, untrack, merge, onSettled } from "solid-js";

import { getItemKey } from "../utils/get-item-key";
import { createListActions } from "./create-list-data";
import type { ListData, ListState } from "./create-list-data";

export interface AsyncListOptions<T, C> {
  /** The keys for the initially selected items. */
  initialSelectedKeys?: Iterable<Key>;
  /** The initial sort descriptor. */
  initialSortDescriptor?: SortDescriptor;
  /** The initial filter text. */
  initialFilterText?: string;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that loads the data for the items in the list. */
  load: AsyncListLoadFunction<T, C>;
  /**
   * An optional function that performs sorting. If not provided,
   * then `sortDescriptor` is passed to the `load` function.
   */
  sort?: AsyncListLoadFunction<
    T,
    C,
    AsyncListLoadOptions<T, C> & {
      sortDescriptor: SortDescriptor;
    }
  >;
}

export type AsyncListLoadFunction<
  T,
  C,
  S extends AsyncListLoadOptions<T, C> = AsyncListLoadOptions<T, C>,
> = (
  state: S
) => AsyncListStateUpdate<T, C> | Promise<AsyncListStateUpdate<T, C>>;

export interface AsyncListLoadOptions<T, C> {
  /** The items currently in the list. */
  items: T[];
  /** The keys of the currently selected items in the list. */
  selectedKeys: Selection;
  /** The current sort descriptor for the list. */
  sortDescriptor?: SortDescriptor;
  /** An abort signal used to notify the load function that the request has been aborted. */
  signal: AbortSignal;
  /** The pagination cursor returned from the last page load. */
  cursor?: C;
  /** The current filter text used to perform server side filtering. */
  filterText?: string;
  /** The current loading state of the list. */
  loadingState?: LoadingState;
}

export interface AsyncListStateUpdate<T, C> {
  /** The new items to append to the list. */
  items: Iterable<T>;
  /** The keys to add to the selection. */
  selectedKeys?: Iterable<Key>;
  /** The sort descriptor to set. */
  sortDescriptor?: SortDescriptor;
  /** The pagination cursor to be used for the next page load. */
  cursor?: C;
  /** The updated filter text for the list. */
  filterText?: string;
}

interface AsyncListState<T, C> extends ListState<T> {
  state: LoadingState;
  items: T[];
  // disabledKeys?: Iterable<Key>,
  selectedKeys: Selection;
  // selectedKey?: Key,
  // expandedKeys?: Iterable<Key>,
  sortDescriptor?: SortDescriptor;
  error?: Error;
  abortController?: AbortController;
  cursor?: C;
}

type ActionType =
  | "success"
  | "error"
  | "loading"
  | "loadingMore"
  | "sorting"
  | "update"
  | "filtering";

interface Action<T, C> {
  type: ActionType;
  items?: Iterable<T>;
  selectedKeys?: Iterable<Key>;
  sortDescriptor?: SortDescriptor;
  error?: Error;
  abortController?: AbortController;
  updater?: (state: ListState<T>) => ListState<T>;
  cursor?: C;
  filterText?: string;
}

export interface AsyncListData<T> extends ListData<T> {
  /** Whether data is currently being loaded. */
  isLoading: boolean;
  /** If loading data failed, then this contains the error that occurred. */
  error?: Error;
  // disabledKeys?: Set<Key>,
  // selectedKey?: Key,
  // expandedKeys?: Set<Key>,
  /** The current sort descriptor for the list. */
  sortDescriptor?: SortDescriptor;
  /** Reloads the data in the list. */
  reload: () => void;
  /** Loads the next page of data in the list. */
  loadMore: () => void;
  /** Triggers sorting for the list. */
  sort: (descriptor: SortDescriptor) => void;
  /** The current loading state for the list. */
  loadingState: LoadingState;
}

function reducer<T, C>(
  data: AsyncListState<T, C>,
  action: Action<T, C>
): AsyncListState<T, C> {
  switch (data.state) {
    case "idle":
    case "error": {
      return reduceSettledState(data, action);
    }

    case "loading":
    case "sorting":
    case "filtering": {
      return reduceLoadingState(data, action);
    }

    case "loadingMore": {
      return reduceLoadingMoreState(data, action);
    }

    default: {
      throw new Error(`Invalid state "${String(data.state)}"`);
    }
  }
}

function reduceSettledState<T, C>(
  data: AsyncListState<T, C>,
  action: Action<T, C>
): AsyncListState<T, C> {
  switch (action.type) {
    case "loading":
    case "loadingMore":
    case "sorting":
    case "filtering": {
      return {
        ...data,
        abortController: action.abortController,
        filterText: action.filterText ?? data.filterText,
        items: action.type === "loading" ? [] : data.items,
        sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
        state: action.type,
      };
    }

    case "update": {
      return {
        ...data,
        ...action.updater?.(data),
      };
    }

    case "success":
    case "error": {
      return data;
    }

    default: {
      throw new Error(
        `Invalid action "${String(action.type)}" in state "${data.state}"`
      );
    }
  }
}

function reduceLoadingState<T, C>(
  data: AsyncListState<T, C>,
  action: Action<T, C>
): AsyncListState<T, C> {
  switch (action.type) {
    case "success": {
      // Ignore if there is a newer abortcontroller in state.
      // This means that multiple requests were going at once.
      // We want to take only the latest result.
      if (action.abortController !== data.abortController) {
        return data;
      }

      const selectedKeys = action.selectedKeys ?? data.selectedKeys;

      return {
        ...data,
        abortController: undefined,
        cursor: action.cursor,
        filterText: action.filterText ?? data.filterText,
        items: [...(action.items ?? [])],
        selectedKeys: selectedKeys === "all" ? "all" : new Set(selectedKeys),
        sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
        state: "idle",
      };
    }

    case "error": {
      if (action.abortController !== data.abortController) {
        return data;
      }

      return {
        ...data,
        abortController: undefined,
        error: action.error,
        state: "error",
      };
    }

    case "loading":
    case "loadingMore":
    case "sorting":
    case "filtering": {
      // We're already loading, and another load was triggered at the same time.
      // We need to abort the previous load and start a new one.
      data.abortController?.abort("aborting current load and starting new one");

      return {
        ...data,
        abortController: action.abortController,
        filterText: action.filterText ?? data.filterText,
        items: action.type === "loading" ? [] : data.items,
        state: action.type,
      };
    }

    case "update": {
      // We're already loading, and an update happened at the same time (e.g. selectedKey changed).
      // Update data but don't abort previous load.
      return {
        ...data,
        ...action.updater?.(data),
      };
    }

    default: {
      throw new Error(
        `Invalid action "${String(action.type)}" in state "${data.state}"`
      );
    }
  }
}

function reduceLoadingMoreState<T, C>(
  data: AsyncListState<T, C>,
  action: Action<T, C>
): AsyncListState<T, C> {
  switch (action.type) {
    case "success": {
      const selectedKeys =
        data.selectedKeys === "all" || action.selectedKeys === "all"
          ? "all"
          : new Set([...data.selectedKeys, ...(action.selectedKeys ?? [])]);

      // Append the new items
      return {
        ...data,
        abortController: undefined,
        cursor: action.cursor,
        items: [...data.items, ...(action.items ?? [])],
        selectedKeys: selectedKeys === "all" ? "all" : new Set(selectedKeys),
        sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
        state: "idle",
      };
    }

    case "error": {
      if (action.abortController !== data.abortController) {
        return data;
      }

      return {
        ...data,
        error: action.error,
        state: "error",
      };
    }

    case "loading":
    case "sorting":
    case "filtering": {
      // We're already loading more, and another load was triggered at the same time.
      // We need to abort the previous load more and start a new one.
      data.abortController?.abort();

      return {
        ...data,
        abortController: action.abortController,
        filterText: action.filterText ?? data.filterText,
        items: action.type === "loading" ? [] : data.items,
        state: action.type,
      };
    }

    case "loadingMore": {
      // If already loading more and another loading more is triggered, abort the new load more since
      // it is a duplicate request since the cursor hasn't been updated.
      // Do not overwrite the data.abortController
      action.abortController?.abort();

      return data;
    }

    case "update": {
      // We're already loading, and an update happened at the same time (e.g. selectedKey changed).
      // Update data but don't abort previous load.
      return {
        ...data,
        ...action.updater?.(data),
      };
    }

    default: {
      throw new Error(
        `Invalid action "${String(action.type)}" in state "${data.state}"`
      );
    }
  }
}

/**
 * Manages state for an immutable async loaded list data structure, and provides convenience methods
 * to update the data over time. Manages loading and error states, pagination, and sorting.
 */
export function createAsyncList<T, C = string>(
  options: AsyncListOptions<T, C>
): AsyncListData<T> {
  const load = createMemo(() => options.load);
  const sort = createMemo(() => options.sort);
  const initialSelectedKeys = createMemo(() => options.initialSelectedKeys);
  const initialSortDescriptor = createMemo(() => options.initialSortDescriptor);
  const getKey = createMemo(() => options.getKey ?? getItemKey);
  const initialFilterText = createMemo(() => options.initialFilterText ?? "");

  const [data, setData] = createSignal<AsyncListState<T, C>>(
    {
      error: undefined,
      filterText: initialFilterText(),
      items: [],
      selectedKeys:
        initialSelectedKeys() === "all"
          ? "all"
          : new Set(initialSelectedKeys()),
      sortDescriptor: initialSortDescriptor(),
      state: "idle",
    },
    { ownedWrite: true }
  );

  let pendingData = untrack(data);

  const dispatch = (action: Action<T, C>) => {
    pendingData = reducer(pendingData, action);
    setData(pendingData);
  };

  const dispatchFetch = async (
    action: Action<T, C>,
    fn: AsyncListLoadFunction<T, C>
  ) => {
    const currentData = pendingData;
    const currentLoad = load();
    const abortController = new AbortController();

    try {
      dispatch({ ...action, abortController });

      if (abortController.signal.aborted) {
        return;
      }

      const previousFilterText = action.filterText ?? currentData.filterText;

      const response = await fn({
        cursor: action.type === "loadingMore" ? currentData.cursor : undefined,
        filterText: previousFilterText,
        items: [...currentData.items],
        loadingState: currentData.state,
        selectedKeys: currentData.selectedKeys,
        signal: abortController.signal,
        sortDescriptor: action.sortDescriptor ?? currentData.sortDescriptor,
      });

      const filterText = response.filterText ?? previousFilterText;
      dispatch({ type: "success", ...response, abortController });

      // Fetch a new filtered list if filterText is updated via `load` response func rather than list.setFilterText
      // Only do this if not aborted (e.g. user triggers another filter action before load completes)
      if (
        filterText &&
        filterText !== previousFilterText &&
        !abortController.signal.aborted
      ) {
        void dispatchFetch({ filterText, type: "filtering" }, currentLoad);
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      dispatch({
        abortController,
        error: error instanceof Error ? error : new Error(String(error)),
        type: "error",
      });
    }
  };

  onSettled(() => {
    void dispatchFetch({ type: "loading" }, load());

    return () => pendingData.abortController?.abort();
  });

  return merge(
    {
      get error() {
        return data().error;
      },
      get filterText() {
        return data().filterText;
      },
      getItem(key: Key) {
        const currentData = data();

        return currentData.items.find((item) => {
          const currentGetKey = getKey();

          return currentGetKey(item) === key;
        });
      },
      get isLoading() {
        return (
          data().state === "loading" ||
          data().state === "loadingMore" ||
          data().state === "sorting" ||
          data().state === "filtering"
        );
      },
      get items() {
        return data().items;
      },
      loadMore() {
        const currentData = pendingData;
        const currentLoad = load();

        // Ignore if already loading more or if performing server side filtering.
        if (
          currentData.state === "loading" ||
          currentData.state === "loadingMore" ||
          currentData.state === "filtering" ||
          currentData.cursor === null ||
          currentData.cursor === undefined
        ) {
          return;
        }

        void dispatchFetch({ type: "loadingMore" }, currentLoad);
      },
      get loadingState() {
        return data().state;
      },
      reload() {
        const currentLoad = load();
        void dispatchFetch({ type: "loading" }, currentLoad);
      },
      get selectedKeys() {
        return data().selectedKeys;
      },
      sort(sortDescriptor: SortDescriptor) {
        const currentSort = sort();
        const currentLoad = load();
        void dispatchFetch(
          { sortDescriptor, type: "sorting" },
          async (loadOptions) =>
            currentSort
              ? await currentSort({ ...loadOptions, sortDescriptor })
              : await currentLoad(loadOptions)
        );
      },
      get sortDescriptor() {
        return data().sortDescriptor;
      },
    } satisfies Partial<AsyncListData<T>>,
    createListActions(
      merge(options, {
        get cursor() {
          return pendingData.cursor;
        },
        get getKey() {
          return getKey();
        },
      }),
      (fn) => {
        dispatch({ type: "update", updater: fn });
      }
    ),
    {
      setFilterText(filterText: string) {
        const currentLoad = load();
        void dispatchFetch({ filterText, type: "filtering" }, currentLoad);
      },
    } satisfies Partial<AsyncListData<T>>
  );
}
