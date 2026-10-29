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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useFocusWithin.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2; use native bubbling focusin and focusout events to track descendants.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

// Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions

import type { DOMAttributes } from "@solid2-aria/types-shared-web";

import type { FocusEvent } from "../types";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { getOwnerDocument } from "../utils/dom-helpers";
import { elementOrNull, requireElement } from "../utils/dom-value";
import { requireValue } from "../utils/require-value";
import {
  getActiveElement,
  getEventTarget,
  nodeContains,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";
import { setEventTarget, createBlurObserver } from "./utils";

export interface FocusWithinProps {
  /** Whether the focus within events should be disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the target element or a descendant receives focus. */
  onFocusWithin?: (e: FocusEvent) => void;
  /** Handler that is called when the target element and all descendants lose focus. */
  onBlurWithin?: (e: FocusEvent) => void;
  /** Handler that is called when the the focus within state changes. */
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
}

export interface FocusWithinResult {
  /** Props to spread onto the target element. */
  focusWithinProps: DOMAttributes;
}

/**
 * Handles focus events for the target and its descendants.
 */
export function createFocusWithin(props: FocusWithinProps): FocusWithinResult {
  let isFocusWithin = false;

  const _result1 = createGlobalListeners();

  const onBlur = (e: FocusEvent) => {
    // Ignore events bubbling through portals.
    if (!nodeContains(e.currentTarget, getEventTarget(e))) {
      return;
    }

    // We don't want to trigger onBlurWithin and then immediately onFocusWithin again
    // when moving focus inside the element. Only trigger if the currentTarget doesn't
    // include the relatedTarget (where focus is moving).
    if (
      isFocusWithin &&
      !nodeContains(e.currentTarget, elementOrNull(e.relatedTarget))
    ) {
      isFocusWithin = false;
      _result1.removeAllGlobalListeners();

      if (props.onBlurWithin) {
        props.onBlurWithin(e);
      }

      if (props.onFocusWithinChange) {
        props.onFocusWithinChange(false);
      }
    }
  };

  const observeFocus = createBlurObserver();

  const onFocus = (e: FocusEvent) => {
    // Ignore events bubbling through portals.
    if (!nodeContains(e.currentTarget, getEventTarget(e))) {
      return;
    }

    // Double check that document.activeElement actually matches e.target in case a previously chained
    // focus handler already moved focus somewhere else.
    const eventTarget = getEventTarget(e);
    const ownerDocument = getOwnerDocument(eventTarget);
    const activeElement = getActiveElement(ownerDocument);

    if (!isFocusWithin && activeElement === eventTarget) {
      if (props.onFocusWithin) {
        props.onFocusWithin(e);
      }

      if (props.onFocusWithinChange) {
        props.onFocusWithinChange(true);
      }

      isFocusWithin = true;
      observeFocus(e);
      // Browsers don't fire blur events when elements are removed from the DOM.
      // However, if a focus event occurs outside the element we're tracking, we
      // can manually fire onBlur.
      const { currentTarget } = e;
      _result1.addGlobalListener(
        ownerDocument,
        "focus",
        (eValue) => {
          const eventTargetValue = getEventTarget(eValue);

          if (
            isFocusWithin &&
            !nodeContains(currentTarget, requireElement(eventTargetValue))
          ) {
            const nativeEvent = new (requireValue(
              ownerDocument.defaultView,
              "Expected ownerDocument.defaultView"
            ).FocusEvent)("blur", {
              relatedTarget: eventTargetValue,
            });

            setEventTarget(nativeEvent, currentTarget);
            onBlur(nativeEvent);
          }
        },
        { capture: true }
      );
    }
  };

  return {
    get focusWithinProps() {
      return {
        onFocusIn: isTruthy(props.isDisabled) ? undefined : onFocus,
        onFocusOut: onBlur,
      };
    },
  };
}
