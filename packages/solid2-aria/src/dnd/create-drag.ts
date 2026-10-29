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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dnd/useDrag.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  DragEndEvent,
  DragItem,
  DragMoveEvent,
  DragPreviewRenderer,
  DragStartEvent,
  DropOperation,
  PressEvent,
} from "@solid2-aria/types-shared";
import { merge, createMemo, onSettled, createSignal } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/dnd/index";
import type { AriaButtonProps } from "../button/create-button";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import type { DragEvent, HTMLAttributes } from "../types";
import { addBits } from "../utils/bit-mask";
import { createDescription } from "../utils/create-description";
import { createEvent } from "../utils/create-event";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { requireHTMLElement } from "../utils/dom-value";
import {
  isVirtualClick,
  isVirtualPointerEvent,
} from "../utils/is-virtual-event";
import { mergeProps } from "../utils/merge-props";
import { isIOS, isWebKit } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";
import {
  DROP_EFFECT_TO_DROP_OPERATION,
  DROP_OPERATION,
  EFFECT_ALLOWED,
} from "./constants";
import * as DragManager from "./drag-manager";
import {
  globalDropEffect,
  setGlobalAllowedDropOperations,
  setGlobalDropEffect,
  createDragModality,
  writeToDataTransfer,
} from "./utils";

export interface DragOptions {
  /** Handler that is called when a drag operation is started. */
  onDragStart?: (e: DragStartEvent) => void;
  /** Handler that is called when the drag is moved. */
  onDragMove?: (e: DragMoveEvent) => void;
  /**
   * Handler that is called when the drag operation is ended, either as a result of a drop or a
   * cancellation.
   */
  onDragEnd?: (e: DragEndEvent) => void;
  /** A function that returns the items being dragged. */
  getItems: () => DragItem[];
  /** The ref of the element that will be rendered as the drag preview while dragging. */
  preview?: Accessor<DragPreviewRenderer | null>;
  /**
   * Function that returns the drop operations that are allowed for the dragged items. If not
   * provided, all drop operations are allowed.
   */
  getAllowedDropOperations?: () => DropOperation[];
  /**
   * Whether the item has an explicit focusable drag affordance to initiate accessible drag and drop
   * mode. If true, the dragProps will omit these event handlers, and they will be applied to
   * dragButtonProps instead.
   */
  hasDragButton?: boolean;
  /** Whether keyboard drag activation requires Alt to avoid a collection action. */
  shouldRequireAltKey?: boolean;
  /**
   * Whether the drag operation is disabled. If true, the element will not be draggable.
   */
  isDisabled?: boolean;
}

export interface DragResult {
  /** Props for the draggable element. */
  dragProps: HTMLAttributes;
  /** Props for the explicit drag button affordance, if any. */
  dragButtonProps: AriaButtonProps;
  /** Whether the element is currently being dragged. */
  isDragging: boolean;
}

const MESSAGES = {
  keyboard: {
    end: "endDragKeyboard",
    start: "dragDescriptionKeyboard",
  },
  touch: {
    end: "endDragTouch",
    start: "dragDescriptionTouch",
  },
  virtual: {
    end: "endDragVirtual",
    start: "dragDescriptionVirtual",
  },
} as const;

/**
 * Handles drag interactions for an element, with support for traditional mouse and touch
 * based drag and drop, in addition to full parity for keyboard and screen reader users.
 */
