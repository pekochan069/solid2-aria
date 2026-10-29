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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useInteractOutside.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { getOwnerDocument } from "../utils/dom-helpers";
import { requireElement } from "../utils/dom-value";
import { getEventTarget, nodeContains } from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

export type InteractOutsideEvent = PointerEvent | MouseEvent | TouchEvent;

export interface InteractOutsideProps {
  ref: Accessor<Element | null>;
  onInteractOutside?: (e: InteractOutsideEvent) => void;
  onInteractOutsideStart?: (e: InteractOutsideEvent) => void;
  /** Whether the interact outside events should be disabled. */
  isDisabled?: boolean;
}

/**
 * Example, used in components like Dialogs and Popovers so they can close
 * when a user clicks outside them.
 */
export function createInteractOutside(props: InteractOutsideProps): void {
  const state = {
    ignoreEmulatedMouseEvents: false,
    isPointerDown: false,
  };

  const onPointerDown = (e: InteractOutsideEvent) => {
    if (props.onInteractOutside && isValidEvent(e, props.ref)) {
      if (props.onInteractOutsideStart) {
        props.onInteractOutsideStart(e);
      }

      state.isPointerDown = true;
    }
  };

  const triggerInteractOutside = (e: InteractOutsideEvent) => {
    if (props.onInteractOutside) {
      props.onInteractOutside(e);
    }
  };

  createEffect(
    () => ({ disabled: props.isDisabled, element: props.ref() }),
    ({ disabled, element }): undefined | (() => void) => {
      if (disabled === true || !element) {
        return undefined;
      }

      const documentObject = getOwnerDocument(element);

      // Use pointer events if available. Otherwise, fall back to mouse and touch events.
      if (typeof PointerEvent !== "undefined") {
        const onClick = (e: MouseEvent) => {
          if (state.isPointerDown && isValidEvent(e, props.ref)) {
            triggerInteractOutside(e);
          }

          state.isPointerDown = false;
        };

        // changing these to capture phase fixed combobox
        // Use click instead of pointerup to avoid Android Chrome issue
        // https://issues.chromium.org/issues/40732224
        documentObject.addEventListener("pointerdown", onPointerDown, true);
        documentObject.addEventListener("click", onClick, true);

        return () => {
          documentObject.removeEventListener(
            "pointerdown",
            onPointerDown,
            true
          );
          documentObject.removeEventListener("click", onClick, true);
        };
      } else if (process.env.NODE_ENV === "test") {
        const onMouseUp = (e: MouseEvent) => {
          if (state.ignoreEmulatedMouseEvents) {
            state.ignoreEmulatedMouseEvents = false;
          } else if (state.isPointerDown && isValidEvent(e, props.ref)) {
            triggerInteractOutside(e);
          }

          state.isPointerDown = false;
        };

        const onTouchEnd = (e: TouchEvent) => {
          state.ignoreEmulatedMouseEvents = true;

          if (state.isPointerDown && isValidEvent(e, props.ref)) {
            triggerInteractOutside(e);
          }

          state.isPointerDown = false;
        };

        documentObject.addEventListener("mousedown", onPointerDown, true);
        documentObject.addEventListener("mouseup", onMouseUp, true);
        documentObject.addEventListener("touchstart", onPointerDown, true);
        documentObject.addEventListener("touchend", onTouchEnd, true);

        return () => {
          documentObject.removeEventListener("mousedown", onPointerDown, true);
          documentObject.removeEventListener("mouseup", onMouseUp, true);
          documentObject.removeEventListener("touchstart", onPointerDown, true);
          documentObject.removeEventListener("touchend", onTouchEnd, true);
        };
      }

      return undefined;
    },
    { ssrSource: "client" }
  );
}

function isValidEvent(
  event: InteractOutsideEvent,
  ref: Accessor<Element | null>
) {
  const refElement = ref();

  if ("button" in event && event.button > 0) {
    return false;
  }

  const target = requireElement(getEventTarget(event));

  if (isTruthy(target)) {
    // if the event target is no longer in the document, ignore
    const { ownerDocument } = target;

    if (
      !isTruthy(ownerDocument) ||
      !nodeContains(ownerDocument.documentElement, target)
    ) {
      return false;
    }

    // If the target is within a top layer element (e.g. toasts), ignore.
    if (target.closest("[data-react-aria-top-layer]")) {
      return false;
    }
  }

  if (!refElement) {
    return false;
  }

  // When the event source is inside a Shadow DOM, event.target is just the shadow root.
  // Using event.composedPath instead means we can get the actual element inside the shadow root.
  // This only works if the shadow root is open, there is no way to detect if it is closed.
  // If the event composed path contains the ref, interaction is inside.
  return !event.composedPath().includes(refElement);
}
