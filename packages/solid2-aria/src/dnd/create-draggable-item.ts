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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useDraggableItem.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DraggableCollectionState } from "@solid2-aria/stately/dnd/create-draggable-collection-state";
import type { Key } from "@solid2-aria/types-shared";
import { merge, omit, createMemo } from "solid-js";

import intlMessages from "../../intl/dnd/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createDescription } from "../utils/create-description";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import { createDrag } from "./create-drag";
import {
  clearGlobalDnDState,
  isInternalDropOperation,
  setDraggingKeys,
  createDragModality,
} from "./utils";

export interface DraggableItemProps {
  /** The key of the draggable item within the collection. */
  key: Key;
  /**
   * Whether the item has an explicit focusable drag affordance to initiate accessible drag and drop
   * mode. If true, the dragProps will omit these event handlers, and they will be applied to
   * dragButtonProps instead.
   */
  hasDragButton?: boolean;
  /**
   * Whether the item has a primary action (e.g. Enter key or long press) that would conflict with
   * initiating accessible drag and drop. If true, the Alt key must be held to start dragging with a
   * keyboard, and long press is disabled until selection mode is entered. This should be passed
   * from the associated collection item hook (e.g. useOption, useGridListItem, etc.).
   */
  hasAction?: boolean;
}

export interface DraggableItemResult {
  /** Props for the draggable item. */
  dragProps: HTMLAttributes;
  /** Props for the explicit drag button affordance, if any. */
  dragButtonProps: AriaButtonProps;
}

const MESSAGES = {
  keyboard: {
    notSelected: "dragDescriptionKeyboard",
    selected: "dragSelectedKeyboard",
  },
  touch: {
    notSelected: "dragDescriptionLongPress",
    selected: "dragSelectedLongPress",
  },
  virtual: {
    notSelected: "dragDescriptionVirtual",
    selected: "dragDescriptionVirtual",
  },
} as const;

/**
 * Handles drag interactions for an item within a draggable collection.
 */
export function createDraggableItem(
  props: DraggableItemProps,
  state: DraggableCollectionState
): DraggableItemResult {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/dnd"
  );

  const isDisabled = createMemo(
    () =>
      getTruthyValue(state.isDisabled) ??
      state.selectionManager.isDisabled(props.key)
  );

  const _result0 = createDrag({
    get getAllowedDropOperations() {
      return state.getAllowedDropOperations;
    },
    getItems() {
      return state.getItems(props.key);
    },
    get hasDragButton() {
      return props.hasDragButton;
    },
    get isDisabled() {
      return isDisabled();
    },
    onDragEnd(e) {
      const { dropOperation } = e;

      const isInternal =
        dropOperation === "cancel" ? false : isInternalDropOperation();

      state.endDrag({ ...e, isInternal, keys: state.draggingKeys });
      clearGlobalDnDState();
    },
    onDragMove(e) {
      state.moveDrag(e);
    },
    onDragStart(e) {
      state.startDrag(props.key, e);
      // Track draggingKeys for useDroppableCollection's default onDrop handler and useDroppableCollectionState's default getDropOperation
      setDraggingKeys(state.draggingKeys);
    },
    get preview() {
      return state.preview;
    },
    get shouldRequireAltKey() {
      return !isTruthy(props.hasDragButton) && isTruthy(props.hasAction);
    },
  });

  const item = createMemo(() => state.collection.getItem(props.key));

  const numKeysForDrag = createMemo(() => state.getKeysForDrag(props.key).size);

  const isSelected = createMemo(
    () => numKeysForDrag() > 1 && state.selectionManager.isSelected(props.key)
  );

  const modality = createDragModality();

  const hasCollectionSelection = createMemo(
    () =>
      !isTruthy(props.hasDragButton) &&
      state.selectionManager.selectionMode !== "none"
  );

  const description = createMemo(() => {
    let text: string | undefined;

    if (hasCollectionSelection()) {
      let message: keyof (typeof intlMessages)["en-US"] =
        MESSAGES[modality()][isSelected() ? "selected" : "notSelected"];

      if (isTruthy(props.hasAction) && modality() === "keyboard") {
        message = isSelected()
          ? "dragSelectedKeyboardAlt"
          : "dragDescriptionKeyboardAlt";
      }

      text = isSelected()
        ? stringFormatter.format(message, { count: numKeysForDrag() })
        : stringFormatter.format(message);
    }

    return text;
  });

  const dragButtonLabel = createMemo(() => {
    let text: string | undefined;

    if (!hasCollectionSelection()) {
      if (isSelected()) {
        text = stringFormatter.format("dragSelectedItems", {
          count: numKeysForDrag(),
        });
      } else {
        const itemText =
          state.collection.getTextValue?.(props.key) ?? item()?.textValue ?? "";

        text = stringFormatter.format("dragItem", { itemText });
      }
    }

    return text;
  });

  const descriptionProps = createDescription(description);

  const dragProps = createMemo(() => {
    const initialDragProps = _result0.dragProps;
    const collectionDragProps = omit(initialDragProps, "onClick");

    const selectionProps = hasCollectionSelection()
      ? collectionDragProps
      : initialDragProps;

    const mergedDescriptionProps = merge(selectionProps, descriptionProps);

    const describedProps = isTruthy(description())
      ? mergedDescriptionProps
      : selectionProps;

    if (
      !isTruthy(props.hasDragButton) &&
      isTruthy(props.hasAction) &&
      modality() === "touch"
    ) {
      const actionProps = omit(describedProps, "aria-describedby");

      return actionProps;
    }

    return describedProps;
  });

  return {
    get dragButtonProps() {
      return merge(_result0.dragButtonProps, {
        get "aria-label"() {
          return ariaValue(ariaValue(dragButtonLabel()));
        },
        get isDisabled() {
          return isDisabled();
        },
      });
    },
    get dragProps() {
      return isDisabled() ? {} : dragProps();
    },
  };
}
