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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useMove.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { MoveEvents, PointerType } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";

import { createGlobalListeners } from "../utils/create-global-listeners";
import { getOwnerWindow } from "../utils/dom-helpers";
import { isPresent } from "../utils/is-present";
import { getPointerType } from "../utils/pointer-type";
import { requireValue } from "../utils/require-value";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { disableTextSelection, restoreTextSelection } from "./text-selection";

export interface MoveResult {
  /** Props to spread on the target element. */
  moveProps: DOMAttributes;
}

interface MoveState {
  didMove: boolean;
  lastPosition: { pageX: number; pageY: number } | null;
  id: number | null;
}

interface EventBase {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

/**
 * Handles move interactions across mouse, touch, and keyboard, including dragging with
 * the mouse or touch, and using the arrow keys. Normalizes behavior across browsers and
 * platforms, and ignores emulated mouse events on touch devices.
 */

export function createMove(props: MoveEvents): MoveResult {
  const state: MoveState = { didMove: false, id: null, lastPosition: null };

  const _result1 = createGlobalListeners();

  const move = (
    originalEvent: EventBase,
    pointerType: PointerType,
    deltaX: number,
    deltaY: number
  ) => {
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    if (!state.didMove) {
      state.didMove = true;
      props.onMoveStart?.({
        altKey: originalEvent.altKey,
        ctrlKey: originalEvent.ctrlKey,
        metaKey: originalEvent.metaKey,
        pointerType,
        shiftKey: originalEvent.shiftKey,
        type: "movestart",
      });
    }

    props.onMove?.({
      altKey: originalEvent.altKey,
      ctrlKey: originalEvent.ctrlKey,
      deltaX,
      deltaY,
      metaKey: originalEvent.metaKey,
      pointerType,
      shiftKey: originalEvent.shiftKey,
      type: "move",
    });
  };

  const moveEvent = move;

  const end = (originalEvent: EventBase, pointerType: PointerType) => {
    restoreTextSelection();

    if (state.didMove) {
      props.onMoveEnd?.({
        altKey: originalEvent.altKey,
        ctrlKey: originalEvent.ctrlKey,
        metaKey: originalEvent.metaKey,
        pointerType,
        shiftKey: originalEvent.shiftKey,
        type: "moveend",
      });
    }
  };

  const endEvent = end;

  const start = () => {
    disableTextSelection();
    state.didMove = false;
  };

  const triggerKeyboardMove = (
    e: EventBase,
    deltaX: number,
    deltaY: number
  ) => {
    start();
    moveEvent(e, "keyboard", deltaX, deltaY);
    endEvent(e, "keyboard");
  };

  const movePropsValue: DOMAttributes = {};

  if (typeof PointerEvent === "undefined" && process.env.NODE_ENV === "test") {
    const onMouseMove = (e: MouseEvent) => {
      if (e.button === 0) {
        moveEvent(
          e,
          "mouse",
          e.pageX - (state.lastPosition?.pageX ?? 0),
          e.pageY - (state.lastPosition?.pageY ?? 0)
        );
        state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        endEvent(e, "mouse");
        const ownerWindow = getOwnerWindow(getEventTarget(e));
        _result1.removeGlobalListener(
          ownerWindow,
          "mousemove",
          onMouseMove,
          false
        );
        _result1.removeGlobalListener(ownerWindow, "mouseup", onMouseUp, false);
      }
    };

    movePropsValue.onMouseDown = (
      e: MouseEvent & { readonly currentTarget: Element }
    ) => {
      if (e.button === 0) {
        start();
        e.stopPropagation();
        e.preventDefault();
        state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
        const ownerWindow = getOwnerWindow(getEventTarget(e));
        _result1.addGlobalListener(
          ownerWindow,
          "mousemove",
          onMouseMove,
          false
        );
        _result1.addGlobalListener(ownerWindow, "mouseup", onMouseUp, false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = [...e.changedTouches].findIndex(
        ({ identifier }) => identifier === state.id
      );

      if (touch !== -1) {
        const { pageX, pageY } = requireValue(
          e.changedTouches[touch],
          "Expected e.changedTouches[touch]"
        );

        moveEvent(
          e,
          "touch",
          pageX - (state.lastPosition?.pageX ?? 0),
          pageY - (state.lastPosition?.pageY ?? 0)
        );
        state.lastPosition = { pageX, pageY };
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touch = [...e.changedTouches].findIndex(
        ({ identifier }) => identifier === state.id
      );

      if (touch !== -1) {
        endEvent(e, "touch");
        state.id = null;
        const ownerWindow = getOwnerWindow(getEventTarget(e));
        _result1.removeGlobalListener(ownerWindow, "touchmove", onTouchMove);
        _result1.removeGlobalListener(ownerWindow, "touchend", onTouchEnd);
        _result1.removeGlobalListener(ownerWindow, "touchcancel", onTouchEnd);
      }
    };

    movePropsValue.onTouchStart = (
      e: TouchEvent & { readonly currentTarget: Element }
    ) => {
      if (e.changedTouches.length === 0 || isPresent(state.id)) {
        return;
      }

      const { pageX, pageY, identifier } = requireValue(
        e.changedTouches[0],
        "Expected e.changedTouches[0]"
      );

      start();
      e.stopPropagation();
      e.preventDefault();
      state.lastPosition = { pageX, pageY };
      state.id = identifier;
      const ownerWindow = getOwnerWindow(getEventTarget(e));
      _result1.addGlobalListener(ownerWindow, "touchmove", onTouchMove, false);
      _result1.addGlobalListener(ownerWindow, "touchend", onTouchEnd, false);
      _result1.addGlobalListener(ownerWindow, "touchcancel", onTouchEnd, false);
    };
  } else {
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId === state.id) {
        const pointerType = getPointerType(e.pointerType);
        // Problems with PointerEvent#movementX/movementY:
        // 1. it is always 0 on macOS Safari.
        // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
        moveEvent(
          e,
          pointerType,
          e.pageX - (state.lastPosition?.pageX ?? 0),
          e.pageY - (state.lastPosition?.pageY ?? 0)
        );
        state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId === state.id) {
        const pointerType = getPointerType(e.pointerType);
        endEvent(e, pointerType);
        state.id = null;
        const ownerWindow = getOwnerWindow(getEventTarget(e));
        _result1.removeGlobalListener(
          ownerWindow,
          "pointermove",
          onPointerMove,
          false
        );
        _result1.removeGlobalListener(
          ownerWindow,
          "pointerup",
          onPointerUp,
          false
        );
        _result1.removeGlobalListener(
          ownerWindow,
          "pointercancel",
          onPointerUp,
          false
        );
      }
    };

    movePropsValue.onPointerDown = (
      e: PointerEvent & { readonly currentTarget: Element }
    ) => {
      if (e.button === 0 && !isPresent(state.id)) {
        start();
        e.stopPropagation();
        e.preventDefault();
        state.lastPosition = { pageX: e.pageX, pageY: e.pageY };
        state.id = e.pointerId;
        const ownerWindow = getOwnerWindow(getEventTarget(e));
        _result1.addGlobalListener(
          ownerWindow,
          "pointermove",
          onPointerMove,
          false
        );
        _result1.addGlobalListener(
          ownerWindow,
          "pointerup",
          onPointerUp,
          false
        );
        _result1.addGlobalListener(
          ownerWindow,
          "pointercancel",
          onPointerUp,
          false
        );
      }
    };
  }

  movePropsValue.onKeyDown = (e) => {
    switch (e.key) {
      case "Left":
      case "ArrowLeft": {
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, -1, 0);
        break;
      }

      case "Right":
      case "ArrowRight": {
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 1, 0);
        break;
      }

      case "Up":
      case "ArrowUp": {
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 0, -1);
        break;
      }

      case "Down":
      case "ArrowDown": {
        e.preventDefault();
        e.stopPropagation();
        triggerKeyboardMove(e, 0, 1);
        break;
      }

      default: {
        break;
      }
    }
  };

  return {
    get moveProps() {
      return movePropsValue;
    },
  };
}
