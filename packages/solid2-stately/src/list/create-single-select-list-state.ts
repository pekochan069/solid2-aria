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
 * Derived from Adobe React Spectrum: packages/react-stately/src/list/useSingleSelectListState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  CollectionStateBase,
  Key,
  Node,
  Selection,
  SingleSelection,
} from "@solid2-aria/types-shared";
import { merge, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { createListState } from "./create-list-state";
import type { ListState } from "./create-list-state";

export interface SingleSelectListProps<T>
  extends
    CollectionStateBase<T>,
    Omit<SingleSelection, "disallowEmptySelection"> {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>;
  /** @private */
  suppressTextValueWarning?: boolean;
}

export interface SingleSelectListState<T> extends ListState<T> {
  /** The key for the currently selected item. */
  readonly selectedKey: Key | null;
  /** Sets the selected key. */
  setSelectedKey: (key: Key | null) => void;
  /** The value of the currently selected item. */
  readonly selectedItem: Node<T> | null;
}

/**
 * Provides state management for list-like components with single selection.
 * Handles building a collection of items from props, and manages selection state.
 */
export function createSingleSelectListState<T extends object>(
  props: SingleSelectListProps<T>
): SingleSelectListState<T> {
  const [selectedKey, setSelectedKey] = createControlledSignal(
    () => props.selectedKey,
    untrack(() => props.defaultSelectedKey ?? null),
    (key) => props.onSelectionChange?.(key)
  );

  const state = createListState(
    merge(props, {
      allowDuplicateSelectionEvents: true,
      disallowEmptySelection: true,
      onSelectionChange(keys: Selection) {
        if (keys === "all") {
          return;
        }

        const key = keys.values().next().value ?? null;

        if (key === selectedKey()) {
          props.onSelectionChange?.(key);
        }

        setSelectedKey(key);
      },
      get selectedKeys() {
        const key = selectedKey();

        return key === null || key === undefined ? [] : [key];
      },
      selectionMode: "single" as const,
    })
  );

  return merge(state, {
    get selectedItem() {
      const key = selectedKey();

      return key === null || key === undefined
        ? null
        : state.collection.getItem(key);
    },
    get selectedKey() {
      return selectedKey();
    },
    setSelectedKey,
  });
}
