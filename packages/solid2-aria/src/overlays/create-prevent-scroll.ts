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
 * Derived from Adobe React Spectrum: packages/react-aria/src/overlays/usePreventScroll.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect } from "solid-js";

import { chain } from "../utils/chain";
import { addEvent, setStyle } from "../utils/dom-helpers";
import {
  htmlElementOrNull,
  requireElement,
  requireHTMLElement,
} from "../utils/dom-value";
import { getNonce } from "../utils/get-nonce";
import { getScrollParent } from "../utils/get-scroll-parent";
import { isScrollable } from "../utils/is-scrollable";
import { supportsKeyboard, willOpenKeyboard } from "../utils/keyboard";
import { isIOS, isWebKit } from "../utils/platform";
import { requireValue } from "../utils/require-value";
import {
  runAfterKeyboard,
  runAfterKeyboardTransition,
} from "../utils/run-after-keyboard";
import {
  getActiveElement,
  getEventTarget,
} from "../utils/shadowdom/dom-functions";
import { getTruthyValue, isTruthy, whenTruthy } from "../utils/truthy";

interface PreventScrollOptions {
  /** Whether the scroll lock is disabled. */
  isDisabled?: boolean;
  /**
   * Whether to override the `focus()` method so it does not scroll the page.
   * This is temporary and will be removed after fully testing all overlays.
   *
   * @private
   */
  UNSTABLE_overrideFocus?: boolean;
}

const visualViewport = typeof document !== "undefined" && window.visualViewport;

// The number of active usePreventScroll calls. Used to determine whether to revert back to the original page style/scroll position
let preventScrollCount = 0;
let restore: (() => void) | undefined;

/**
 * Prevents scrolling on the document body on mount, and
 * restores it on unmount. Also ensures that content does not
 * shift due to the scrollbars disappearing.
 */
export function createPreventScroll(options: PreventScrollOptions = {}): void {
  createEffect(
    () => ({
      disabled: options.isDisabled,
      overrideFocus: options.UNSTABLE_overrideFocus,
    }),
    ({
      disabled,
      overrideFocus: shouldOverrideFocus,
    }): undefined | (() => void) => {
      if (isTruthy(disabled)) {
        return undefined;
      }

      preventScrollCount += 1;

      if (preventScrollCount === 1) {
        restore =
          isIOS() && isWebKit()
            ? preventScrollMobileWebKit()
            : preventScrollStandard(shouldOverrideFocus);
      }

      return () => {
        preventScrollCount -= 1;

        if (preventScrollCount === 0) {
          restore?.();
        }
      };
    },
    { ssrSource: "client" }
  );
}

// For most browsers, all we need to do is set `overflow: hidden` on the root element, and
// add some padding to prevent the page from shifting when the scrollbar is hidden.
function preventScrollStandard(UNSTABLE_overrideFocus?: boolean) {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  return chain(
    scrollbarWidth > 0 &&
      // Use scrollbar-gutter when supported because it also works for fixed positioned elements.
      ("scrollbarGutter" in document.documentElement.style
        ? setStyle(document.documentElement, "scrollbar-gutter", "stable")
        : setStyle(
            document.documentElement,
            "padding-right",
            `${scrollbarWidth}px`
          )),
    setStyle(document.documentElement, "overflow", "hidden"),
    whenTruthy(UNSTABLE_overrideFocus, () => overrideFocus()),
    whenTruthy(
      whenTruthy(UNSTABLE_overrideFocus, () => supportsKeyboard()),
      () => handleBlur()
    )
  );
}

