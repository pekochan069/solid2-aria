/*
 * Copyright 2025 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/toast/useToastRegion.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { ToastState } from "@solid2-aria/stately/toast/create-toast-state";
import type {
  AriaLabelingProps,
  FocusableElement,
} from "@solid2-aria/types-shared";
import type { DOMAttributes } from "@solid2-aria/types-shared-web";
import { untrack, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import intlMessages from "../../intl/toast/index";
import { createLocalizedStringFormatter } from "../i18n/create-localized-string-formatter";
import { getInteractionModality } from "../interactions/create-focus-visible";
import { createFocusWithin } from "../interactions/create-focus-within";
import { createHover } from "../interactions/create-hover";
import { createLandmark } from "../landmark/create-landmark";
import { ariaValue } from "../utils/aria-value";
import { focusableElementOrNull, requireElement } from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { isPresent } from "../utils/is-present";
import { mergeProps } from "../utils/merge-props";
import { getEventTarget } from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy } from "../utils/truthy";

export interface AriaToastRegionProps extends AriaLabelingProps {
  /**
   * An accessibility label for the toast region.
   *
   * @default 'Notifications'
   */
  "aria-label"?: string;
}

export interface ToastRegionAria {
  /** Props for the landmark region element. */
  regionProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a toast region containing one or more
 * toasts. Toasts display brief, temporary notifications of actions, errors, or other events in an
 * application.
 */
export function createToastRegion<T>(
  props: AriaToastRegionProps,
  state: ToastState<T>,
  ref: Accessor<HTMLElement | null>
): ToastRegionAria {
  const stringFormatter = createLocalizedStringFormatter(
    intlMessages,
    "@react-aria/toast"
  );

  const _result0 = createLandmark(
    {
      get "aria-label"() {
        return ariaValue(
          ariaValue(
            getTruthyValue(props["aria-label"]) ??
              stringFormatter.format("notifications", {
                count: state.visibleToasts.length,
              })
          )
        );
      },
      get role(): "region" {
        return "region" as const;
      },
    },
    ref
  );

  let isHovered = false;
  let isFocused = false;

  const updateTimers = () => {
    if (isHovered || isFocused) {
      state.pauseAll();
    } else {
      state.resumeAll();
    }
  };

  const _result1 = createHover({
    onHoverEnd: () => {
      isHovered = false;
      updateTimers();
    },
    onHoverStart: () => {
      isHovered = true;
      updateTimers();
    },
  });

  // Manage focus within the toast region.
  // If a focused containing toast is removed, move focus to the next toast, or the previous toast if there is no next toast.
  let toasts: FocusableElement[] = [];
  let prevVisibleToasts = untrack(() => state.visibleToasts);
  let focusedToast: number | null = null;
  let lastFocused: FocusableElement | null = null;

  createEffect(
    () => ({
      element: ref(),
      observedLength: state.visibleToasts.length,
      observedVisibleToasts: state.visibleToasts,
    }),
    ({ observedVisibleToasts, observedLength, element }) => {
      const refElement = element;

      // If no toast has focus, then don't do anything.
      if (focusedToast === -1 || observedLength === 0 || !refElement) {
        toasts = [];
        prevVisibleToasts = observedVisibleToasts;

        return;
      }

      toasts = [
        ...refElement.querySelectorAll<HTMLElement>('[role="alertdialog"]'),
      ];

      // If the visible toasts haven't changed, we don't need to do anything.
      if (
        prevVisibleToasts.length === observedLength &&
        observedVisibleToasts.every(
          (t, i) => t.key === prevVisibleToasts[i]?.key
        )
      ) {
        prevVisibleToasts = observedVisibleToasts;

        return;
      }

      // Get a list of all toasts by index and add info if they are removed.
      const allToasts = prevVisibleToasts.map((t, i) => ({
        ...t,
        i,
        isRemoved: !state.visibleToasts.some((t2) => t.key === t2.key),
      }));

      const removedFocusedToastIndex = allToasts.findIndex(
        (t) => t.i === focusedToast && t.isRemoved
      );

      // If the focused toast was removed, focus the next or previous toast.
      if (removedFocusedToastIndex !== -1) {
        // In pointer modality, move focus out of the toast region.
        // Otherwise auto-dismiss timers will appear "stuck".

        if (
          getInteractionModality() === "pointer" &&
          isTruthy(lastFocused?.isConnected)
        ) {
          focusWithoutScrolling(lastFocused);
        } else {
          focusAdjacentToast(allToasts, removedFocusedToastIndex, toasts);
        }
      }

      prevVisibleToasts = observedVisibleToasts;
    },
    { ssrSource: "client" }
  );

  const _result2 = createFocusWithin({
    onBlurWithin: () => {
      isFocused = false;

      lastFocused = null;
      updateTimers();
    },
    onFocusWithin: (e) => {
      isFocused = true;

      lastFocused = focusableElementOrNull(e.relatedTarget);
      updateTimers();
    },
  });

  // When the number of visible toasts becomes 0 or the region unmounts,
  // restore focus to the last element that had focus before the user moved focus
  // into the region. FocusScope restore focus doesn't update whenever the focus
  // moves in, it only happens once, so we correct it.
  // Because we're in a hook, we can't control if the user unmounts or not.
  createEffect(
    () => ({
      input0: ref(),
      input2: state.visibleToasts,
      length: state.visibleToasts.length,
    }),
    ({ length: currentLength }) => {
      if (currentLength === 0 && isTruthy(lastFocused?.isConnected)) {
        if (getInteractionModality() === "pointer") {
          focusWithoutScrolling(lastFocused);
        } else {
          lastFocused.focus();
        }

        lastFocused = null;
      }
    },
    { ssrSource: "client" }
  );
  createEffect(
    () => ({ input0: ref() }),
    () => () => {
      if (isTruthy(lastFocused?.isConnected)) {
        if (getInteractionModality() === "pointer") {
          focusWithoutScrolling(lastFocused);
        } else {
          lastFocused.focus();
        }

        lastFocused = null;
      }
    },
    { ssrSource: "client" }
  );

  return {
    get regionProps() {
      return mergeProps(
        _result0.landmarkProps,
        _result1.hoverProps,
        _result2.focusWithinProps,
        {
          // Mark the toast region as a "top layer", so that it:
          //   - is not aria-hidden when opening an overlay
          //   - allows focus even outside a containing focus scope
          //   - doesn’t dismiss overlays when clicking on it, even though it is outside
          "data-react-aria-top-layer": true,
          // listen to focus events separate from focuswithin because that will only fire once
          // and we need to follow all focus changes
          onFocusIn: (e: FocusEvent) => {
            const target = requireElement(
              getEventTarget(e)
            ).closest<FocusableElement>('[role="alertdialog"]');

            focusedToast = target ? toasts.indexOf(target) : -1;
          },
          onFocusOut: () => {
            focusedToast = -1;
          },
          tabindex: -1,
        }
      );
    },
  };
}

function focusAdjacentToast(
  allToasts: readonly { isRemoved: boolean }[],
  removedFocusedToastIndex: number,
  toasts: readonly FocusableElement[]
): void {
  let i = 0;
  let nextToast;
  let prevToast;

  while (i <= removedFocusedToastIndex) {
    if (!isTruthy(allToasts[i]?.isRemoved)) {
      prevToast = Math.max(0, i - 1);
    }

    i += 1;
  }

  while (i < allToasts.length) {
    if (!isTruthy(allToasts[i]?.isRemoved)) {
      nextToast = i - 1;
      break;
    }

    i += 1;
  }

  // in the case where it's one toast at a time, both will be undefined, but we know the index must be 0
  if (prevToast === undefined && nextToast === undefined) {
    prevToast = 0;
  }

  // prioritize going to newer toasts
  if (isPresent(prevToast) && prevToast >= 0 && prevToast < toasts.length) {
    const target = toasts[prevToast];

    if (target) {
      focusWithoutScrolling(target);
    }
  } else if (
    isPresent(nextToast) &&
    nextToast >= 0 &&
    nextToast < toasts.length
  ) {
    const target = toasts[nextToast];

    if (target) {
      focusWithoutScrolling(target);
    }
  }
}
