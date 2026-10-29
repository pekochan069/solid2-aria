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
 * Derived from Adobe React Spectrum: packages/react-stately/src/tabs/useTabListState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2; synchronize selection and browser focus after rendering on the client.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  CollectionBase,
  CollectionStateBase,
  Key,
  Node,
  SingleSelection,
} from "@solid2-aria/types-shared";
import { createEffect, merge, untrack, omit } from "solid-js";

import { createSingleSelectListState } from "../list/create-single-select-list-state";
import type { SingleSelectListState } from "../list/create-single-select-list-state";
import { getNodeProps } from "../utils/get-node-props";

export interface TabListProps<T>
  extends
    CollectionBase<T>,
    Omit<
      SingleSelection,
      | "disallowEmptySelection"
      | "selectedKey"
      | "defaultSelectedKey"
      | "onSelectionChange"
    > {
  /**
   * Whether the TabList is disabled.
   * Shows that a selection exists, but is not available in that circumstance.
   */
  isDisabled?: boolean;
  /** The currently selected key in the collection (controlled). */
  selectedKey?: Key;
  /** The initial selected keys in the collection (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: Key) => void;
}

export interface TabListStateOptions<T>
  extends Omit<TabListProps<T>, "children">, CollectionStateBase<T> {}

export interface TabListState<T> extends SingleSelectListState<T> {
  /** Whether the tab list is disabled. */
  isDisabled: boolean;
}

/**
 * Provides state management for a Tabs component. Tabs include a TabList which tracks
 * which tab is currently selected and displays the content associated with that Tab in a TabPanel.
 */
export function createTabListState<T extends object>(
  props: TabListStateOptions<T>
): TabListState<T> {
  const state = createSingleSelectListState<T>(
    merge(omit(props, "onSelectionChange"), {
      get defaultSelectedKey() {
        return (
          props.defaultSelectedKey ??
          findDefaultSelectedKey(
            props.collection,
            props.disabledKeys ? new Set(props.disabledKeys) : new Set()
          ) ??
          undefined
        );
      },
      get onSelectionChange() {
        return (key: Key | null) => {
          if (key !== null && key !== undefined) {
            props.onSelectionChange?.(key);
          }
        };
      },
      get suppressTextValueWarning() {
        return true;
      },
    })
  );

  let lastSelectedKey = untrack(() => state.selectedKey);
  createEffect(
    () => {
      const manager = state.selectionManager;
      let { selectedKey } = state;
      let replaceSelection = false;

      if (
        (props.selectedKey === null || props.selectedKey === undefined) &&
        (manager.isEmpty ||
          selectedKey === null ||
          !state.collection.getItem(selectedKey))
      ) {
        selectedKey = findDefaultSelectedKey(
          state.collection,
          state.disabledKeys
        );
        replaceSelection = selectedKey !== null;
      }

      return {
        manager,
        replaceSelection,
        selectedKey,
        updateFocus:
          (selectedKey !== null && manager.focusedKey === null) ||
          (!manager.isFocused && selectedKey !== lastSelectedKey),
      };
    },
    ({ manager, replaceSelection, selectedKey, updateFocus }) => {
      if (replaceSelection && selectedKey !== null) {
        untrack(() => {
          manager.setSelectedKeys([selectedKey]);
        });
      }

      if (updateFocus) {
        untrack(() => {
          manager.setFocusedKey(selectedKey);
        });
      }

      lastSelectedKey = selectedKey;
    }
  );

  return merge(state, {
    get isDisabled() {
      return props.isDisabled === true || false;
    },
  });
}

function findDefaultSelectedKey<T>(
  collection: Collection<Node<T>> | undefined,
  disabledKeys: Set<Key>
) {
  let selectedKey: Key | null = null;

  if (collection) {
    selectedKey = collection.getFirstKey();

    // loop over tabs until we find one that isn't disabled and select that
    while (
      selectedKey !== null &&
      selectedKey !== undefined &&
      (disabledKeys.has(selectedKey) ||
        getNodeProps(collection.getItem(selectedKey)).isDisabled) &&
      selectedKey !== collection.getLastKey()
    ) {
      selectedKey = collection.getKeyAfter(selectedKey);
    }

    // if this check is true, then every item is disabled, it makes more sense to default to the first key than the last
    if (
      selectedKey !== null &&
      selectedKey !== undefined &&
      (disabledKeys.has(selectedKey) ||
        getNodeProps(collection.getItem(selectedKey)).isDisabled) &&
      selectedKey === collection.getLastKey()
    ) {
      selectedKey = collection.getFirstKey();
    }
  }

  return selectedKey;
}
