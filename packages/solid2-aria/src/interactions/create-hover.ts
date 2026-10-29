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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useHover.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { HoverEvents } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { createEffect, createSignal, onSettled, untrack } from "solid-js";

import { createGlobalListeners } from "../utils/create-global-listeners";
import { getOwnerDocument } from "../utils/dom-helpers";
import { requireElement } from "../utils/dom-value";
import { getEventTarget, nodeContains } from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

export interface HoverProps extends HoverEvents {
  /** Whether the hover events should be disabled. */
  isDisabled?: boolean;
}

export interface HoverResult {
  /** Props to spread on the target element. */
  hoverProps: DOMAttributes;
  isHovered: boolean;
}

interface HoverState {
  ignoreEmulatedMouseEvents: boolean;
  isHovered: boolean;
  pointerType: string;
  target: HTMLElement | null;
}

// iOS fires onPointerEnter twice: once with pointerType="touch" and again with pointerType="mouse".
// We want to ignore these emulated events so they do not trigger hover behavior.
// See https://bugs.webkit.org/show_bug.cgi?id=214609.
let globalIgnoreEmulatedMouseEvents = false;
let hoverCount = 0;

function setGlobalIgnoreEmulatedMouseEvents() {
  globalIgnoreEmulatedMouseEvents = true;
  // Clear globalIgnoreEmulatedMouseEvents after a short timeout. iOS fires onPointerEnter
  // with pointerType="mouse" immediately after onPointerUp and before onFocus. On other
  // devices that don't have this quirk, we don't want to ignore a mouse hover sometime in
  // the distant future because a user previously touched the element.
  setTimeout(() => {
    globalIgnoreEmulatedMouseEvents = false;
  }, 500);
}

function handleGlobalPointerEvent(e: PointerEvent) {
  if (e.pointerType === "touch") {
    setGlobalIgnoreEmulatedMouseEvents();
  }
}

function setupGlobalTouchEvents(): undefined | (() => void) {
  const ownerDocument = getOwnerDocument(null);

  if (ownerDocument === undefined) {
    return undefined;
  }

  if (hoverCount === 0) {
    if (typeof PointerEvent !== "undefined") {
      ownerDocument.addEventListener("pointerup", handleGlobalPointerEvent);
    } else if (process.env.NODE_ENV === "test") {
      ownerDocument.addEventListener(
        "touchend",
        setGlobalIgnoreEmulatedMouseEvents
      );
    }
  }

  hoverCount += 1;

  return () => {
    hoverCount -= 1;

    if (hoverCount > 0) {
      return;
    }

    if (typeof PointerEvent !== "undefined") {
      ownerDocument.removeEventListener("pointerup", handleGlobalPointerEvent);
    } else if (process.env.NODE_ENV === "test") {
      ownerDocument.removeEventListener(
        "touchend",
        setGlobalIgnoreEmulatedMouseEvents
      );
    }
  };
}

/**
 * Handles pointer hover interactions for an element. Normalizes behavior
 * across browsers and platforms, and ignores emulated mouse events on touch devices.
 */
export function createHover(props: HoverProps): HoverResult {
  const [isHovered, setHovered] = createSignal(false, { ownedWrite: true });

  const state: HoverState = {
    ignoreEmulatedMouseEvents: false,
    isHovered: false,
    pointerType: "",
    target: null,
  };

  onSettled(setupGlobalTouchEvents);
  const _result1 = createGlobalListeners();

  function triggerHoverEnd(
    event: {
      currentTarget: EventTarget | null;
    },
    pointerType: string
  ) {
    const { target } = state;
    state.pointerType = "";
    state.target = null;

    if (
      (pointerType !== "mouse" && pointerType !== "pen") ||
      !state.isHovered ||
      !target
    ) {
      return;
    }

    state.isHovered = false;
    _result1.removeAllGlobalListeners();

    if (props.onHoverEnd) {
      props.onHoverEnd({
        pointerType,
        target,
        type: "hoverend",
      });
    }

    if (props.onHoverChange) {
      props.onHoverChange(false);
    }

    setHovered(false);
  }

  const triggerHoverStart = (
    event: MouseEvent | PointerEvent,
    pointerType: string
  ) => {
    state.pointerType = pointerType;

    if (
      isTruthy(props.isDisabled) ||
      (pointerType !== "mouse" && pointerType !== "pen") ||
      state.isHovered ||
      !(event.currentTarget instanceof Element) ||
      !nodeContains(event.currentTarget, requireElement(getEventTarget(event)))
    ) {
      return;
    }

    state.isHovered = true;
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    state.target = target;
    // When an element that is hovered over is removed, no pointerleave event is fired by the browser,
    // even though the originally hovered target may have shrunk in size so it is no longer hovered.
    // However, a pointerover event will be fired on the new target the mouse is over.
    // In Chrome this happens immediately. In Safari and Firefox, it happens upon moving the mouse one pixel.
    _result1.addGlobalListener(
      getOwnerDocument(requireElement(getEventTarget(event))),
      "pointerover",
      (e) => {
        if (
          state.isHovered &&
          state.target &&
          !nodeContains(state.target, requireElement(getEventTarget(e)))
        ) {
          triggerHoverEnd(e, e.pointerType);
        }
      },
      { capture: true }
    );

    if (props.onHoverStart) {
      props.onHoverStart({
        pointerType,
        target,
        type: "hoverstart",
      });
    }

    if (props.onHoverChange) {
      props.onHoverChange(true);
    }

    setHovered(true);
  };

  const hoverProps: DOMAttributes = {};

  if (typeof PointerEvent !== "undefined") {
    hoverProps.onPointerEnter = (e) => {
      untrack(() => {
        if (globalIgnoreEmulatedMouseEvents && e.pointerType === "mouse") {
          return;
        }

        triggerHoverStart(e, e.pointerType);
      });
    };

    hoverProps.onPointerLeave = (e) => {
      untrack(() => {
        if (
          !isTruthy(props.isDisabled) &&
          nodeContains(e.currentTarget, getEventTarget(e))
        ) {
          triggerHoverEnd(e, e.pointerType);
        }
      });
    };
  } else if (process.env.NODE_ENV === "test") {
    hoverProps.onTouchStart = () => {
      state.ignoreEmulatedMouseEvents = true;
    };

    hoverProps.onMouseEnter = (e) => {
      untrack(() => {
        if (
          !state.ignoreEmulatedMouseEvents &&
          !globalIgnoreEmulatedMouseEvents
        ) {
          triggerHoverStart(e, "mouse");
        }

        state.ignoreEmulatedMouseEvents = false;
      });
    };

    hoverProps.onMouseLeave = (e) => {
      untrack(() => {
        if (
          !isTruthy(props.isDisabled) &&
          nodeContains(e.currentTarget, getEventTarget(e))
        ) {
          triggerHoverEnd(e, "mouse");
        }
      });
    };
  }

  createEffect(
    () => props.isDisabled,
    (disabled) => {
      if (disabled === true) {
        untrack(() => {
          triggerHoverEnd({ currentTarget: state.target }, state.pointerType);
        });
      }
    },
    { ssrSource: "client" }
  );

  return {
    get hoverProps() {
      return hoverProps;
    },
    get isHovered() {
      return isHovered();
    },
  };
}
