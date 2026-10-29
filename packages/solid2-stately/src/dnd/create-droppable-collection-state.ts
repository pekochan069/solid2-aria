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
 * Derived from Adobe React Spectrum: packages/react-stately/src/dnd/useDroppableCollectionState.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  Collection,
  DragTypes,
  DropOperation,
  DroppableCollectionProps,
  DropTarget,
  ItemDropTarget,
  Key,
  Node,
} from "@solid2-aria/types-shared";
import { createMemo, createSignal } from "solid-js";

import type { MultipleSelectionManager } from "../selection/types";

interface DropOperationEvent {
  target: DropTarget;
  types: DragTypes;
  allowedOperations: DropOperation[];
  isInternal: boolean;
  draggingKeys: Set<Key>;
}

export interface DroppableCollectionStateOptions extends Omit<
  DroppableCollectionProps,
  "onDropMove" | "onDropActivate"
> {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** Whether the drop events should be disabled. */
  isDisabled?: boolean;
}

export interface DroppableCollectionState {
  /** A collection of items. */
  collection: Collection<Node<unknown>>;
  /** An interface for reading and updating multiple selection state. */
  selectionManager: MultipleSelectionManager;
  /** The current drop target. */
  target: DropTarget | null;
  /** Whether drop events are disabled. */
  isDisabled?: boolean;
  /** Sets the current drop target. */
  setTarget: (target: DropTarget | null) => void;
  /** Returns whether the given target is equivalent to the current drop target. */
  isDropTarget: (target: DropTarget | null) => boolean;
  /** Returns the drop operation for the given parameters. */
  getDropOperation: (e: DropOperationEvent) => DropOperation;
}

/**
 * Manages state for a droppable collection.
 */
