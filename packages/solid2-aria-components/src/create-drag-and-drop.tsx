/*
 * Copyright 2022 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/useDragAndDrop.tsx.
 * Modified for Solid Aria: compose owner-scoped Solid drag and drop factories with reactive options.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createDraggableCollection } from "@solid2-aria/core/dnd/create-draggable-collection";
import { createDraggableItem } from "@solid2-aria/core/dnd/create-draggable-item";
import { createDropIndicator } from "@solid2-aria/core/dnd/create-drop-indicator";
import { createDroppableCollection } from "@solid2-aria/core/dnd/create-droppable-collection";
import { createDroppableItem } from "@solid2-aria/core/dnd/create-droppable-item";
import { isVirtualDragging } from "@solid2-aria/core/dnd/drag-manager";
import { DragPreview } from "@solid2-aria/core/dnd/drag-preview";
import { ListDropTargetDelegate } from "@solid2-aria/core/dnd/list-drop-target-delegate";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { createDraggableCollectionState } from "@solid2-aria/stately/dnd/create-draggable-collection-state";
import type { DraggableCollectionStateOptions } from "@solid2-aria/stately/dnd/create-draggable-collection-state";
import { createDroppableCollectionState } from "@solid2-aria/stately/dnd/create-droppable-collection-state";
import type {
  DraggableCollectionProps,
  DroppableCollectionProps,
  Key,
  DragItem,
  DropTarget,
  DropTargetDelegate,
} from "@solid2-aria/types-shared";
import type { JSX } from "@solidjs/web";

export {
  DropIndicator,
  DropIndicatorContext,
  DragAndDropContext,
} from "./drag-and-drop";

export type {
  DropIndicatorProps,
  DropIndicatorRenderProps,
} from "./drag-and-drop";

export interface DragAndDropOptions<T = object>
  extends
    Omit<DraggableCollectionProps<T>, "preview" | "getItems">,
    DroppableCollectionProps {
  getItems?: (keys: Set<Key>, items: T[]) => DragItem[];
  renderDragPreview?: (
    items: DragItem[]
  ) => JSX.Element | { element: JSX.Element; x: number; y: number };
  renderDropIndicator?: (target: DropTarget) => JSX.Element;
  dropTargetDelegate?: DropTargetDelegate;
  isDisabled?: boolean;
}

export interface DragAndDropHooks<T = object> {
  createDraggableCollectionState?: (
    props: Omit<DraggableCollectionStateOptions<T>, "getItems">
  ) => ReturnType<typeof createDraggableCollectionState>;
  createDraggableCollection?: typeof createDraggableCollection;
  createDraggableItem?: typeof createDraggableItem;
  DragPreview?: typeof DragPreview;
  renderDragPreview?: DragAndDropOptions<T>["renderDragPreview"];
  isVirtualDragging?: typeof isVirtualDragging;
  createDroppableCollectionState?: typeof createDroppableCollectionState;
  createDroppableCollection?: typeof createDroppableCollection;
  createDroppableItem?: typeof createDroppableItem;
  createDropIndicator?: typeof createDropIndicator;
  renderDropIndicator?: DragAndDropOptions<T>["renderDropIndicator"];
  dropTargetDelegate?: DropTargetDelegate;
  ListDropTargetDelegate: typeof ListDropTargetDelegate;
}

export interface DragAndDrop<T = object> {
  dragAndDropHooks: DragAndDropHooks<T>;
}

export function createDragAndDrop<T = object>(
  options: DragAndDropOptions<T>
): DragAndDrop<T> {
  const hooks: DragAndDropHooks<T> = { ListDropTargetDelegate };

  if (options.getItems) {
    hooks.createDraggableCollectionState = (props) =>
      createDraggableCollectionState(
        mergeProps(props, options, {
          get getItems() {
            return options.getItems ?? (() => []);
          },
        })
      );
    hooks.createDraggableCollection = createDraggableCollection;
    hooks.createDraggableItem = createDraggableItem;
    hooks.DragPreview = DragPreview;
    hooks.isVirtualDragging = isVirtualDragging;
    Object.defineProperty(hooks, "renderDragPreview", {
      get: () => options.renderDragPreview,
    });
  }

  if (
    options.onDrop ||
    options.onInsert ||
    options.onItemDrop ||
    options.onReorder ||
    options.onMove ||
    options.onRootDrop
  ) {
    hooks.createDroppableCollectionState = (props) =>
      createDroppableCollectionState(mergeProps(props, options));
    hooks.createDroppableCollection = (props, state, ref) =>
      createDroppableCollection(mergeProps(props, options), state, ref);
    hooks.createDroppableItem = createDroppableItem;
    hooks.createDropIndicator = createDropIndicator;
    Object.defineProperties(hooks, {
      dropTargetDelegate: { get: () => options.dropTargetDelegate },
      renderDropIndicator: { get: () => options.renderDropIndicator },
    });
  }

  return { dragAndDropHooks: hooks };
}
