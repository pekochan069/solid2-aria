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
 * Derived from Adobe React Spectrum: packages/react-aria-components/src/GridList.tsx.
 * Modified for Solid Aria: collections, selection, drag and drop, and DOM rendering use Solid 2 ownership and reactive getters; uses Solid class props.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DroppableCollectionOptions } from "@solid2-aria/core/dnd/create-droppable-collection";
import { ListKeyboardDelegate } from "@solid2-aria/core/selection/list-keyboard-delegate";
import type { HTMLAttributes } from "@solid2-aria/core/types";
import { mergeProps } from "@solid2-aria/core/utils/merge-props";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { createVisuallyHidden } from "@solid2-aria/core/visually-hidden/visually-hidden";
import type { DraggableCollectionState } from "@solid2-aria/stately/dnd/create-draggable-collection-state";
import type { DroppableCollectionState } from "@solid2-aria/stately/dnd/create-droppable-collection-state";
import type { MultipleSelectionManager } from "@solid2-aria/stately/selection/types";
import type {
  Collection as ICollection,
  Node,
  Key,
  DragPreviewRenderer,
  Orientation,
  KeyboardDelegate,
  DroppableCollectionProps,
  DropTargetDelegate,
} from "@solid2-aria/types-shared";
import { dynamic } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import {
  merge,
  untrack,
  createSignal,
  createMemo,
  useContext,
  Show,
} from "solid-js";
import type { Accessor } from "solid-js";

import type { DragAndDropHooks } from "./create-drag-and-drop";
import { DragAndDropContext } from "./drag-and-drop";
import type {
  DragAndDropContextValue,
  DropIndicatorProps,
} from "./drag-and-drop";
import { assignRef, dom, createRenderProps } from "./utils";

export interface CollectionDragAndDrop<T> {
  readonly collectionProps: HTMLAttributes | undefined;
  dragAndDropHooks: DragAndDropHooks<T> | undefined;
  dragState: DraggableCollectionState | undefined;
  dropState: DroppableCollectionState | undefined;
  readonly preview: JSX.Element;
}

export function createCollectionDragAndDrop<T>(options: {
  hooks?: DragAndDropHooks<T>;
  collection: ICollection<Node<T>>;
  selectionManager: MultipleSelectionManager;
  ref: Accessor<HTMLElement | null>;
  keyboardDelegate?: KeyboardDelegate;
  dropTargetCollection?: Iterable<Node<T>>;
  onDropActivate?: DroppableCollectionProps["onDropActivate"];
  onKeyDown?: DroppableCollectionOptions["onKeyDown"];
  dropTargetDelegate?: DropTargetDelegate;
  layout?: "stack" | "grid";
  orientation?: Orientation;
  direction?: "ltr" | "rtl";
}): CollectionDragAndDrop<T> {
  const hooks = untrack(() => options.hooks);

  const [previewRef, setPreviewRef] = createSignal<DragPreviewRenderer | null>(
    null,
    { ownedWrite: true }
  );

  const dragState = hooks?.createDraggableCollectionState?.({
    get collection() {
      return options.collection;
    },
    preview: hooks.renderDragPreview ? previewRef : undefined,
    get selectionManager() {
      return options.selectionManager;
    },
  });

  if (dragState) {
    hooks?.createDraggableCollection?.({}, dragState, options.ref);
  }

  const dropState = hooks?.createDroppableCollectionState?.({
    get collection() {
      return options.collection;
    },
    get selectionManager() {
      return options.selectionManager;
    },
  });

  const liveCollection: Iterable<Node<T>> = {
    [Symbol.iterator]() {
      return (options.dropTargetCollection ?? options.collection)[
        Symbol.iterator
      ]();
    },
  };

  const fallbackKeyboard = createMemo(
    () =>
      new ListKeyboardDelegate(
        options.collection,
        options.selectionManager.disabledKeys,
        options.ref
      )
  );

  const result = dropState
    ? hooks?.createDroppableCollection?.(
        {
          dropTargetDelegate:
            options.dropTargetDelegate ??
            hooks.dropTargetDelegate ??
            new hooks.ListDropTargetDelegate(liveCollection, options.ref, {
              direction: options.direction,
              layout: options.layout,
              orientation: options.orientation,
            }),
          get keyboardDelegate() {
            return options.keyboardDelegate ?? fallbackKeyboard();
          },
          onDropActivate: options.onDropActivate,
          onKeyDown: options.onKeyDown,
        },
        dropState,
        options.ref
      )
    : undefined;

  const Preview = hooks?.DragPreview;
  const renderDragPreview = hooks?.renderDragPreview;

  return {
    get collectionProps() {
      return result?.collectionProps;
    },
    dragAndDropHooks: hooks,
    dragState,
    dropState,
    get preview() {
      return (
        <>
          {Preview && renderDragPreview && (
            <Preview
              ref={(element: DragPreviewRenderer | null) => {
                setPreviewRef(() => element);
              }}
            >
              {renderDragPreview}
            </Preview>
          )}
        </>
      );
    },
  };
}

export function CollectionDropIndicator(
  props: DropIndicatorProps & { table?: boolean; columnCount?: number }
) {
  const context = useContext(DragAndDropContext);

  const [buttonRef, setButtonRef] = createSignal<HTMLDivElement | null>(null, {
    ownedWrite: true,
  });

  const aria = untrack(() =>
    requireValue(
      requireValue(
        context.dragAndDropHooks,
        "Expected context.dragAndDropHooks"
      ).createDropIndicator,
      "Expected context.dragAndDropHooks!.createDropIndicator"
    )(
      props,
      requireValue(context.dropState, "Expected context.dropState"),
      buttonRef
    )
  );

  const hidden = createVisuallyHidden();

  const render = createRenderProps(
    mergeProps(props, {
      defaultClass: "solid2-aria-DropIndicator",
      get values() {
        return { isDropTarget: aria.isDropTarget };
      },
    })
  );

  const Tag = dynamic(() => (props.table === true ? dom.tr : dom.div));
  const Cell = dynamic(() => (props.table === true ? dom.td : dom.div));

  return (
    <Show when={!aria.isHidden}>
      <Tag
        {...render}
        role="row"
        ref={(element: HTMLElement) => {
          assignRef(
            untrack(() => props.ref),
            element
          );
        }}
        data-drop-target={aria.isDropTarget || undefined}
      >
        <Cell role="gridcell" colspan={props.columnCount}>
          <div
            {...mergeProps(
              merge(() => hidden.visuallyHiddenProps ?? {}),
              merge(() => aria.dropIndicatorProps ?? {})
            )}
            role="button"
            ref={(element: HTMLDivElement) => {
              setButtonRef(element);
            }}
          />
          {render.children}
        </Cell>
      </Tag>
    </Show>
  );
}

export function createCollectionItemDragAndDrop(
  context: DragAndDropContextValue,
  key: Key,
  dropRef: Accessor<HTMLElement | null>,
  activateButtonRef?: Accessor<HTMLElement | null>
) {
  const drag = context.dragState
    ? context.dragAndDropHooks?.createDraggableItem?.(
        { hasDragButton: true, key },
        context.dragState
      )
    : undefined;

  const drop = context.dropState
    ? context.dragAndDropHooks?.createDropIndicator?.(
        {
          activateButtonRef,
          target: { dropPosition: "on", key, type: "item" },
        },
        context.dropState,
        dropRef
      )
    : undefined;

  return { drag, drop };
}
