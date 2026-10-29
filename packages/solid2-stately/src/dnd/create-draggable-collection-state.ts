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
 * Derived from Adobe React Spectrum: packages/react-stately/src/dnd/useDraggableCollectionState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  DraggableCollectionEndEvent,
  DraggableCollectionProps,
  DragItem,
  DragMoveEvent,
  DragPreviewRenderer,
  DragStartEvent,
  DropOperation,
  Key,
  Node,
} from "@solid2-aria/types-shared";
import type { Accessor } from "solid-js";
import { createMemo, createSignal, untrack } from "solid-js";

import type { MultipleSelectionManager } from "../selection/types";

export interface DraggableCollectionStateOptions<
  T = object,
> extends DraggableCollectionProps<T> {
  /** A collection of items. */
  collection: Collection<Node<T>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** Whether the drag events should be disabled. */
  isDisabled?: boolean;
}

export interface DraggableCollectionState {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** The key of the item that initiated a drag. */
  draggedKey: Key | null;
  /** The keys of the items that are currently being dragged. */
  draggingKeys: Set<Key>;
  /** Whether drag events are disabled. */
  isDisabled?: boolean;
  /** Returns whether the given key is currently being dragged. */
  isDragging: (key: Key) => boolean;
  /** Returns the keys of the items that will be dragged with the given key (e.g. selected items). */
  getKeysForDrag: (key: Key) => Set<Key>;
  /** Returns the items to drag for the given key. */
  getItems: (key: Key) => DragItem[];
  /** The ref of the element that will be rendered as the drag preview while dragging. */
  preview?: Accessor<DragPreviewRenderer | null>;
  /**
   * Function that returns the drop operations that are allowed for the dragged items. If not
   * provided, all drop operations are allowed.
   */
  getAllowedDropOperations?: () => DropOperation[];
  /** Begins a drag for the given key. This triggers the onDragStart event. */
  startDrag: (key: Key, event: DragStartEvent) => void;
  /** Triggers an onDragMove event. */
  moveDrag: (event: DragMoveEvent) => void;
  /** Ends the current drag, and emits an onDragEnd event. */
  endDrag: (event: DraggableCollectionEndEvent) => void;
}

/**
 * Manages state for a draggable collection.
 */
export function createDraggableCollectionState<T = object>(
  props: DraggableCollectionStateOptions<T>
): DraggableCollectionState {
  const getItems = createMemo(() => props.getItems);
  const isDisabled = createMemo(() => props.isDisabled);
  const collection = createMemo(() => props.collection);
  const selectionManager = createMemo(() => props.selectionManager);
  const onDragStart = createMemo(() => props.onDragStart);
  const onDragMove = createMemo(() => props.onDragMove);
  const onDragEnd = createMemo(() => props.onDragEnd);
  const preview = createMemo(() => props.preview);

  const getAllowedDropOperations = createMemo(
    () => props.getAllowedDropOperations
  );

  const [dragging, setDragging] = createSignal(0, { ownedWrite: true });

  let draggingKeys = untrack(() => new Set<Key>());
  let draggedKey: Key | null = null;

  const getKeys = (key: Key) => {
    const currentSelectionManager = selectionManager();
    const currentCollection = collection();
    // The clicked item is always added to the drag. If it is selected, then all of the
    // other selected items are also dragged. If it is not selected, then only the clicked
    // item is dragged. This matches native macOS behavior.
    // Additionally, we filter out any keys that are children of any of the other selected keys
    const keys = new Set<Key>();

    if (currentSelectionManager.isSelected(key)) {
      for (const currentKey of currentSelectionManager.selectedKeys) {
        const node = currentCollection.getItem(currentKey);

        if (node) {
          let isChild = false;
          let { parentKey } = node;

          while (parentKey !== null && parentKey !== undefined) {
            if (currentSelectionManager.selectedKeys.has(parentKey)) {
              isChild = true;
              break;
            }

            const parentNode = currentCollection.getItem(parentKey);
            parentKey = parentNode ? parentNode.parentKey : null;
          }

          if (!isChild) {
            keys.add(currentKey);
          }
        }
      }
    } else {
      keys.add(key);
    }

    return keys;
  };

  return {
    get collection() {
      return collection();
    },
    get draggedKey() {
      dragging();

      return draggedKey;
    },
    get draggingKeys() {
      dragging();

      return draggingKeys;
    },
    endDrag(event) {
      const currentOnDragEnd = onDragEnd();
      const { isInternal } = event;

      if (typeof currentOnDragEnd === "function") {
        currentOnDragEnd({
          ...event,
          isInternal,
          keys: draggingKeys,
        });
      }

      draggingKeys = new Set();
      draggedKey = null;
      setDragging((previous) => previous + 1);
    },
    get getAllowedDropOperations() {
      return getAllowedDropOperations();
    },
    getItems(key) {
      const currentCollection = collection();
      const currentGetItems = getItems();
      const keys = getKeys(key);
      const items: T[] = [];

      for (const localKey of keys) {
        const value = currentCollection.getItem(localKey)?.value;

        if (value !== null && value !== undefined) {
          items.push(value);
        }
      }

      return currentGetItems(getKeys(key), items);
    },
    get getKeysForDrag() {
      return getKeys;
    },
    get isDisabled() {
      return isDisabled();
    },
    isDragging(key) {
      dragging();

      return draggingKeys.has(key);
    },
    moveDrag(event) {
      const currentOnDragMove = onDragMove();

      if (typeof currentOnDragMove === "function") {
        currentOnDragMove({
          ...event,
          keys: draggingKeys,
        });
      }
    },
    get preview() {
      return preview();
    },
    get selectionManager() {
      return selectionManager();
    },
    startDrag(key, event) {
      const currentSelectionManager = selectionManager();
      const currentOnDragStart = onDragStart();
      const keys = getKeys(key);
      draggingKeys = keys;
      draggedKey = key;
      currentSelectionManager.setFocused(false);
      setDragging((previous) => previous + 1);

      if (typeof currentOnDragStart === "function") {
        currentOnDragStart({
          ...event,
          keys,
        });
      }
    },
  };
}
