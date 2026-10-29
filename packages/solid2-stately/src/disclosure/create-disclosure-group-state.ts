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
 * Derived from Adobe React Spectrum: packages/react-stately/src/disclosure/useDisclosureGroupState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { Key } from "@solid2-aria/types-shared";
import { createMemo, createRenderEffect, untrack } from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";

export interface DisclosureGroupProps {
  /** Whether multiple items can be expanded at the same time. */
  allowsMultipleExpanded?: boolean;
  /** Whether all items are disabled. */
  isDisabled?: boolean;
  /** The currently expanded keys in the group (controlled). */
  expandedKeys?: Iterable<Key>;
  /** The initial expanded keys in the group (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  /** Handler that is called when items are expanded or collapsed. */
  onExpandedChange?: (keys: Set<Key>) => void;
}

export interface DisclosureGroupState {
  /** Whether multiple items can be expanded at the same time. */
  readonly allowsMultipleExpanded: boolean;
  /** Whether all items are disabled. */
  readonly isDisabled: boolean;
  /** A set of keys for items that are expanded. */
  readonly expandedKeys: Set<Key>;
  /** Toggles the expanded state for an item by its key. */
  toggleKey: (key: Key) => void;
  /** Replaces the set of expanded keys. */
  setExpandedKeys: (keys: Set<Key>) => void;
}

/**
 * Manages state for a group of disclosures, e.g. an accordion.
 * It supports both single and multiple expanded items.
 */
export function createDisclosureGroupState(
  props: DisclosureGroupProps
): DisclosureGroupState {
  const allowsMultipleExpanded = createMemo(
    () => props.allowsMultipleExpanded ?? false
  );

  const isDisabled = createMemo(() => props.isDisabled ?? false);

  const controlledKeys = createMemo(() =>
    props.expandedKeys ? new Set(props.expandedKeys) : undefined
  );

  const [expandedKeys, setExpandedKeys] = createControlledSignal(
    controlledKeys,
    untrack(() => new Set<Key>(props.defaultExpandedKeys)),
    (keys) => props.onExpandedChange?.(keys)
  );

  createRenderEffect(
    () => ({
      allowsMultipleExpanded: allowsMultipleExpanded(),
      expandedKeys: expandedKeys(),
    }),
    (current) => {
      if (!current.allowsMultipleExpanded && current.expandedKeys.size > 1) {
        const firstKey = current.expandedKeys.values().next().value;

        if (firstKey !== undefined) {
          setExpandedKeys(new Set([firstKey]));
        }
      }
    }
  );

  return {
    get allowsMultipleExpanded() {
      return allowsMultipleExpanded();
    },
    get expandedKeys() {
      return expandedKeys();
    },
    get isDisabled() {
      return isDisabled();
    },
    setExpandedKeys,
    toggleKey(key) {
      setExpandedKeys((previous) => {
        if (!allowsMultipleExpanded()) {
          return new Set(previous.has(key) ? [] : [key]);
        }

        const keys = new Set(previous);

        if (keys.has(key)) {
          keys.delete(key);
        } else {
          keys.add(key);
        }

        return keys;
      });
    },
  };
}
