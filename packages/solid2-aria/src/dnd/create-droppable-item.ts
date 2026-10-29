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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useDroppableItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DroppableCollectionState } from "@solid2-aria/stately/dnd/create-droppable-collection-state";
import type { DropTarget, FocusableElement } from "@solid2-aria/types-shared";
import { merge, createMemo, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { isTruthy } from "../utils/truthy";
import { createVirtualDrop } from "./create-virtual-drop";
import * as DragManager from "./drag-manager";
import {
  getDroppableCollectionRef,
  getTypes,
  globalDndState,
  isInternalDropOperation,
} from "./utils";

export interface DroppableItemOptions {
  /** The drop target represented by the item. */
  target: DropTarget;
  /** The ref to the activate button. */
  activateButtonRef?: Accessor<FocusableElement | null>;
}

export interface DroppableItemResult {
  /** Props for the droppable element. */
  dropProps: HTMLAttributes;
  /** Whether the item is currently the active drop target. */
  isDropTarget: boolean;
}

/**
 * Handles drop interactions for an item within a collection component.
 */
export function createDroppableItem(
  options: DroppableItemOptions,
  state: DroppableCollectionState,
  ref: Accessor<HTMLElement | null>
): DroppableItemResult {
  const _result0 = createVirtualDrop();

  const droppableCollectionRef = createMemo(() =>
    getDroppableCollectionRef(state)
  );

  createEffect(
    () => ({
      activateButtonRef: options.activateButtonRef,
      collectionRef: droppableCollectionRef(),
      element: ref(),
      target: options.target,
    }),
    ({
      element,
      target,
      collectionRef,
      activateButtonRef,
    }): undefined | (() => void) => {
      if (!element) {
        return undefined;
      }

      return DragManager.registerDropItem({
        activateButtonRef,
        element,
        getDropOperation(types, allowedOperations) {
          const { draggingKeys } = globalDndState;

          return state.getDropOperation({
            allowedOperations,
            draggingKeys,
            isInternal: isInternalDropOperation(collectionRef),
            target,
            types,
          });
        },
        target,
      });
    }
  );
  const dragSession = DragManager.createDragSession();
  const _result1 = globalDndState;

  const isInternal = createMemo(() =>
    isInternalDropOperation(droppableCollectionRef())
  );

  const isValidDropTarget = createMemo(() => {
    const session = dragSession();

    return (
      session &&
      state.getDropOperation({
        allowedOperations: session.dragTarget.allowedDropOperations,
        draggingKeys: _result1.draggingKeys,
        isInternal: isInternal(),
        target: options.target,
        types: getTypes(session.dragTarget.items),
      }) !== "cancel"
    );
  });

  const isDropTarget = createMemo(() => state.isDropTarget(options.target));
  createEffect(
    () => ({ active: !!dragSession() && isDropTarget(), element: ref() }),
    ({ element, active }) => {
      if (active && element) {
        element.focus();
      }
    }
  );

  return {
    get dropProps() {
      return merge(_result0.dropProps, {
        get "aria-hidden"() {
          return ariaValue(
            ariaValue(
              !dragSession() || isTruthy(isValidDropTarget())
                ? undefined
                : "true"
            )
          );
        },
      });
    },
    get isDropTarget() {
      return isDropTarget();
    },
  };
}
