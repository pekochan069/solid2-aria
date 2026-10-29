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
 * Derived from Adobe React Spectrum: packages/react-aria/src/dialog/useDialog.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type {
  AriaLabelingProps,
  DOMProps,
  FocusableElement,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { merge, createMemo, createEffect, untrack } from "solid-js";
import type { Accessor } from "solid-js";

import { focusSafely } from "../interactions/focus-safely";
import { createOverlayFocusContain } from "../overlays/overlay";
import { ariaValue } from "../utils/aria-value";
import { createSlotId } from "../utils/create-id";
import { filterDOMProps } from "../utils/filter-dom-props";
import {
  getActiveElement,
  isFocusWithin,
} from "../utils/shadowdom/dom-functions";
import { isTruthy } from "../utils/truthy";

export interface AriaDialogProps extends DOMProps, AriaLabelingProps {
  /**
   * The accessibility role for the dialog.
   *
   * @default 'dialog'
   */
  role?: "dialog" | "alertdialog";
  /**
   * Whether the dialog is currently performing an entry animation. Focus is not moved into the
   * dialog until the animation completes, since moving the screen reader cursor may cause scrolling
   * that interrupts the animation.
   */
  isEntering?: boolean;
}

export interface DialogAria {
  /** Props for the dialog container element. */
  dialogProps: DOMAttributes;
  /** Props for the dialog title element. */
  titleProps: DOMAttributes;
  /** Props for the dialog content/description element. Used for aria-describedby on alertdialogs. */
  contentProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a dialog component.
 * A dialog is an overlay shown above other content in an application.
 */
export function createDialog(
  props: AriaDialogProps,
  ref: Accessor<FocusableElement | null>
): DialogAria {
  const _result0 = props;
  const _titleIdSource = createSlotId();

  const titleId = createMemo(() =>
    isTruthy(props["aria-label"]) ? undefined : _titleIdSource()
  );

  const _contentIdSource = createSlotId();

  const contentId = createMemo(() =>
    (_result0.role ?? "dialog") === "alertdialog" &&
    !isTruthy(props["aria-describedby"])
      ? _contentIdSource()
      : undefined
  );

  let isRefocusing = false;
  // Focus the dialog itself on mount (or once it has entered), unless a child element is already focused.
  createEffect(
    () => ({ element: ref(), isEntering: _result0.isEntering }),
    ({ isEntering, element }): undefined | (() => void) => {
      const refElement = element;

      if (!isTruthy(isEntering) && refElement && !isFocusWithin(refElement)) {
        untrack(() => {
          focusSafely(refElement);
        });

        // Safari on iOS does not move the VoiceOver cursor to the dialog
        // or announce that it has opened until it has rendered. A workaround
        // is to wait for half a second, then blur and re-focus the dialog.
        const timeout = setTimeout(() => {
          const currentElement = ref();

          // Check that the dialog is still focused, or focused was lost to the body.
          if (
            getActiveElement() === currentElement ||
            getActiveElement() === document.body
          ) {
            isRefocusing = true;

            if (currentElement) {
              currentElement.blur();
              focusSafely(currentElement);
            }

            isRefocusing = false;
          }
        }, 500);

        return () => {
          clearTimeout(timeout);
        };
      }

      return undefined;
    },
    { ssrSource: "client" }
  );
  createOverlayFocusContain();
  // Warn in dev mode if the dialog has no accessible title.
  // This catches a common mistake where useDialog and useOverlayTriggerState
  // are used in the same component, causing the title element to not be
  // in the DOM when useSlotId queries for it.
  // Check the DOM element directly since aria-labelledby may be added by
  // wrapper components (e.g. RAC Dialog uses trigger ID as a fallback).
  let hasWarned = false;
  createEffect(
    () => ({ element: ref() }),
    ({ element }) => {
      const refElement = element;

      if (process.env.NODE_ENV !== "production" && !hasWarned && refElement) {
        const el = refElement;
        const hasAriaLabel = el.hasAttribute("aria-label");
        const hasAriaLabelledby = el.hasAttribute("aria-labelledby");

        if (!hasAriaLabel && !hasAriaLabelledby) {
          console.warn(
            "A dialog must have a title for accessibility. " +
              "Either provide an aria-label or aria-labelledby prop, or render a heading element inside the dialog."
          );
          hasWarned = true;
        }
      }
    },
    { ssrSource: "client" }
  );

  const ariaDescribedby = createMemo(
    () => props["aria-describedby"] ?? contentId()
  );

  // We do not use aria-modal due to a Safari bug which forces the first focusable element to be focused
  // on mount when inside an iframe, no matter which element we programmatically focus.
  // See https://bugs.webkit.org/show_bug.cgi?id=211934.
  // useModal sets aria-hidden on all elements outside the dialog, so the dialog will behave as a modal
  // even without aria-modal on the dialog itself.
  return {
    get contentProps() {
      return {
        get id() {
          return contentId();
        },
      };
    },
    get dialogProps() {
      return merge(filterDOMProps(props, { labelable: true }), {
        get "aria-describedby"() {
          return ariaValue(ariaValue(ariaDescribedby()));
        },
        get "aria-labelledby"() {
          return ariaValue(ariaValue(props["aria-labelledby"] ?? titleId()));
        },
        // Prevent blur events from reaching useOverlay, which may cause
        // popovers to close. Since focus is contained within the dialog,
        // ignore focus changes caused by the dialog refocus workaround.
        onFocusOut: (e: FocusEvent) => {
          if (isRefocusing) {
            e.stopPropagation();
          }
        },
        get role() {
          return _result0.role ?? "dialog";
        },
        get tabindex() {
          return -1;
        },
      });
    },
    get titleProps() {
      return {
        get id() {
          return titleId();
        },
      };
    },
  };
}
