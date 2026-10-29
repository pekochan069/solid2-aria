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
 * Derived from Adobe React Spectrum: packages/react-aria/src/interactions/utils.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import type { FocusableElement } from "@solid2-aria/types-shared";
import { onCleanup } from "solid-js";

import { getOwnerWindow, isNode, isShadowRoot } from "../utils/dom-helpers";
import { focusableElementOrNull, requireElement } from "../utils/dom-value";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling";
import { isFocusable } from "../utils/is-focusable";
import { isPresent } from "../utils/is-present";
import {
  getActiveElement,
  getEventTarget,
  nodeContains,
} from "../utils/shadowdom/dom-functions";

export function setEventTarget<E extends Event, T extends Element>(
  event: E,
  target: T
): asserts event is E & { readonly target: T; readonly currentTarget: T } {
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });
}

/** Dispatch native blur events when a focused control becomes disabled. */
export function createBlurObserver(): (event: Event) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => {
    cleanup?.();
  });

  return (event) => {
    cleanup?.();
    const target = getEventTarget(event);

    if (
      !(target instanceof HTMLButtonElement) &&
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLTextAreaElement) &&
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }

    const ownerWindow = getOwnerWindow(target);

    const observer = new ownerWindow.MutationObserver(() => {
      if (!target.disabled) {
        return;
      }

      observer.disconnect();
      const activeElement = getActiveElement(target.ownerDocument);
      const relatedTarget = target === activeElement ? null : activeElement;
      target.dispatchEvent(
        new ownerWindow.FocusEvent("blur", { relatedTarget })
      );
      target.dispatchEvent(
        new ownerWindow.FocusEvent("focusout", { bubbles: true, relatedTarget })
      );
    });

    const onBlur = () => {
      observer.disconnect();
      target.removeEventListener("focusout", onBlur);
    };

    target.addEventListener("focusout", onBlur, { once: true });
    observer.observe(target, {
      attributeFilter: ["disabled"],
      attributes: true,
    });
    cleanup = onBlur;
  };
}

// oxlint-disable-next-line import/no-mutable-exports -- Focus adapters observe this existing ESM live binding while native focus is being restored.
export let ignoreFocusEvent = false;

/**
 * This function prevents the next focus event fired on `target`, without using
 * `event.preventDefault()`. It works by waiting for the series of focus events to occur, and
 * reverts focus back to where it was before. It also makes these events mostly non-observable by
 * using a capturing listener on the window and stopping propagation.
 */
export function preventFocus(
  target: FocusableElement | null
): (() => void) | undefined {
  let currentTarget = target;

  // The browser will focus the nearest focusable ancestor of our target.
  while (
    currentTarget &&
    !isFocusable(currentTarget, { skipVisibilityCheck: true })
  ) {
    currentTarget = currentTarget.parentElement;
  }

  const ownerWindow = getOwnerWindow(currentTarget);

  const activeElement = focusableElementOrNull(
    getActiveElement(ownerWindow.document)
  );

  if (!activeElement || activeElement === currentTarget) {
    return undefined;
  }

  // Listen on the target's root (document or shadow root) so we catch focus events inside
  // shadow DOM; they do not reach the main window.
  const targetRoot = currentTarget?.getRootNode();

  const root =
    isPresent(targetRoot) && isShadowRoot(targetRoot)
      ? targetRoot
      : getOwnerWindow(currentTarget);

  // Focus is "moving to target" when it moves to the button or to a descendant of the button
  // (e.g. SVG icon)
  const isFocusMovingToTarget = (focusTarget: Element | null) =>
    focusTarget === currentTarget ||
    (isNode(focusTarget) && nodeContains(currentTarget, focusTarget));

  // Blur/focusout events have their target as the element losing focus. Stop propagation when
  // that is the previously focused element (activeElement) or a descendant (e.g. in shadow DOM).
  const isBlurFromActiveElement = (eventTarget: Element | null) =>
    eventTarget === activeElement ||
    (isPresent(activeElement) &&
      isNode(eventTarget) &&
      nodeContains(activeElement, eventTarget));

  ignoreFocusEvent = true;
  let isRefocusing = false;

  const onBlur: EventListener = (e) => {
    if (
      isBlurFromActiveElement(requireElement(getEventTarget(e))) ||
      isRefocusing
    ) {
      e.stopImmediatePropagation();
    }
  };

  const onFocusOut: EventListener = (e) => {
    if (
      isBlurFromActiveElement(requireElement(getEventTarget(e))) ||
      isRefocusing
    ) {
      e.stopImmediatePropagation();

      // If there was no focusable ancestor, we don't expect a focus event.
      // Re-focus the original active element here.
      if (!currentTarget && !isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  const onFocus: EventListener = (e) => {
    if (
      isFocusMovingToTarget(requireElement(getEventTarget(e))) ||
      isRefocusing
    ) {
      e.stopImmediatePropagation();
    }
  };

  const onFocusIn: EventListener = (e) => {
    if (
      isFocusMovingToTarget(requireElement(getEventTarget(e))) ||
      isRefocusing
    ) {
      e.stopImmediatePropagation();

      if (!isRefocusing) {
        isRefocusing = true;
        focusWithoutScrolling(activeElement);
        cleanup();
      }
    }
  };

  root.addEventListener("blur", onBlur, true);
  root.addEventListener("focusout", onFocusOut, true);
  root.addEventListener("focusin", onFocusIn, true);
  root.addEventListener("focus", onFocus, true);

  const raf = requestAnimationFrame(cleanup);

  function cleanup() {
    cancelAnimationFrame(raf);
    root.removeEventListener("blur", onBlur, true);
    root.removeEventListener("focusout", onFocusOut, true);
    root.removeEventListener("focusin", onFocusIn, true);
    root.removeEventListener("focus", onFocus, true);
    ignoreFocusEvent = false;
    isRefocusing = false;
  }

  return cleanup;
}