export function createDrag(options: DragOptions): DragResult {
  const _result0 = options;

  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/dnd"
  );

  const state = {
    options,
    x: 0,
    y: 0,
  };

  state.options = options;
  let isDraggingRef: Element | null = null;

  const [isDragging, setDraggingState] = createSignal(false, {
    ownedWrite: true,
  });

  const setDragging = (element: Element | null) => {
    isDraggingRef = element;
    setDraggingState(!!element);
  };

  const _result1 = createGlobalListeners();
  let modalityOnPointerDown: string | null = null;

  const onDragStart = (e: DragEvent) => {
    if (!e.dataTransfer) {
      return;
    }

    if (e.defaultPrevented) {
      return;
    }

    // Prevent the drag event from propagating to any parent draggables
    e.stopPropagation();

    // If this drag was initiated by a mobile screen reader (e.g. VoiceOver or TalkBack), enter virtual dragging mode.
    if (modalityOnPointerDown === "virtual") {
      e.preventDefault();
      startDragging(requireHTMLElement(getEventTarget(e)));
      modalityOnPointerDown = null;

      return;
    }

    if (typeof options.onDragStart === "function") {
      options.onDragStart({
        type: "dragstart",
        x: e.clientX,
        y: e.clientY,
      });
    }

    const items = options.getItems();
    // Clear existing data (e.g. selected text on the page would be included in some browsers)
    e.dataTransfer.clearData?.();
    writeToDataTransfer(e.dataTransfer, items);
    let allowed: number = DROP_OPERATION.all;

    if (typeof options.getAllowedDropOperations === "function") {
      const allowedOperations = options.getAllowedDropOperations();
      allowed = DROP_OPERATION.none;

      for (const operation of allowedOperations) {
        allowed = addBits(
          allowed,
          DROP_OPERATION[operation] || DROP_OPERATION.none
        );
      }
    }

    setGlobalAllowedDropOperations(allowed);
    const effectAllowed = getTruthyValue(EFFECT_ALLOWED[allowed]) ?? "none";
    e.dataTransfer.effectAllowed = effectAllowed;

    // If there is a preview option, use it to render a custom preview image that will
    // appear under the pointer while dragging. If not, the element itself is dragged by the browser.
    const preview = options.preview?.();

    if (preview) {
      preview(items, (node, userX, userY) => {
        if (!node) {
          return;
        }

        // Compute the offset that the preview will appear under the mouse.
        // If possible, this is based on the point the user clicked on the target.
        // If the preview is much smaller, then just use the center point of the preview.
        const size = node.getBoundingClientRect();
        const rect = e.currentTarget.getBoundingClientRect();
        let defaultX = e.clientX - rect.x;
        let defaultY = e.clientY - rect.y;

        if (defaultX > size.width || defaultY > size.height) {
          defaultX = size.width / 2;
          defaultY = size.height / 2;
        }

        // Start with default offsets.
        let offsetX = defaultX;
        let offsetY = defaultY;

        // If the preview renderer supplied explicit offsets, use those.
        if (typeof userX === "number" && typeof userY === "number") {
          offsetX = userX;
          offsetY = userY;
        }

        // Clamp the offset so it stays within the preview bounds. Browsers
        // automatically clamp out-of-range values, but doing it ourselves
        // prevents the visible "snap" that can occur when the browser adjusts
        // them after the first drag update.
        offsetX = Math.max(0, Math.min(offsetX, size.width));
        offsetY = Math.max(0, Math.min(offsetY, size.height));
        // Rounding height to an even number prevents blurry preview seen on some screens
        const height = 2 * Math.round(size.height / 2);
        node.style.height = `${height}px`;
        requireValue(e.dataTransfer, "Expected e.dataTransfer").setDragImage(
          node,
          offsetX,
          offsetY
        );
      });
    }

    // Enforce that drops are handled by useDrop.
    _result1.addGlobalListener(
      window,
      "drop",
      (eValue) => {
        eValue.preventDefault();
        eValue.stopPropagation();
        console.warn(
          "Drags initiated with Solid2 Aria createDrag may only be dropped on a target created with createDrop. This ensures that a keyboard and screen reader accessible alternative is available."
        );
      },
      { once: true }
    );
    state.x = e.clientX;
    state.y = e.clientY;
    // Wait a frame before we set dragging to true so that the browser has time to
    // render the preview image before we update the element that has been dragged.
    const target = getEventTarget(e);
    requestAnimationFrame(() => {
      setDragging(target);
    });
  };

  const onDrag = (e: DragEvent) => {
    if (!e.dataTransfer) {
      return;
    }

    // Prevent the drag event from propagating to any parent draggables
    e.stopPropagation();

    if (e.clientX === state.x && e.clientY === state.y) {
      return;
    }

    if (typeof options.onDragMove === "function") {
      options.onDragMove({
        type: "dragmove",
        x: e.clientX,
        y: e.clientY,
      });
    }

    state.x = e.clientX;
    state.y = e.clientY;
  };

  const onDragEnd = (e: DragEvent) => {
    if (!e.dataTransfer) {
      return;
    }

    // Prevent the drag event from propagating to any parent draggables
    e.stopPropagation();

    if (typeof options.onDragEnd === "function") {
      const event: DragEndEvent = {
        dropOperation: DROP_EFFECT_TO_DROP_OPERATION[e.dataTransfer.dropEffect],
        type: "dragend",
        x: e.clientX,
        y: e.clientY,
      };

      // Chrome Android always returns none as its dropEffect so we use the drop effect set in useDrop via
      // onDragEnter/onDragOver instead. https://bugs.chromium.org/p/chromium/issues/detail?id=1353951
      if (globalDropEffect) {
        event.dropOperation = DROP_EFFECT_TO_DROP_OPERATION[globalDropEffect];
      }

      options.onDragEnd(event);
    }

    setDragging(null);
    _result1.removeAllGlobalListeners();
    setGlobalAllowedDropOperations(DROP_OPERATION.none);
    setGlobalDropEffect(undefined);
  };

  // If the dragged element is removed from the DOM via onDrop, onDragEnd won't fire: https://bugzilla.mozilla.org/show_bug.cgi?id=460801
  // In this case, we need to manually call onDragEnd on cleanup
  onSettled(() => () => {
    if (isDraggingRef) {
      if (typeof state.options.onDragEnd === "function") {
        const event: DragEndEvent = {
          dropOperation:
            DROP_EFFECT_TO_DROP_OPERATION[
              getTruthyValue(globalDropEffect) ?? "none"
            ],
          type: "dragend",
          x: 0,
          y: 0,
        };

        state.options.onDragEnd(event);
      }

      setDragging(null);
      setGlobalAllowedDropOperations(DROP_OPERATION.none);
      setGlobalDropEffect(undefined);
    }
  });

  const onPress = (e: PressEvent) => {
    if (e.pointerType !== "keyboard" && e.pointerType !== "virtual") {
      return;
    }

    startDragging(requireHTMLElement(e.target));
  };

  function startDragging(target: HTMLElement) {
    if (typeof state.options.onDragStart === "function") {
      const rect = target.getBoundingClientRect();
      state.options.onDragStart({
        type: "dragstart",
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      });
    }

    DragManager.beginDragging(
      {
        allowedDropOperations:
          typeof state.options.getAllowedDropOperations === "function"
            ? state.options.getAllowedDropOperations()
            : ["move", "copy", "link"],
        element: target,
        items: state.options.getItems(),
        onDragEnd(e) {
          setDragging(null);

          if (typeof state.options.onDragEnd === "function") {
            state.options.onDragEnd(e);
          }
        },
      },
      stringFormatter
    );
    setDragging(target);
  }

  const modality = createDragModality();

  const message = createMemo(() =>
    isDragging() ? MESSAGES[modality()].end : MESSAGES[modality()].start
  );

  const descriptionProps = createDescription(() =>
    stringFormatter.format(message())
  );

  const interactions = createMemo<HTMLAttributes>(() => {
    if (isTruthy(_result0.hasDragButton)) {
      return {};
    }

    // If there's no separate button to trigger accessible drag and drop mode,
    // then add event handlers to the draggable element itself to start dragging.
    // For keyboard, we use the Enter key in a capturing listener to prevent other
    // events such as selection from also occurring. We attempt to infer whether a
    // pointer event (e.g. long press) came from a touch screen reader, and then initiate
    // dragging in the native onDragStart listener above.
    return merge(descriptionProps, {
      onClick(e) {
        // Handle NVDA/JAWS in browse mode, and touch screen readers. In this case, no keyboard events are fired.
        if (isVirtualClick(e) || modalityOnPointerDown === "virtual") {
          e.preventDefault();
          e.stopPropagation();
          const target = getEventTarget(e);

          if (target instanceof HTMLElement) {
            startDragging(target);
          }
        }
      },
      onPointerDown(e) {
        modalityOnPointerDown = isVirtualPointerEvent(e)
          ? "virtual"
          : e.pointerType;

        // Try to detect virtual drag passthrough gestures.
        if (e.width < 1 && e.height < 1 && isIOS() && isWebKit()) {
          // iOS VoiceOver.
          modalityOnPointerDown = "virtual";
        } else {
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.x;
          const offsetY = e.clientY - rect.y;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          modalityOnPointerDown =
            Math.abs(offsetX - centerX) <= 0.5 &&
            Math.abs(offsetY - centerY) <= 0.5
              ? "virtual"
              : e.pointerType;
        }
      },
    } satisfies HTMLAttributes);
  });

  const [dragElement, setDragElement] = createSignal<HTMLElement | null>(null, {
    ownedWrite: true,
  });

  const canActivate = (event: globalThis.KeyboardEvent) =>
    !isTruthy(_result0.isDisabled) &&
    !isTruthy(_result0.hasDragButton) &&
    (!isTruthy(_result0.shouldRequireAltKey) || event.altKey) &&
    getEventTarget(event) === event.currentTarget &&
    event.key === "Enter";

  createEvent(
    dragElement,
    "keydown",
    (event) => {
      if (canActivate(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true }
  );
  createEvent(
    dragElement,
    "keyup",
    (event) => {
      if (canActivate(event)) {
        event.preventDefault();
        event.stopPropagation();
        startDragging(event.currentTarget);
      }
    },
    { capture: true }
  );

  const dragProps = mergeProps(merge(interactions), {
    get draggable() {
      return isTruthy(_result0.isDisabled)
        ? ("false" as const)
        : ("true" as const);
    },
    get onDrag() {
      return isTruthy(_result0.isDisabled) ? undefined : onDrag;
    },
    get onDragEnd() {
      return isTruthy(_result0.isDisabled) ? undefined : onDragEnd;
    },
    get onDragStart() {
      return isTruthy(_result0.isDisabled) ? undefined : onDragStart;
    },
    ref: setDragElement,
  });

  return {
    get dragButtonProps() {
      return merge(descriptionProps, {
        get onPress() {
          return onPress;
        },
      });
    },
    get dragProps() {
      return dragProps;
    },
    get isDragging() {
      return isDragging();
    },
  };
}
