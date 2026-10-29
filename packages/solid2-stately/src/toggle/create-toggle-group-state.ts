/*
 * Copyright 2024 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-stately/src/toggle/useToggleGroupState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import { createMemo, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";

export interface ToggleGroupProps {
  /**
   * Whether single or multiple selection is enabled.
   *
   * @default 'single'
   */
  selectionMode?: "single" | "multiple";
  /** Whether the collection allows empty selection. */
  disallowEmptySelection?: boolean;
  /** The currently selected keys in the collection (controlled). */
  selectedKeys?: Iterable<Key>;
  /** The initial selected keys in the collection (uncontrolled). */
  defaultSelectedKeys?: Iterable<Key>;
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (keys: Set<Key>) => void;
  /** Whether all items are disabled. */
  isDisabled?: boolean;
}

export interface ToggleGroupState {
  /** Whether single or multiple selection is enabled. */
  readonly selectionMode: "single" | "multiple";
  /** Whether all items are disabled. */
  readonly isDisabled: boolean;
  /** A set of keys for items that are selected. */
  readonly selectedKeys: Set<Key>;
  /** Toggles the selected state for an item by its key. */
  toggleKey: (key: Key) => void;
  /** Sets whether the given key is selected. */
  setSelected: (key: Key, isSelected: boolean) => void;
  /** Replaces the set of selected keys. */
  setSelectedKeys: (keys: Set<Key>) => void;
}

/**
 * Manages state for a group of toggles.
 * It supports both single and multiple selected items.
 */
export function createToggleGroupState(
  props: ToggleGroupProps
): ToggleGroupState {
  const controlled = createMemo(() =>
    props.selectedKeys ? new Set(props.selectedKeys) : undefined
  );

  const [selectedKeys, setSelectedKeys] = createControlledSignal(
    controlled,
    untrack(() => new Set<Key>(props.defaultSelectedKeys)),
    (keys) => props.onSelectionChange?.(keys)
  );

  function toggleKey(key: Key) {
    setSelectedKeys((previous) => {
      if (props.selectionMode !== "multiple") {
        return new Set(
          previous.has(key) && !(props.disallowEmptySelection === true)
            ? []
            : [key]
        );
      }

      const keys = new Set(previous);

      if (
        keys.has(key) &&
        (!(props.disallowEmptySelection === true) || keys.size > 1)
      ) {
        keys.delete(key);
      } else {
        keys.add(key);
      }

      return keys;
    });
  }

  return {
    get isDisabled() {
      return props.isDisabled ?? false;
    },
    get selectedKeys() {
      return selectedKeys();
    },
    get selectionMode() {
      return props.selectionMode ?? "single";
    },
    setSelected(key, isSelected) {
      setSelectedKeys((previous) => {
        if (previous.has(key) === isSelected) {
          return previous;
        }

        if (props.selectionMode !== "multiple") {
          return new Set(
            !isSelected && !(props.disallowEmptySelection === true) ? [] : [key]
          );
        }

        const keys = new Set(previous);

        if (isSelected) {
          keys.add(key);
        } else if (!(props.disallowEmptySelection === true) || keys.size > 1) {
          keys.delete(key);
        }

        return keys;
      });
    },
    setSelectedKeys,
    toggleKey,
  };
}
