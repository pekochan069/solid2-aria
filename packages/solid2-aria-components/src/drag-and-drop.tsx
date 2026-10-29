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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/DragAndDrop.tsx.
 * Modified for Solid Aria: contexts and indicator rendering use Solid reactive ownership.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DropIndicatorProps as AriaDropIndicatorProps } from "@solid2-aria/core/dnd/create-drop-indicator";
import { isPresent } from "@solid2-aria/core/utils/is-present";
import type { DraggableCollectionState } from "@solid2-aria/stately/dnd/create-draggable-collection-state";
import type { DroppableCollectionState } from "@solid2-aria/stately/dnd/create-droppable-collection-state";
import type { MultipleSelectionManager } from "@solid2-aria/stately/selection/types";
import type { ItemDropTarget, Key } from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";
import { untrack, createContext, useContext } from "solid-js";

import type { DragAndDropHooks } from "./create-drag-and-drop";
import type { Ref, RenderProps } from "./utils";

export interface DragAndDropContextValue {
  // oxlint-disable-next-line typescript/no-explicit-any -- The collection owner and its descendants share one item type through this context.
  dragAndDropHooks?: DragAndDropHooks<any>;
  dragState?: DraggableCollectionState;
  dropState?: DroppableCollectionState;
}

export interface DropIndicatorRenderProps {
  isDropTarget: boolean;
}

export interface DropIndicatorProps
  extends
    Omit<AriaDropIndicatorProps, "activateButtonRef">,
    RenderProps<DropIndicatorRenderProps> {
  ref?: Ref<HTMLElement>;
}

export const DragAndDropContext = createContext<DragAndDropContextValue>({});

export const DropIndicatorContext = createContext<{
  render: (props: DropIndicatorProps, ref?: Ref<HTMLElement>) => JSX.Element;
} | null>(null);

export function DropIndicator(props: DropIndicatorProps): JSX.Element {
  const context = useContext(DropIndicatorContext);

  if (!context) {
    throw new Error(
      "DropIndicator must be rendered in a droppable collection."
    );
  }

  return context.render(
    props,
    untrack(() => props.ref)
  );
}

export function createRenderDropIndicator<T>(
  hooks?: DragAndDropHooks<T>,
  state?: DroppableCollectionState
): ((target: ItemDropTarget) => JSX.Element) | undefined {
  if (!hooks?.createDropIndicator) {
    return undefined;
  }

  return (target): JSX.Element => {
    if (
      hooks.isVirtualDragging?.() !== true &&
      state?.isDropTarget(target) !== true
    ) {
      // oxlint-disable-next-line solid/components-return-once -- Static collection traversal and context registration are fixed when the owner is created.
      return null;
    }

    return (
      <>
        {hooks.renderDropIndicator ? (
          hooks.renderDropIndicator(target)
        ) : (
          <DropIndicator target={target} />
        )}
      </>
    );
  };
}

export function createDndPersistedKeys<T>(
  manager: MultipleSelectionManager,
  hooks?: DragAndDropHooks<T>,
  state?: DroppableCollectionState
): Set<Key> {
  let dropKey: Key | null = null;

  if (hooks?.isVirtualDragging?.() === true && state?.target?.type === "item") {
    dropKey = state.target.key;

    if (state.target.dropPosition === "after") {
      let next = state.collection.getKeyAfter(dropKey);
      let last: Key | null = null;
      const level = state.collection.getItem(dropKey)?.level ?? 0;

      while (isPresent(next)) {
        const node = state.collection.getItem(next);

        if (!node) {
          break;
        }

        if (node.type === "item") {
          if ((node.level ?? 0) <= level) {
            break;
          }

          last = next;
        }

        next = state.collection.getKeyAfter(next);
      }

      dropKey = next ?? last ?? dropKey;
    }
  }

  const keys = new Set<Key>();

  if (isPresent(manager.focusedKey)) {
    keys.add(manager.focusedKey);
  }

  if (isPresent(dropKey)) {
    keys.add(dropKey);
  }

  return keys;
}
