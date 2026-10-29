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
 * Derived from Adobe React Spectrum: packages/react-stately/src/selection/useMultipleSelectionState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DisabledBehavior,
  FocusStrategy,
  Key,
  MultipleSelection,
  SelectionBehavior,
} from "@solid2-aria/types-shared";
import {
  createMemo,
  createSignal,
  createRenderEffect,
  untrack,
} from "solid-js";

import { createControlledSignal } from "../utils/create-controlled-signal";
import { Selection } from "./selection";
import type { MultipleSelectionState } from "./types";

function equalSets(setA: "all" | Set<Key>, setB: "all" | Set<Key>) {
  if (setA === "all" || setB === "all") {
    return setA === setB;
  }

  if (setA.size !== setB.size) {
    return false;
  }

  for (const item of setA) {
    if (!setB.has(item)) {
      return false;
    }
  }

  return true;
}

export interface MultipleSelectionStateProps extends MultipleSelection {
  /**
   * How multiple selection should behave in the collection.
   *
   * @default 'toggle'
   */
  selectionBehavior?: SelectionBehavior;
  /** Whether onSelectionChange should fire even if the new set of keys is the same as the last. */
  allowDuplicateSelectionEvents?: boolean;
  /**
   * Whether `disabledKeys` applies to all interactions, or only selection.
   *
   * @default 'all'
   */
  disabledBehavior?: DisabledBehavior;
}

/**
 * Manages state for multiple selection and focus in a collection.
 */
export function createMultipleSelectionState(
  props: MultipleSelectionStateProps
): MultipleSelectionState {
  const selectionMode = createMemo(() => props.selectionMode ?? "none");

  const disallowEmptySelection = createMemo(
    () => props.disallowEmptySelection ?? false
  );

  const allowDuplicateSelectionEvents = createMemo(
    () => props.allowDuplicateSelectionEvents
  );

  const selectionBehaviorProp = createMemo(
    () => props.selectionBehavior ?? "toggle"
  );

  const disabledBehavior = createMemo(() => props.disabledBehavior ?? "all");
  // We want synchronous updates to `isFocused` and `focusedKey` after their setters are called.
  // But we also need to trigger a react re-render. So, we have both a ref (sync) and state (async).
  let isFocusedRef = false;

  const [focused, setFocused] = createSignal(false, { ownedWrite: true });

  let focusedKeyRef: Key | null = null;
  let childFocusStrategyRef: FocusStrategy | null = null;

  const [focusedKey, setFocusedKey] = createSignal<number>(0, {
    ownedWrite: true,
  });

  const selectedKeysProp = createMemo(() =>
    convertSelection(props.selectedKeys)
  );

  const defaultSelectedKeys = createMemo(
    () => convertSelection(props.defaultSelectedKeys) ?? new Selection()
  );

  const [selectedKeys, setSelectedKeys] = createControlledSignal(
    () => selectedKeysProp(),
    untrack(() => {
      const currentDefaultSelectedKeys = defaultSelectedKeys();

      return currentDefaultSelectedKeys;
    }),
    (value) => {
      props.onSelectionChange?.(value);
    }
  );

  const disabledKeysProp = createMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  const [selectionBehavior, setSelectionBehavior] = createSignal(
    untrack(() => selectionBehaviorProp()),
    { ownedWrite: true }
  );

  createRenderEffect(
    () => ({
      behavior: selectionBehavior(),
      keys: selectedKeys(),
      preferredBehavior: selectionBehaviorProp(),
    }),
    ({ behavior, keys, preferredBehavior }) => {
      if (
        preferredBehavior === "replace" &&
        behavior === "toggle" &&
        typeof keys === "object" &&
        keys.size === 0
      ) {
        setSelectionBehavior("replace");
      }
    }
  );
  createRenderEffect(selectionBehaviorProp, setSelectionBehavior, {
    defer: true,
  });

  return {
    get childFocusStrategy() {
      focusedKey();

      return childFocusStrategyRef;
    },
    get disabledBehavior() {
      return disabledBehavior();
    },
    get disabledKeys() {
      return disabledKeysProp();
    },
    get disallowEmptySelection() {
      return disallowEmptySelection();
    },
    get focusedKey() {
      focusedKey();

      return focusedKeyRef;
    },
    get isFocused() {
      focused();

      return isFocusedRef;
    },
    get selectedKeys() {
      return selectedKeys() ?? new Selection();
    },
    get selectionBehavior() {
      return selectionBehavior();
    },
    get selectionMode() {
      return selectionMode();
    },
    setFocused(f) {
      isFocusedRef = f;
      setFocused(f);
    },
    setFocusedKey(k, childFocusStrategy = "first") {
      focusedKeyRef = k;
      childFocusStrategyRef = childFocusStrategy;
      setFocusedKey((previous) => previous + 1);
    },
    setSelectedKeys(keys) {
      const currentAllowDuplicateSelectionEvents =
        allowDuplicateSelectionEvents();

      const currentSelectedKeys = selectedKeys();

      if (
        currentAllowDuplicateSelectionEvents === true ||
        !equalSets(keys, currentSelectedKeys)
      ) {
        setSelectedKeys(keys);
      }
    },
    setSelectionBehavior: (value) => {
      setSelectionBehavior(value);
    },
  };
}

function convertSelection(
  selection: "all" | Iterable<Key> | null | undefined,
  defaultValue?: Selection
): "all" | Set<Key> | undefined {
  if (selection === null || selection === undefined) {
    return defaultValue;
  }

  return selection === "all" ? "all" : new Selection(selection);
}