// Mobile Safari is a whole different beast. Even with overflow: hidden,
// it still scrolls the page in many situations:
//
// 1. When the bottom toolbar and address bar are collapsed, page scrolling is always allowed.
// 2. When the keyboard is visible, the viewport does not resize. Instead, the keyboard covers part of
//    it, so it becomes scrollable.
// 3. When tapping on an input, the page always scrolls so that the input is centered in the visual viewport.
//    This may cause even fixed position elements to scroll off the screen.
// 4. When using the next/previous buttons in the keyboard to navigate between inputs, the whole page always
//    scrolls, even if the input is inside a nested scrollable element that could be scrolled instead.
//
// In order to work around these cases, and prevent scrolling without jankiness, we do a few things:
//
// 1. Prevent default on `touchmove` events that are not in a scrollable element. This prevents touch scrolling
//    on the window.
// 2. Set `overscroll-behavior: contain` on nested scrollable regions so they do not scroll the page when at
//    the top or bottom. Work around a bug where this does not work when the element does not actually overflow
//    by preventing default in a `touchmove` event. This is best effort: we can't prevent default when pinch
//    zooming or when an element contains text selection, which may allow scrolling in some cases.
// 3. Prevent default on `touchend` events on input elements and handle focusing the element ourselves.
function preventScrollMobileWebKit() {
  // Set overflow hidden so scrollIntoViewport() (useSelectableCollection) sees isScrollPrevented and
  // scrolls only scroll parents instead of calling native scrollIntoView() which moves the window.
  const restoreOverflow = setStyle(
    document.documentElement,
    "overflow",
    "hidden"
  );

  let scrollable: Element;
  let allowTouchMove = false;

  const onTouchStart = (e: TouchEvent) => {
    // Store the nearest scrollable parent element from the element that the user touched.
    const target = requireElement(getEventTarget(e));
    scrollable = isScrollable(target, true)
      ? target
      : getScrollParent(target, true);
    allowTouchMove = false;

    // If the target is selected, don't preventDefault in touchmove to allow user to adjust selection.
    const selection = requireValue(
      target.ownerDocument.defaultView,
      "Expected target.ownerDocument.defaultView"
    ).getSelection();

    if (
      selection &&
      !selection.isCollapsed &&
      selection.containsNode(target, true)
    ) {
      allowTouchMove = true;
    }

    // If this is a range input, allow touch move to allow user to adjust the slider value
    if (
      e
        .composedPath()
        .some((el) => el instanceof HTMLInputElement && el.type === "range")
    ) {
      allowTouchMove = true;
    }

    // If this is a focused input element with a selected range, allow user to drag the selection handles.
    if (
      "selectionStart" in target &&
      "selectionEnd" in target &&
      typeof target.selectionStart === "number" &&
      typeof target.selectionEnd === "number" &&
      target.selectionStart < target.selectionEnd &&
      target.ownerDocument.activeElement === target
    ) {
      allowTouchMove = true;
    }
  };

  // Prevent scrolling up when at the top and scrolling down when at the bottom
  // of a nested scrollable area, otherwise mobile Safari will start scrolling
  // the window instead.
  // This must be applied before the touchstart event as of iOS 26, so inject it as a <style> element.
  const style = document.createElement("style");
  const nonce = getNonce();

  if (isTruthy(nonce)) {
    style.nonce = nonce;
  }

  style.textContent = `
@layer {
  * {
    overscroll-behavior: contain;
  }
}`.trim();
  document.head.prepend(style);

  const onTouchMove = (e: TouchEvent) => {
    // Allow pinch-zooming.
    if (e.touches.length === 2 || allowTouchMove) {
      return;
    }

    // Prevent scrolling the window.
    if (
      !isTruthy(scrollable) ||
      scrollable === document.documentElement ||
      scrollable === document.body
    ) {
      e.preventDefault();

      return;
    }

    // overscroll-behavior should prevent scroll chaining, but currently does not
    // if the element doesn't actually overflow. https://bugs.webkit.org/show_bug.cgi?id=243452
    // This checks that both the width and height do not overflow, otherwise we might
    // block horizontal scrolling too. In that case, adding `touch-action: pan-x` to
    // the element will prevent vertical page scrolling. We can't add that automatically
    // because it must be set before the touchstart event.
    if (
      scrollable.scrollHeight === scrollable.clientHeight &&
      scrollable.scrollWidth === scrollable.clientWidth
    ) {
      e.preventDefault();
    }
  };

  const restoreFocus = overrideFocus();

  const removeEvents = chain(
    addEvent(document, "touchstart", onTouchStart, {
      capture: true,
      passive: false,
    }),
    addEvent(document, "touchmove", onTouchMove, {
      capture: true,
      passive: false,
    }),
    handleBlur()
  );

  return () => {
    restoreOverflow();
    removeEvents();
    style.remove();
    restoreFocus();
  };
}

