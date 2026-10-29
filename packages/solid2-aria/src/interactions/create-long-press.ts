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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/useLongPress.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { LongPressEvent, PressEvent } from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { onSettled } from "solid-js";

import { createDescription } from "../utils/create-description";
import { createGlobalListeners } from "../utils/create-global-listeners";
import { getOwnerDocument, getOwnerWindow } from "../utils/dom-helpers";
import { requireFocusableElement } from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { mergeProps } from "../utils/merge-props";
import { isTruthy } from "../utils/truthy";
import { createPress } from "./create-press";

export interface LongPressProps {
  /** Whether long press events should be disabled. */
  isDisabled?: boolean;
  /** Which pointer type to listen for. By default, both mouse and touch are listened for. */
  pointerType?: "mouse" | "touch";
  /** Handler that is called when a long press interaction starts. */
  onLongPressStart?: (e: LongPressEvent) => void;
  /**
   * Handler that is called when a long press interaction ends, either
   * over the target or when the pointer leaves the target.
   */
  onLongPressEnd?: (e: LongPressEvent) => void;
  /**
   * Handler that is called when the threshold time is met while
   * the press is over the target.
   */
  onLongPress?: (e: LongPressEvent) => void;
  /**
   * The amount of time in milliseconds to wait before triggering a long press.
   *
   * @default 500ms
   */
  threshold?: number;
  /**
   * A description for assistive techology users indicating that a long press
   * action is available, e.g. "Long press to open menu".
   */
  accessibilityDescription?: string;
}

export interface LongPressResult {
  /** Props to spread on the target element. */
  longPressProps: DOMAttributes;
}

const DEFAULT_THRESHOLD = 500;

/**
 * Handles long press interactions across mouse and touch devices. Supports a customizable time
 * threshold, accessibility description, and normalizes behavior across browsers and devices.
 */
export function createLongPress(props: LongPressProps): LongPressResult {
  let timeRef: ReturnType<typeof setTimeout> | undefined = undefined;

  onSettled(() => () => {
    if (timeRef !== undefined) {
      clearTimeout(timeRef);
    }
  });
  const _result1 = createGlobalListeners();

  const isAcceptedPointerType = (e: PressEvent) =>
    props.pointerType
      ? e.pointerType === props.pointerType
      : e.pointerType === "mouse" || e.pointerType === "touch";

  const _result2 = createPress({
    get isDisabled() {
      return props.isDisabled;
    },
    onPressEnd(e) {
      if (timeRef) {
        clearTimeout(timeRef);
      }

      if (props.onLongPressEnd && isAcceptedPointerType(e)) {
        props.onLongPressEnd({
          ...e,
          type: "longpressend",
        });
      }
    },
    onPressStart(e) {
      e.continuePropagation();

      if (isAcceptedPointerType(e)) {
        if (props.onLongPressStart) {
          props.onLongPressStart({
            ...e,
            type: "longpressstart",
          });
        }

        timeRef = setTimeout(() => {
          // Prevent other usePress handlers from also handling this event.
          e.target.dispatchEvent(
            new PointerEvent("pointercancel", { bubbles: true })
          );
          // Prevent default click action (e.g. opening a link) after a long press.
          _result1.addGlobalListener(
            e.target,
            "click",
            (eValue) => {
              eValue.preventDefault();
            },
            { once: true }
          );

          // Ensure target is focused. On touch devices, browsers typically focus on pointer up.
          if (getOwnerDocument(e.target).activeElement !== e.target) {
            focusWithoutScrolling(requireFocusableElement(e.target));
          }

          if (props.onLongPress) {
            props.onLongPress({
              ...e,
              type: "longpress",
            });
          }

          timeRef = undefined;
        }, props.threshold ?? DEFAULT_THRESHOLD);

        // Prevent context menu, which may be opened on long press on touch devices
        if (e.pointerType === "touch") {
          _result1.addGlobalListener(
            e.target,
            "contextmenu",
            (eValue2) => {
              eValue2.preventDefault();
            },
            { once: true }
          );
        }

        const ownerWindow = getOwnerWindow(e.target);
        _result1.addGlobalListener(
          ownerWindow,
          "pointerup",
          () => {
            // If no contextmenu/click event is fired quickly after pointerup, remove the handler
            // so future events outside a long press are not prevented.
            setTimeout(() => {
              _result1.removeAllGlobalListeners();
            }, 100);
          },
          { once: true }
        );
      }
    },
  });

  const descriptionProps = createDescription(() =>
    props.onLongPress && !isTruthy(props.isDisabled)
      ? props.accessibilityDescription
      : undefined
  );

  return {
    get longPressProps() {
      return mergeProps(_result2.pressProps, descriptionProps);
    },
  };
}