export function createDroppableCollectionState(
  props: DroppableCollectionStateOptions
): DroppableCollectionState {
  const acceptedDragTypes = createMemo(() => props.acceptedDragTypes ?? "all");
  const isDisabled = createMemo(() => props.isDisabled);
  const onInsert = createMemo(() => props.onInsert);
  const onRootDrop = createMemo(() => props.onRootDrop);
  const onItemDrop = createMemo(() => props.onItemDrop);
  const onReorder = createMemo(() => props.onReorder);
  const onMove = createMemo(() => props.onMove);
  const shouldAcceptItemDrop = createMemo(() => props.shouldAcceptItemDrop);
  const collection = createMemo(() => props.collection);
  const selectionManager = createMemo(() => props.selectionManager);
  const onDropEnter = createMemo(() => props.onDropEnter);
  const getDropOperation = createMemo(() => props.getDropOperation);
  const onDrop = createMemo(() => props.onDrop);

  const [target, setTarget] = createSignal<DropTarget | null>(null, {
    ownedWrite: true,
  });

  let targetRef: DropTarget | null = null;

  const getOppositeTarget = (
    localTarget: ItemDropTarget
  ): ItemDropTarget | null => {
    const currentCollection = collection();

    if (localTarget.dropPosition === "before") {
      const node = currentCollection.getItem(localTarget.key);

      return node && node.prevKey !== null && node.prevKey !== undefined
        ? { dropPosition: "after", key: node.prevKey, type: "item" }
        : null;
    } else if (localTarget.dropPosition === "after") {
      const node = currentCollection.getItem(localTarget.key);

      return node && node.nextKey !== null && node.nextKey !== undefined
        ? { dropPosition: "before", key: node.nextKey, type: "item" }
        : null;
    }

    return null;
  };

  const defaultGetDropOperation = (e: DropOperationEvent) => {
    const currentIsDisabled = isDisabled();
    const currentAcceptedDragTypes = acceptedDragTypes();
    const initialOnInsert = onInsert();
    const initialOnReorder = onReorder();
    const initialCollection = collection();
    const initialShouldAcceptItemDrop = shouldAcceptItemDrop();
    const initialOnMove = onMove();
    const initialOnRootDrop = onRootDrop();
    const initialOnItemDrop = onItemDrop();
    const currentOnDrop = onDrop();
    const currentGetDropOperation = getDropOperation();

    const {
      target: localTarget,
      types,
      allowedOperations,
      isInternal,
      draggingKeys,
    } = e;

    if (currentIsDisabled === true) {
      return "cancel";
    }

    if (
      currentAcceptedDragTypes === "all" ||
      currentAcceptedDragTypes.some((type) => types.has(type))
    ) {
      const isValidInsert = () =>
        initialOnInsert &&
        localTarget.type === "item" &&
        !isInternal &&
        (localTarget.dropPosition === "before" ||
          localTarget.dropPosition === "after");

      const isValidReorder = () =>
        initialOnReorder &&
        localTarget.type === "item" &&
        isInternal &&
        (localTarget.dropPosition === "before" ||
          localTarget.dropPosition === "after") &&
        isDraggingWithinParent(initialCollection, localTarget, draggingKeys);

      const isItemDropAllowed = () =>
        localTarget.type !== "item" ||
        localTarget.dropPosition !== "on" ||
        !initialShouldAcceptItemDrop ||
        initialShouldAcceptItemDrop(localTarget, types);

      const isValidMove = () =>
        initialOnMove &&
        localTarget.type === "item" &&
        isInternal &&
        isItemDropAllowed();

      // Feedback was that internal root drop was weird so preventing that from happening
      const isValidRootDrop = () =>
        initialOnRootDrop && localTarget.type === "root" && !isInternal;

      // Automatically prevent items (i.e. folders) from being dropped on themselves.
      const isValidOnItemDrop = () =>
        initialOnItemDrop &&
        localTarget.type === "item" &&
        localTarget.dropPosition === "on" &&
        (!isInternal ||
          localTarget.key === null ||
          localTarget.key === undefined ||
          !draggingKeys.has(localTarget.key)) &&
        isItemDropAllowed();

      if (
        currentOnDrop ||
        isValidInsert() === true ||
        isValidReorder() === true ||
        isValidMove() === true ||
        isValidRootDrop() === true ||
        isValidOnItemDrop() === true
      ) {
        if (currentGetDropOperation) {
          return currentGetDropOperation(localTarget, types, allowedOperations);
        }

        return allowedOperations[0] ?? "cancel";
      }
    }

    return "cancel";
  };

  return {
    get collection() {
      return collection();
    },
    getDropOperation(e) {
      const currentCollection = collection();
      const { target: localTarget, isInternal, draggingKeys } = e;

      // Prevent dropping items onto themselves or their descendants
      if (isInternal && localTarget.type === "item" && draggingKeys.size > 0) {
        if (
          draggingKeys.has(localTarget.key) &&
          localTarget.dropPosition === "on"
        ) {
          return "cancel";
        }

        let currentKey: Key | null = localTarget.key;

        while (currentKey !== null && currentKey !== undefined) {
          const item = currentCollection.getItem(currentKey);
          const parentKey = item?.parentKey;

          if (
            parentKey !== null &&
            parentKey !== undefined &&
            draggingKeys.has(parentKey)
          ) {
            return "cancel";
          }

          currentKey = parentKey ?? null;
        }
      }

      return defaultGetDropOperation(e);
    },
    get isDisabled() {
      return isDisabled();
    },
    isDropTarget(dropTarget) {
      const localTarget = targetRef;

      if (!localTarget || !dropTarget) {
        return false;
      }

      if (isEqualDropTarget(dropTarget, localTarget)) {
        return true;
      }

      // Check if the targets point at the same point between two items, one referring before, and the other after.
      if (
        dropTarget?.type === "item" &&
        localTarget?.type === "item" &&
        dropTarget.key !== localTarget.key &&
        dropTarget.dropPosition !== localTarget.dropPosition &&
        dropTarget.dropPosition !== "on" &&
        localTarget.dropPosition !== "on"
      ) {
        return (
          isEqualDropTarget(getOppositeTarget(dropTarget), localTarget) ||
          isEqualDropTarget(dropTarget, getOppositeTarget(localTarget))
        );
      }

      return false;
    },
    get selectionManager() {
      return selectionManager();
    },
    setTarget(newTarget) {
      const currentOnDropEnter = onDropEnter();

      if (this.isDropTarget(newTarget)) {
        return;
      }

      const localTarget = targetRef;

      if (localTarget && typeof props.onDropExit === "function") {
        props.onDropExit({
          target: localTarget,
          type: "dropexit",

          x: 0,
          y: 0,
        });
      }

      if (newTarget && typeof currentOnDropEnter === "function") {
        currentOnDropEnter({
          target: newTarget,
          type: "dropenter",

          x: 0,
          y: 0,
        });
      }

      targetRef = newTarget ?? null;
      setTarget(newTarget ?? null);
    },
    get target() {
      return target();
    },
  };
}

function isEqualDropTarget(a?: DropTarget | null, b?: DropTarget | null) {
  if (!a) {
    return !b;
  }

  switch (a.type) {
    case "root": {
      return b?.type === "root";
    }

    case "item": {
      return (
        b?.type === "item" &&
        b?.key === a.key &&
        b?.dropPosition === a.dropPosition
      );
    }

    default: {
      break;
    }
  }

  return false;
}

function isDraggingWithinParent(
  collection: Collection<Node<unknown>>,
  target: ItemDropTarget,
  draggingKeys: Set<Key>
) {
  const targetNode = collection.getItem(target.key);

  for (const key of draggingKeys) {
    const node = collection.getItem(key);

    if (node?.parentKey !== targetNode?.parentKey) {
      return false;
    }
  }

  return true;
}