const onBlur = (e: FocusEvent) => {
  const target = requireHTMLElement(getEventTarget(e));
  const relatedTarget = htmlElementOrNull(e.relatedTarget);

  if (relatedTarget && willOpenKeyboard(relatedTarget)) {
    // Re-focus programmatically to have the override below perform the scroll.
    relatedTarget.focus();
  } else if (!relatedTarget) {
    // When tapping the Done button on the keyboard, focus moves to the body.
    // FocusScope will then restore focus back to the input. Later when tapping
    // the same input again, it is already focused, so no blur event will fire,
    // resulting in the flow above never running and Safari's native scrolling occurring.
    // Instead, move focus to the parent focusable element (e.g. the dialog).
    const focusable = htmlElementOrNull(
      target.parentElement?.closest("[tabindex]")
    );

    focusable?.focus({ preventScroll: true });
  }
};

function handleBlur() {
  return addEvent(document, "blur", onBlur, true);
}

function overrideFocus() {
  // Override programmatic focus to scroll into view without scrolling the whole page.
  // oxlint-disable-next-line typescript/unbound-method -- Preserve the original method identity and invoke it with an explicit receiver.
  const { focus } = HTMLElement.prototype;
  Reflect.defineProperty(HTMLElement.prototype, "focus", {
    configurable: true,
    value(opts?: FocusOptions) {
      // Focus the element without scrolling the page.
      focus.call(this, { ...opts, preventScroll: true });

      if (!opts || !isTruthy(opts.preventScroll)) {
        const scroll = () => {
          const activeElement = getActiveElement();

          if (activeElement === this) {
            scrollIntoView(requireElement(this));
          }
        };

        runAfterKeyboard((isOpen) => {
          if (isOpen) {
            scroll();
          } else {
            runAfterKeyboardTransition(scroll);
          }
        });
      }
    },
    writable: true,
  });

  return () => {
    Reflect.defineProperty(HTMLElement.prototype, "focus", {
      configurable: true,
      value: focus,
      writable: true,
    });
  };
}

function scrollIntoView(target: Element) {
  const root =
    getTruthyValue(document.scrollingElement) ?? document.documentElement;

  let nextTarget: Element | null = target;

  while (nextTarget && nextTarget !== root && nextTarget.isConnected) {
    // Find the parent scrollable element and adjust the scroll position if the target is not already in view.
    const scrollable = getScrollParent(nextTarget);

    if (
      scrollable !== document.documentElement &&
      scrollable !== document.body &&
      scrollable !== nextTarget
    ) {
      const scrollableRect = scrollable.getBoundingClientRect();
      const targetRect = nextTarget.getBoundingClientRect();

      if (
        targetRect.top < scrollableRect.top ||
        targetRect.bottom > scrollableRect.top + nextTarget.clientHeight
      ) {
        let { bottom } = scrollableRect;

        if (isTruthy(visualViewport)) {
          bottom = Math.min(
            bottom,
            visualViewport.offsetTop + visualViewport.height
          );
        }

        // Center within the viewport.
        const adjustment =
          targetRect.top -
          scrollableRect.top -
          ((bottom - scrollableRect.top) / 2 - targetRect.height / 2);

        scrollable.scrollTo({
          behavior: "smooth",
          // Clamp to the valid range to prevent over-scrolling.
          top: Math.max(
            0,
            Math.min(
              scrollable.scrollHeight - scrollable.clientHeight,
              scrollable.scrollTop + adjustment
            )
          ),
        });
      }
    }

    nextTarget = scrollable.parentElement;
  }
}
