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
 * Derived from Adobe React Spectrum: packages/react-stately/src/steplist/useStepListState.ts.
 * Modified for Solid Aria: adapted imports, collection descriptors, and reactive state APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  CollectionBase,
  Key,
  Node,
  SingleSelection,
} from "@solid2-aria/types-shared";
import { createMemo, createRenderEffect, merge, untrack, omit } from "solid-js";

import { createSingleSelectListState } from "../list/create-single-select-list-state";
import type { SingleSelectListState } from "../list/create-single-select-list-state";
import { createControlledSignal } from "../utils/create-controlled-signal";
import { requireValue } from "../utils/require-value";

export interface StepListProps<T>
  extends CollectionBase<T>, Omit<SingleSelection, "onSelectionChange"> {
  /** The key of the last completed step (controlled). */
  lastCompletedStep?: Key;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /** Callback for when the last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /** Whether the step list is disabled. Steps will not be focusable or interactive. */
  isDisabled?: boolean;
  /** Whether the step list is read only. Steps will be focusable but non-interactive. */
  isReadOnly?: boolean;
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: Key) => void;
}

export interface StepListState<T> extends SingleSelectListState<T> {
  readonly lastCompletedStep?: Key;
  setLastCompletedStep: (key: Key) => void;
  isCompleted: (key: Key) => boolean;
  isSelectable: (key: Key) => boolean;
}

export function createStepListState<T extends object>(
  props: StepListProps<T>
): StepListState<T> {
  const state = createSingleSelectListState<T>(
    merge(omit(props, "onSelectionChange"), {
      get onSelectionChange() {
        return (key: Key | null) => {
          if (key !== null && key !== undefined) {
            props.onSelectionChange?.(key);
          }
        };
      },
    })
  );

  const [lastCompletedStep, setLastCompletedStep] =
    createControlledSignal<Key | null>(
      () => props.lastCompletedStep,
      untrack(() => props.defaultLastCompletedStep ?? null),
      untrack(() => props.onLastCompletedStepChange)
    );

  const stepMaps = createMemo(() => buildKeysMaps(state.collection));

  const selectedIdx = createMemo(() =>
    state.selectedKey === null || state.selectedKey === undefined
      ? 0
      : stepMaps().indexMap.get(state.selectedKey)
  );

  const isCompleted = (step: Key | null | undefined) => {
    if (step === undefined) {
      return false;
    }

    const completedStep = lastCompletedStep();
    const indexes = stepMaps().indexMap;
    const stepIndex = step === null ? undefined : indexes.get(step);

    const completedIndex =
      completedStep === null ? undefined : indexes.get(completedStep);

    return (
      stepIndex !== undefined &&
      completedIndex !== undefined &&
      stepIndex <= completedIndex
    );
  };

  const findDefaultSelectedKey = (
    collection: Collection<Node<T>> | null,
    disabledKeys: Set<Key>
  ) => {
    let selectedKey: Key | null = null;

    if (collection && collection.size > 0) {
      selectedKey = collection.getFirstKey();

      // loop over keys until we find one that isn't completed or disabled and select that
      while (
        selectedKey !== collection.getLastKey() &&
        selectedKey !== null &&
        selectedKey !== undefined &&
        (disabledKeys.has(selectedKey) || isCompleted(selectedKey))
      ) {
        selectedKey = collection.getKeyAfter(selectedKey);
      }
    }

    return selectedKey;
  };

  createRenderEffect(
    () => {
      const manager = state.selectionManager;
      let { selectedKey } = state;
      let replaceSelection = false;

      if (
        manager.isEmpty ||
        selectedKey === null ||
        !state.collection.getItem(selectedKey)
      ) {
        selectedKey = findDefaultSelectedKey(
          state.collection,
          state.disabledKeys
        );
        replaceSelection = selectedKey !== null;
      }

      const completedKey = lastCompletedStep();
      const maps = stepMaps();

      const lastCompletedIndex =
        (completedKey === null ? -1 : maps.indexMap.get(completedKey)) ?? -1;

      const index = selectedIdx();
      let completedStep: Key | undefined;

      if (
        index !== undefined &&
        index > 0 &&
        index > lastCompletedIndex + 1 &&
        selectedKey !== null &&
        maps.keysLinkedList.has(selectedKey)
      ) {
        completedStep = requireValue(
          maps.keysLinkedList.get(selectedKey),
          "Expected the selected step to have a preceding step."
        );
      }

      return {
        completedStep,
        manager,
        replaceSelection,
        selectedKey,
        updateFocus: manager.focusedKey === null,
      };
    },
    ({
      completedStep,
      manager,
      replaceSelection,
      selectedKey,
      updateFocus,
    }) => {
      if (replaceSelection && selectedKey !== null) {
        untrack(() => {
          manager.replaceSelection(selectedKey);
        });
      }

      if (updateFocus) {
        untrack(() => {
          manager.setFocusedKey(selectedKey);
        });
      }

      if (completedStep !== undefined) {
        setLastCompletedStep(completedStep);
      }
    }
  );

  function isSelectable(step: Key) {
    if (
      props.isDisabled === true ||
      state.disabledKeys.has(step) ||
      props.isReadOnly === true
    ) {
      return false;
    }

    if (isCompleted(step)) {
      return true;
    }

    const prevStep = stepMaps().keysLinkedList.get(step);

    return isCompleted(prevStep) || step === state.collection.getFirstKey();
  }

  function setSelectedKey(key: Key | null) {
    if (key === null) {
      state.setSelectedKey(null);

      return;
    }

    const prevKey = stepMaps().keysLinkedList.get(key);

    if (prevKey !== null && prevKey !== undefined && !isCompleted(prevKey)) {
      setLastCompletedStep(prevKey);
    }

    state.setSelectedKey(key);
  }

  return merge(state, {
    get isCompleted() {
      return isCompleted;
    },
    get isSelectable() {
      return isSelectable;
    },
    get lastCompletedStep() {
      return lastCompletedStep() ?? undefined;
    },
    get setLastCompletedStep() {
      return setLastCompletedStep;
    },
    get setSelectedKey() {
      return setSelectedKey;
    },
  });
}

function buildKeysMaps<T>(coll: Collection<Node<T>>) {
  const indexMap = new Map<Key, number>();
  const keysLinkedList = new Map<Key, Key | undefined>();
  let i = 0;
  let prev;

  for (const item of coll) {
    indexMap.set(item.key, i);
    keysLinkedList.set(item.key, prev?.key);
    prev = item;
    i += 1;
  }

  return {
    get indexMap() {
      return indexMap;
    },
    get keysLinkedList() {
      return keysLinkedList;
    },
  };
}
