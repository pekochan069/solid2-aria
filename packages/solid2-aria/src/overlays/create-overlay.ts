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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/useOverlay.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { isElementInChildOfActiveScope } from "../focus/focus-scope";
import { createFocusWithin } from "../interactions/create-focus-within";
import { createInteractOutside } from "../interactions/create-interact-outside";
import type { InteractOutsideEvent } from "../interactions/create-interact-outside";
import { createKeyboard } from "../interactions/create-keyboard";
import { requireElement } from "../utils/dom-value";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

export interface AriaOverlayProps {
  /** Whether the overlay is currently open. */
  isOpen?: boolean;
  /** Handler that is called when the overlay should close. */
  onClose?: () => void;
  /**
   * Whether to close the overlay when the user interacts outside it.
   *
   * @default false
   */
  isDismissable?: boolean;
  /** Whether the overlay should close when focus is lost or moves outside it. */
  shouldCloseOnBlur?: boolean;
  /**
   * Whether pressing the escape key to close the overlay should be disabled.
   *
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * When user interacts with the argument element outside of the overlay ref,
   * return true if onClose should be called.  This gives you a chance to filter
   * out interaction with elements that should not dismiss the overlay.
   * By default, onClose will always be called on interaction outside the overlay ref.
   */
  shouldCloseOnInteractOutside?: (element: Element) => boolean;
}

export interface OverlayAria {
  /** Props to apply to the overlay container element. */
  overlayProps: DOMAttributes;
  /** Props to apply to the underlay element, if any. */
  underlayProps: DOMAttributes;
}

const visibleOverlays: Accessor<Element | null>[] = [];

/**
 * Provides the behavior for overlays such as dialogs, popovers, and menus.
 * Hides the overlay when the user interacts outside it, when the Escape key is pressed,
 * or optionally, on blur. Only the top-most overlay will close at once.
 */
export function createOverlay(
  props: AriaOverlayProps,
  ref: Accessor<Element | null>
): OverlayAria {
  const _result0 = props;

  let lastVisibleOverlay: Accessor<Element | null> | undefined;

  // Add the overlay ref to the stack of visible overlays on mount, and remove on unmount.
  createEffect(
    () => props.isOpen,
    (isOpen): undefined | (() => void) => {
      if (isTruthy(isOpen) && !visibleOverlays.includes(ref)) {
        visibleOverlays.push(ref);

        return () => {
          const index = visibleOverlays.indexOf(ref);

          if (index !== -1) {
            visibleOverlays.splice(index, 1);
          }
        };
      }

      return undefined;
    },
    { ssrSource: "client" }
  );

  // Only hide the overlay when it is the topmost visible overlay in the stack
  const onHide = () => {
    if (visibleOverlays.at(-1) === ref && _result0.onClose) {
      _result0.onClose();
    }
  };

  const onInteractOutsideStart = (e: InteractOutsideEvent) => {
    const topMostOverlay = visibleOverlays.at(-1);
    lastVisibleOverlay = topMostOverlay;

    if (
      (!_result0.shouldCloseOnInteractOutside ||
        _result0.shouldCloseOnInteractOutside(
          requireElement(getEventTarget(e))
        )) &&
      topMostOverlay === ref
    ) {
      e.stopPropagation();
    }
  };

  const onInteractOutside = (e: InteractOutsideEvent) => {
    if (
      !_result0.shouldCloseOnInteractOutside ||
      _result0.shouldCloseOnInteractOutside(requireElement(getEventTarget(e)))
    ) {
      if (visibleOverlays.at(-1) === ref) {
        e.stopPropagation();
      }

      if (lastVisibleOverlay === ref) {
        onHide();
      }
    }

    lastVisibleOverlay = undefined;
  };

  // Handle the escape key
  const _result1 = createKeyboard({
    get shortcuts() {
      return {
        Escape: (): undefined | false => {
          if (!(_result0.isKeyboardDismissDisabled ?? false)) {
            onHide();

            return undefined;
          }

          return false;
        },
      };
    },
  });

  // Handle clicking outside the overlay to close it
  createInteractOutside({
    get onInteractOutside() {
      return (_result0.isDismissable ?? false) && isTruthy(_result0.isOpen)
        ? onInteractOutside
        : undefined;
    },
    get onInteractOutsideStart() {
      return onInteractOutsideStart;
    },
    get ref() {
      return ref;
    },
  });

  const _result2 = createFocusWithin({
    get isDisabled() {
      return !isTruthy(_result0.shouldCloseOnBlur);
    },
    onBlurWithin: (e) => {
      // Do not close if relatedTarget is null, which means focus is lost to the body.
      // That can happen when switching tabs, or due to a VoiceOver/Chrome bug with Control+Option+Arrow navigation.
      // Clicking on the body to close the overlay should already be handled by useInteractOutside.
      // https://github.com/adobe/react-spectrum/issues/4130
      // https://github.com/adobe/react-spectrum/issues/4922
      //
      // If focus is moving into a child focus scope (e.g. menu inside a dialog),
      // do not close the outer overlay. At this point, the active scope should
      // still be the outer overlay, since blur events run before focus.
      if (
        !(e.relatedTarget instanceof Element) ||
        isElementInChildOfActiveScope(e.relatedTarget)
      ) {
        return;
      }

      if (
        !_result0.shouldCloseOnInteractOutside ||
        _result0.shouldCloseOnInteractOutside(e.relatedTarget)
      ) {
        _result0.onClose?.();
      }
    },
  });

  return {
    get overlayProps() {
      return merge(_result1.keyboardProps, _result2.focusWithinProps);
    },
    get underlayProps() {
      return {};
    },
  };
}
