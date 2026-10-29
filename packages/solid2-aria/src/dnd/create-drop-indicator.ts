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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useDropIndicator.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DroppableCollectionState } from "@solid2-aria/stately/dnd/create-droppable-collection-state";
import type {
  DropTarget,
  FocusableElement,
  Key,
} from "@solid2-aria/types-shared";
import { merge, createMemo } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/dnd/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import type { HTMLAttributes } from "../types";
import { ariaValue } from "../utils/aria-value";
import { createId } from "../utils/create-id";
import { isPresent } from "../utils/is-present";
import { isTruthy } from "../utils/truthy";
import { createDroppableItem } from "./create-droppable-item";
import * as DragManager from "./drag-manager";
import { getDroppableCollectionId } from "./utils";

export interface DropIndicatorProps {
  /** The drop target that the drop indicator represents. */
  target: DropTarget;
  /** The ref to the activate button. */
  activateButtonRef?: Accessor<FocusableElement | null>;
}

export interface DropIndicatorAria {
  /** Props for the drop indicator element. */
  dropIndicatorProps: HTMLAttributes;
  /** Whether the drop indicator is currently the active drop target. */
  isDropTarget: boolean;
  /**
   * Whether the drop indicator is hidden, both visually and from assistive technology.
   * Use this to determine whether to omit the element from the DOM entirely.
   */
  isHidden: boolean;
}

/**
 * Handles drop interactions for a target within a droppable collection.
 */
export function createDropIndicator(
  props: DropIndicatorProps,
  state: DroppableCollectionState,
  ref: Accessor<HTMLElement | null>
): DropIndicatorAria {
  const _result0 = props;
  const _result1 = state;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/dnd"
  );

  const dragSession = DragManager.createDragSession();
  const _result2 = createDroppableItem(props, state, ref);
  const id = createId();

  const getText = (key: Key | null) => {
    if (!isPresent(key)) {
      return "";
    }

    return (
      _result1.collection.getTextValue?.(key) ??
      _result1.collection.getItem(key)?.textValue ??
      ""
    );
  };

  let label = "";
  let labelledBy: string | undefined;

  if (_result0.target.type === "root") {
    label = stringFormatter.format("dropOnRoot");
    labelledBy = `${id()} ${getDroppableCollectionId(state)}`;
  } else if (_result0.target.dropPosition === "on") {
    label = stringFormatter.format("dropOnItem", {
      itemText: getText(_result0.target.key),
    });
  } else {
    let before: Key | null | undefined;
    let after: Key | null | undefined;

    if (_result0.target.dropPosition === "before") {
      const prevKey = _result1.collection.getItem(_result0.target.key)?.prevKey;

      const prevNode = isPresent(prevKey)
        ? _result1.collection.getItem(prevKey)
        : null;

      before = prevNode?.type === "item" ? prevNode.key : null;
    } else {
      before = _result0.target.key;
    }

    if (_result0.target.dropPosition === "after") {
      const nextKey = _result1.collection.getItem(_result0.target.key)?.nextKey;

      const nextNode = isPresent(nextKey)
        ? _result1.collection.getItem(nextKey)
        : null;

      after = nextNode?.type === "item" ? nextNode.key : null;
    } else {
      after = _result0.target.key;
    }

    if (isPresent(before) && after !== null && after !== undefined) {
      label = stringFormatter.format("insertBetween", {
        afterItemText: getText(after),
        beforeItemText: getText(before),
      });
    } else if (isPresent(before)) {
      label = stringFormatter.format("insertAfter", {
        itemText: getText(before),
      });
    } else if (isPresent(after)) {
      label = stringFormatter.format("insertBefore", {
        itemText: getText(after),
      });
    }
  }

  const isDropTarget = createMemo(() => state.isDropTarget(_result0.target));

  const ariaHidden = createMemo(() =>
    dragSession() ? _result2.dropProps["aria-hidden"] : "true"
  );

  // If aria-hidden, we are either not in a drag session or the drop target is invalid.
  // In that case, there's no need to render anything at all unless we need to show the indicator visually.
  return {
    get dropIndicatorProps() {
      return merge(_result2.dropProps, {
        get "aria-hidden"() {
          return ariaValue(ariaValue(ariaHidden()));
        },
        get "aria-label"() {
          return ariaValue(ariaValue(label));
        },
        get "aria-labelledby"() {
          return ariaValue(ariaValue(labelledBy));
        },
        get "aria-roledescription"() {
          return ariaValue(ariaValue(stringFormatter.format("dropIndicator")));
        },
        get id() {
          return id();
        },
        get tabindex() {
          return -1;
        },
      });
    },
    get isDropTarget() {
      return isDropTarget();
    },
    // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
    get isHidden() {
      return !isDropTarget() && isTruthy(ariaHidden());
    },
  };
}
