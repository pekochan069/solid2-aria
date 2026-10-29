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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useDroppableCollection.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DroppableCollectionState } from "@solid2-aria/stately/dnd/create-droppable-collection-state";
import type {
  Collection,
  DropEvent,
  DropOperation,
  DroppableCollectionDropEvent,
  DroppableCollectionProps,
  DropPosition,
  DropTarget,
  DropTargetDelegate,
  Key,
  KeyboardDelegate,
  Node,
} from "@solid2-aria/types-shared";
import { createEffect, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

import { createLocale } from "../i18n/i18n-provider";
import { setInteractionModality } from "../interactions/create-focus-visible";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { requireValue } from "../utils/require-value";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { createAutoScroll } from "./create-auto-scroll";
import { createDrop } from "./create-drop";
import * as DragManager from "./drag-manager";
import { navigate } from "./drop-target-keyboard-navigation";
import {
  clearGlobalDnDState,
  DIRECTORY_DRAG_TYPE,
  droppableCollectionMap,
  getTypes,
  globalDndState,
  isInternalDropOperation,
  setDropCollectionRef,
} from "./utils";

export interface DroppableCollectionOptions extends DroppableCollectionProps {
  /** A delegate object that implements behavior for keyboard focus movement. */
  keyboardDelegate: KeyboardDelegate;
  /** A delegate object that provides drop targets for pointer coordinates within the collection. */
  dropTargetDelegate: DropTargetDelegate;
  /** A custom keyboard event handler for drop targets. */
  onKeyDown?: (e: KeyboardEvent) => void;
}

export interface DroppableCollectionResult {
  /** Props for the collection element. */
  collectionProps: HTMLAttributes;
}

interface DroppingState {
  collection: Collection<Node<unknown>>;
  focusedKey: Key | null;
  selectedKeys: Set<Key>;
  target: DropTarget;
  draggingKeys: Set<Key | null | undefined>;
  isInternal: boolean;
  timeout: ReturnType<typeof setTimeout> | undefined;
}

/**
 * Handles drop interactions for a collection component, with support for traditional mouse and
 * touch based drag and drop, in addition to full parity for keyboard and screen reader users.
 */
export function createDroppableCollection(
  props: DroppableCollectionOptions,
  state: DroppableCollectionState,
  ref: Accessor<HTMLElement | null>
): DroppableCollectionResult {
  interface DroppableCollectionLocalState {
    props: DroppableCollectionOptions;
    state: DroppableCollectionState;
    nextTarget: DropTarget | null;
    dropOperation: DropOperation | null;
  }

  const localState: DroppableCollectionLocalState = {
    dropOperation: null,
    nextTarget: null,
    props,
    state,
  };

  localState.props = props;
  localState.state = state;

  const defaultOnDrop = (e: DroppableCollectionDropEvent) => {
    const {
      onInsert,
      onRootDrop,
      onItemDrop,
      onReorder,
      onMove,
      acceptedDragTypes = "all",
      shouldAcceptItemDrop,
    } = localState.props;

    const { draggingKeys } = globalDndState;
    const isInternal = isInternalDropOperation(ref);
    const { target, dropOperation, items } = e;
    let filteredItems = items;

    if (acceptedDragTypes !== "all" || shouldAcceptItemDrop) {
      filteredItems = items.filter((item) => {
        let itemTypes: Set<string | symbol>;

        if (item.kind === "directory") {
          itemTypes = new Set([DIRECTORY_DRAG_TYPE]);
        } else {
          itemTypes = item.kind === "file" ? new Set([item.type]) : item.types;
        }

        if (
          acceptedDragTypes === "all" ||
          acceptedDragTypes.some((type) => itemTypes.has(type))
        ) {
          // If we are performing a on item drop, check if the item in question accepts the dropped item since the item may have heavier restrictions
          // than the droppable collection itself
          if (
            target.type === "item" &&
            target.dropPosition === "on" &&
            shouldAcceptItemDrop
          ) {
            return shouldAcceptItemDrop(target, itemTypes);
          }

          return true;
        }

        return false;
      });
    }

    if (filteredItems.length > 0) {
      if (target.type === "root" && onRootDrop) {
        onRootDrop({ dropOperation, items: filteredItems });
      }

      if (target.type === "item") {
        if (target.dropPosition === "on" && onItemDrop) {
          onItemDrop({
            dropOperation,
            isInternal,
            items: filteredItems,
            target,
          });
        }

        if (onMove && isInternal) {
          onMove({ dropOperation, keys: draggingKeys, target });
        }

        if (target.dropPosition !== "on") {
          if (!isInternal && onInsert) {
            onInsert({ dropOperation, items: filteredItems, target });
          }

          if (isInternal && onReorder) {
            onReorder({ dropOperation, keys: draggingKeys, target });
          }
        }
      }
    }
  };

  const autoScroll = createAutoScroll(ref);

  let droppingState: DroppingState | null = null;

  const onDrop = (e: DropEvent, target: DropTarget) => {
    const { state: currentState2 } = localState;
    // Save some state of the collection/selection before the drop occurs so we can compare later.
    droppingState = {
      collection: currentState2.collection,
      draggingKeys: globalDndState.draggingKeys,
      focusedKey: currentState2.selectionManager.focusedKey,
      isInternal: isInternalDropOperation(ref),
      selectedKeys: currentState2.selectionManager.selectedKeys,
      target,
      timeout: undefined,
    };
    const onDropFn = getTruthyValue(localState.props.onDrop) ?? defaultOnDrop;
    onDropFn({
      dropOperation: e.dropOperation,
      items: e.items,
      target,
      type: "drop",

      x: e.x,
      y: e.y,
    });
    // Wait for a short time period after the onDrop is called to allow the data to be read asynchronously
    // and for React to re-render. If the collection didn't already change during this time (handled below),
    // update the focused key here.
    droppingState.timeout = setTimeout(() => {
      updateFocusAfterDrop();
      droppingState = null;
    }, 50);
  };

  const _result0 = createDrop({
    getDropOperationForPoint(types, allowedOperations, x, y) {
      const refElement = ref?.();

      const { draggingKeys, dropCollectionRef } = globalDndState;
      const isInternal = isInternalDropOperation(ref);

      const isValidDropTarget = (target: DropTarget) =>
        state.getDropOperation({
          allowedOperations,
          draggingKeys,
          isInternal,
          target,
          types,
        }) !== "cancel";

      let target = props.dropTargetDelegate.getDropTargetFromPoint(
        x,
        y,
        isValidDropTarget
      );

      if (!target) {
        localState.dropOperation = "cancel";
        localState.nextTarget = null;

        return "cancel";
      }

      localState.dropOperation = state.getDropOperation({
        allowedOperations,
        draggingKeys,
        isInternal,
        target,
        types,
      });

      // If the target doesn't accept the drop, see if the root accepts it instead.
      if (localState.dropOperation === "cancel") {
        const rootTarget: DropTarget = { type: "root" };

        const dropOperation = state.getDropOperation({
          allowedOperations,
          draggingKeys,
          isInternal,
          target: rootTarget,
          types,
        });

        if (dropOperation !== "cancel") {
          target = rootTarget;
          localState.dropOperation = dropOperation;
        }
      }

      // Only set dropCollectionRef if there is a valid drop target since we cleanup dropCollectionRef in onDropExit
      // which only runs when leaving a valid drop target or if the dropEffect become none (mouse dnd only).
      if (
        isTruthy(target) &&
        localState.dropOperation !== "cancel" &&
        refElement !== dropCollectionRef?.()
      ) {
        setDropCollectionRef(ref);
      }

      localState.nextTarget =
        localState.dropOperation === "cancel" ? null : target;

      return localState.dropOperation;
    },
    onDrop(e) {
      setDropCollectionRef(ref);

      if (state.target) {
        onDrop(e, state.target);
      }

      // If there wasn't a collection being tracked as a dragged collection, then we are in a case where a non RSP drag is dropped on a
      // RSP collection and thus we don't need to preserve the global DnD state for onDragEnd
      const { draggingCollectionRef } = globalDndState;

      if (!isPresent(draggingCollectionRef)) {
        clearGlobalDnDState();
      }
    },
    onDropActivate(e) {
      if (
        state.target?.type === "item" &&
        typeof props.onDropActivate === "function"
      ) {
        props.onDropActivate({
          target: state.target,
          type: "dropactivate",

          x: e.x,
          y: e.y,
        });
      }
    },
    onDropEnter() {
      if (isPresent(localState.nextTarget)) {
        state.setTarget(localState.nextTarget);
      }
    },
    onDropExit() {
      setDropCollectionRef(undefined);
      state.setTarget(null);
      autoScroll.stop();
    },
    onDropMove(e) {
      if (isPresent(localState.nextTarget)) {
        state.setTarget(localState.nextTarget);
      }

      autoScroll.move(e.x, e.y);
    },
    get ref() {
      return ref;
    },
  });

  function updateFocusAfterDrop(): void {
    const { state: currentState } = localState;

    if (droppingState) {
      const {
        target,
        collection: prevCollection,
        selectedKeys: prevSelectedKeys,
        focusedKey: prevFocusedKey,
        isInternal,
        draggingKeys,
      } = droppingState;

      // If an insert occurs during a drop, we want to immediately select these items to give
      // feedback to the user that a drop occurred. Only do this if the selection didn't change
      // since the drop started so we don't override if the user or application did something.
      if (
        currentState.collection.size > prevCollection.size &&
        currentState.selectionManager.isSelectionEqual(prevSelectedKeys)
      ) {
        const newKeys = insertedDropKeys(
          currentState.collection,
          prevCollection
        );

        currentState.selectionManager.setSelectedKeys(newKeys);

        // If the focused item didn't change since the drop occurred, also focus the first
        // inserted item. If selection is disabled, then also show the focus ring so there
        // is some indication that items were added.
        if (currentState.selectionManager.focusedKey === prevFocusedKey) {
          focusInsertedDropItem(
            currentState,
            newKeys,
            requireValue(droppingState, "Expected the active drop snapshot")
          );
        }
      } else if (
        isPresent(prevFocusedKey) &&
        currentState.selectionManager.focusedKey === prevFocusedKey &&
        isInternal &&
        target.type === "item" &&
        target.dropPosition !== "on" &&
        draggingKeys.has(
          currentState.collection.getItem(prevFocusedKey)?.parentKey
        )
      ) {
        // Focus row instead of cell when reordering.
        currentState.selectionManager.setFocusedKey(
          currentState.collection.getItem(prevFocusedKey)?.parentKey ?? null
        );
        setInteractionModality("keyboard");
      } else if (
        currentState.selectionManager.focusedKey === prevFocusedKey &&
        target.type === "item" &&
        target.dropPosition === "on" &&
        isPresent(currentState.collection.getItem(target.key))
      ) {
        // If focus didn't move already (e.g. due to an insert), and the user dropped on an item,
        // focus that item and show the focus ring to give the user feedback that the drop occurred.
        // Also show the focus ring if the focused key is not selected, e.g. in case of a reorder.
        currentState.selectionManager.setFocusedKey(target.key);
        setInteractionModality("keyboard");
      } else if (
        isPresent(currentState.selectionManager.focusedKey) &&
        !currentState.selectionManager.isSelected(
          currentState.selectionManager.focusedKey
        )
      ) {
        setInteractionModality("keyboard");
      }

      currentState.selectionManager.setFocused(true);
    }
  }

  onSettled(() => () => {
    if (droppingState) {
      clearTimeout(droppingState.timeout);
    }
  });
  createEffect(
    () => state.collection,
    (collection) => {
      if (droppingState && collection !== droppingState.collection) {
        updateFocusAfterDrop();
      }
    }
  );
  const _result1 = createLocale();

  const getNextTarget = (
    target: DropTarget | null | undefined,
    wrap = true,
    key: "left" | "right" | "up" | "down" = "down"
  ) =>
    navigate(
      localState.props.keyboardDelegate,
      localState.state.collection,
      target,
      key,
      _result1.direction === "rtl",
      wrap
    );

  const getPreviousTarget = (
    target: DropTarget | null | undefined,
    wrap = true
  ) => getNextTarget(target, wrap, "up");

  const nextValidTarget = (
    target: DropTarget | null | undefined,
    types: Set<string>,
    allowedDropOperations: DropOperation[],
    getNextTargetValue: (
      target: DropTarget | null | undefined,
      wrap: boolean
    ) => DropTarget | null,
    wrap = true
  ): DropTarget | null => {
    let currentTarget = target;

    let seenRoot = 0;
    let operation: DropOperation;
    const { draggingKeys } = globalDndState;
    const isInternal = isInternalDropOperation(ref);

    do {
      const nextTarget = getNextTargetValue(currentTarget, wrap);

      if (!nextTarget) {
        return null;
      }

      currentTarget = nextTarget;
      operation = localState.state.getDropOperation({
        allowedOperations: allowedDropOperations,
        draggingKeys,
        isInternal,
        target: nextTarget,
        types,
      });

      if (currentTarget.type === "root") {
        seenRoot += 1;
      }
    } while (
      operation === "cancel" &&
      !localState.state.isDropTarget(currentTarget) &&
      seenRoot < 2
    );

    if (operation === "cancel") {
      return null;
    }

    return currentTarget;
  };

  function navigateDropPageDown(
    drag: Parameters<typeof DragManager.beginDragging>[0],
    types: ReturnType<typeof getTypes>,
    keyboardDelegate: KeyboardDelegate
  ): void {
    if (keyboardDelegate.getKeyPageBelow) {
      let { target } = localState.state;

      if (target) {
        // If on the root, go to the item a page below the top. Otherwise a page below the current item.
        let targetKey = keyboardDelegate.getFirstKey?.();

        if (target.type === "item") {
          targetKey = target.key;
        }

        let nextKey: Key | null = null;

        if (isPresent(targetKey)) {
          nextKey = keyboardDelegate.getKeyPageBelow(targetKey);
        }

        let dropPosition =
          target.type === "item" ? target.dropPosition : "after";

        // If there is no next key, or we are starting on the last key, jump to the last possible position.
        if (
          !isPresent(nextKey) ||
          (target.type === "item" &&
            target.key === keyboardDelegate.getLastKey?.())
        ) {
          nextKey = keyboardDelegate.getLastKey?.() ?? null;
          dropPosition = "after";
        }

        if (!isPresent(nextKey)) {
          return;
        }

        target = {
          dropPosition,
          key: nextKey,
          type: "item",
        };

        // If the target does not accept the drop, find the next valid target.
        // If no next valid target, find the previous valid target.
        const { draggingCollectionRef, draggingKeys } = globalDndState;

        const isInternal = draggingCollectionRef?.() === ref?.();

        const operation = localState.state.getDropOperation({
          allowedOperations: drag.allowedDropOperations,
          draggingKeys,
          isInternal,
          target,
          types,
        });

        if (operation === "cancel") {
          target =
            nextValidTarget(
              target,
              types,
              drag.allowedDropOperations,
              getNextTarget,
              false
            ) ??
            nextValidTarget(
              target,
              types,
              drag.allowedDropOperations,
              getPreviousTarget,
              false
            );
        }
      } else {
        target = nextValidTarget(
          null,
          types,
          drag.allowedDropOperations,
          getNextTarget
        );
      }

      localState.state.setTarget(target ?? localState.state.target);
    }
  }

  function navigateDropPageUp(
    drag: Parameters<typeof DragManager.beginDragging>[0],
    types: ReturnType<typeof getTypes>,
    keyboardDelegate: KeyboardDelegate
  ): void {
    if (!keyboardDelegate.getKeyPageAbove) {
      return;
    }

    let { target } = localState.state;

    if (!target) {
      target = nextValidTarget(
        null,
        types,
        drag.allowedDropOperations,
        getPreviousTarget
      );
    } else if (target.type === "item") {
      // If at the top already, switch to the root. Otherwise navigate a page up.
      if (target.key === keyboardDelegate.getFirstKey?.()) {
        target = {
          type: "root",
        };
      } else {
        let nextKey: Key | null | undefined = keyboardDelegate.getKeyPageAbove(
          target.key
        );

        let { dropPosition } = target;

        if (!isPresent(nextKey)) {
          nextKey = keyboardDelegate.getFirstKey?.();
          dropPosition = "before";
        }

        if (!isPresent(nextKey)) {
          return;
        }

        target = {
          dropPosition,
          key: nextKey,
          type: "item",
        };
      }

      // If the target does not accept the drop, find the previous valid target.
      // If no next valid target, find the next valid target.
      const { draggingKeys } = globalDndState;
      const isInternal = isInternalDropOperation(ref);

      const operation = localState.state.getDropOperation({
        allowedOperations: drag.allowedDropOperations,
        draggingKeys,
        isInternal,
        target,
        types,
      });

      if (operation === "cancel") {
        target =
          nextValidTarget(
            target,
            types,
            drag.allowedDropOperations,
            getPreviousTarget,
            false
          ) ??
          nextValidTarget(
            target,
            types,
            drag.allowedDropOperations,
            getNextTarget,
            false
          );
      }
    }

    localState.state.setTarget(target ?? localState.state.target);
  }

  createEffect(
    () => ({ direction: _result1.direction, element: ref() }),
    ({ element: refElement }): undefined | (() => void) => {
      if (!refElement) {
        return undefined;
      }

      return DragManager.registerDropTarget({
        element: refElement,
        getDropOperation(types, allowedOperations) {
          if (localState.state.target) {
            const { draggingKeys } = globalDndState;
            const isInternal = isInternalDropOperation(ref);

            return localState.state.getDropOperation({
              allowedOperations,
              draggingKeys,
              isInternal,
              target: localState.state.target,
              types,
            });
          }

          // Check if any of the targets accept the drop.
          // Follow-up: should we have a faster way of doing this or e.g. for pagination?
          const target = nextValidTarget(
            null,
            types,
            allowedOperations,
            getNextTarget
          );

          return target ? "move" : "cancel";
        },
        onDrop(e, target) {
          setDropCollectionRef(ref);

          if (localState.state.target) {
            onDrop(e, getTruthyValue(target) ?? localState.state.target);
          }
        },
        onDropActivate(e, target) {
          if (
            target?.type === "item" &&
            target?.dropPosition === "on" &&
            typeof localState.props.onDropActivate === "function"
          ) {
            localState.props.onDropActivate({
              target,
              type: "dropactivate",

              x: e.x,
              y: e.y,
            });
          }
        },
        onDropEnter(e, drag) {
          const types = getTypes(drag.items);
          const { selectionManager } = localState.state;
          let target: DropTarget | null = null;
          // Update the drop collection ref tracker for useDroppableItem's getDropOperation isInternal check
          setDropCollectionRef(ref);
          // When entering the droppable collection for the first time, the default drop target
          // is after the focused key.
          let key: Key | null | undefined = selectionManager.focusedKey;
          let dropPosition: DropPosition = "after";

          // If the focused key is a cell, get the parent item instead.
          // For now, we assume that individual cells cannot be dropped on.
          const item = isPresent(key)
            ? localState.state.collection.getItem(key)
            : null;

          if (item?.type === "cell") {
            key = item.parentKey;
          }

          // If the focused item is also selected, the default drop target is after the last selected item.
          // But if the focused key is the first selected item, then default to before the first selected item.
          // This is to make reordering lists slightly easier. If you select top down, we assume you want to
          // move the items down. If you select bottom up, we assume you want to move the items up.
          if (isPresent(key) && selectionManager.isSelected(key)) {
            if (
              selectionManager.selectedKeys.size > 1 &&
              selectionManager.firstSelectedKey === key
            ) {
              dropPosition = "before";
            } else {
              key = selectionManager.lastSelectedKey;
            }
          }

          if (isPresent(key)) {
            target = {
              dropPosition,
              key,
              type: "item",
            };
            const { draggingKeys } = globalDndState;
            const isInternal = isInternalDropOperation(ref);

            // If the default target is not valid, find the next one that is.
            if (
              localState.state.getDropOperation({
                allowedOperations: drag.allowedDropOperations,
                draggingKeys,
                isInternal,
                target,
                types,
              }) === "cancel"
            ) {
              target =
                nextValidTarget(
                  target,
                  types,
                  drag.allowedDropOperations,
                  getNextTarget,
                  false
                ) ??
                nextValidTarget(
                  target,
                  types,
                  drag.allowedDropOperations,
                  getPreviousTarget,
                  false
                );
            }
          }

          // If no focused key, then start from the root.
          target ??= nextValidTarget(
            null,
            types,
            drag.allowedDropOperations,
            getNextTarget
          );

          localState.state.setTarget(target);
        },
        onDropExit() {
          setDropCollectionRef(undefined);
          localState.state.setTarget(null);
        },
        onDropTargetEnter(target) {
          localState.state.setTarget(target);
        },
        onKeyDown(e, drag) {
          const { keyboardDelegate } = localState.props;
          const types = getTypes(drag.items);

          switch (e.key) {
            case "ArrowDown": {
              if (keyboardDelegate.getKeyBelow) {
                const target = nextValidTarget(
                  localState.state.target,
                  types,
                  drag.allowedDropOperations,
                  (targetValue, wrap) =>
                    getNextTarget(targetValue, wrap, "down")
                );

                localState.state.setTarget(target);
              }

              break;
            }

            case "ArrowUp": {
              if (keyboardDelegate.getKeyAbove) {
                const target = nextValidTarget(
                  localState.state.target,
                  types,
                  drag.allowedDropOperations,
                  (targetValue2, wrap) =>
                    getNextTarget(targetValue2, wrap, "up")
                );

                localState.state.setTarget(target);
              }

              break;
            }

            case "ArrowLeft": {
              if (keyboardDelegate.getKeyLeftOf) {
                const target = nextValidTarget(
                  localState.state.target,
                  types,
                  drag.allowedDropOperations,
                  (targetValue3, wrap) =>
                    getNextTarget(targetValue3, wrap, "left")
                );

                localState.state.setTarget(target);
              }

              break;
            }

            case "ArrowRight": {
              if (keyboardDelegate.getKeyRightOf) {
                const target = nextValidTarget(
                  localState.state.target,
                  types,
                  drag.allowedDropOperations,
                  (targetValue4, wrap) =>
                    getNextTarget(targetValue4, wrap, "right")
                );

                localState.state.setTarget(target);
              }

              break;
            }

            case "Home": {
              if (keyboardDelegate.getFirstKey) {
                const target = nextValidTarget(
                  null,
                  types,
                  drag.allowedDropOperations,
                  getNextTarget
                );

                localState.state.setTarget(target);
              }

              break;
            }

            case "End": {
              if (keyboardDelegate.getLastKey) {
                const target = nextValidTarget(
                  null,
                  types,
                  drag.allowedDropOperations,
                  getPreviousTarget
                );

                localState.state.setTarget(target);
              }

              break;
            }

            case "PageDown": {
              navigateDropPageDown(drag, types, keyboardDelegate);
              break;
            }

            case "PageUp": {
              navigateDropPageUp(drag, types, keyboardDelegate);
              break;
            }

            default: {
              break;
            }
          }

          localState.props.onKeyDown?.(e);
        },
        preventFocusOnDrop: true,
      });
    },
    { ssrSource: "client" }
  );
  const id = createId();

  droppableCollectionMap.set(state, { id: id(), ref });

  return {
    get collectionProps() {
      return mergeProps(_result0.dropProps, {
        // Remove description from collection element. If dropping on the entire collection,
        // there should be a drop indicator that has this description, so no need to double announce.
        "aria-describedby": ariaValue(null),
        id: id(),
      });
    },
  };
}

function insertedDropKeys(
  collection: Collection<Node<unknown>>,
  previous: Collection<Node<unknown>>
): Set<Key> {
  const newKeys = new Set<Key>();
  let key = collection.getFirstKey();

  while (isPresent(key)) {
    const item = collection.getItem(key);

    if (item?.type === "item" && !previous.getItem(item.key)) {
      newKeys.add(item.key);
    }

    key =
      isTruthy(item?.hasChildNodes) &&
      collection.getItem(
        requireValue(item.lastChildKey, "Expected item.lastChildKey")
      )?.type === "item"
        ? requireValue(item.firstChildKey, "Expected item.firstChildKey")
        : collection.getKeyAfter(key);
  }

  return newKeys;
}

function focusInsertedDropItem(
  currentState: DroppableCollectionState,
  newKeys: Set<Key>,
  dropState: DroppingState
): void {
  let first: Key | null | undefined = newKeys.keys().next().value;

  if (isPresent(first)) {
    const item = currentState.collection.getItem(first);
    const dropTarget = dropState.target;

    const expandedKeys =
      "expandedKeys" in currentState.collection
        ? currentState.collection.expandedKeys
        : undefined;

    const isParentRowExpanded =
      expandedKeys instanceof Set && expandedKeys.has(item?.parentKey);

    // If this is a cell, focus the parent row.

    if (
      item &&
      (item?.type === "cell" ||
        (dropTarget.type === "item" &&
          dropTarget.dropPosition === "on" &&
          !isParentRowExpanded))
    ) {
      first = item.parentKey;
    }

    if (isPresent(first)) {
      currentState.selectionManager.setFocusedKey(first);
    }

    if (currentState.selectionManager.selectionMode === "none") {
      setInteractionModality("keyboard");
    }
  }
}
