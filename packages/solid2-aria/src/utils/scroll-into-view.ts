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
 * Derived from Adobe React Spectrum: packages/react-aria/src/utils/scrollIntoView.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { isIOS, isWebKit } from "../utils/platform";
import { requireHTMLElement } from "./dom-value";
import { getScrollParents } from "./get-scroll-parents";
import { getTruthyValue } from "./truthy";

interface ScrollIntoViewOpts {
  /** The position to align items along the block axis in. */
  block?: ScrollLogicalPosition;
  /** The position to align items along the inline axis in. */
  inline?: ScrollLogicalPosition;
}

interface ScrollIntoViewportOpts {
  /** The optional containing element of the target to be centered in the viewport. */
  containingElement?: Element | null;
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but doesn't affect parents above `scrollView`.
 */
export function scrollIntoView(
  scrollView: HTMLElement,
  element: HTMLElement,
  opts: ScrollIntoViewOpts = {}
): void {
  if (scrollView === element) {
    return;
  }

  const target = element.getBoundingClientRect();
  scrollRectIntoView(scrollView, element, target, opts);
}

export function scrollRectIntoView(
  scrollView: HTMLElement,
  element: HTMLElement,
  target: DOMRect,
  opts: ScrollIntoViewOpts = {}
) {
  const { block = "nearest", inline = "nearest" } = opts;
  const initialY = scrollView.scrollTop;
  const initialX = scrollView.scrollLeft;
  const view = scrollView.getBoundingClientRect();
  const itemStyle = window.getComputedStyle(element);
  const viewStyle = window.getComputedStyle(scrollView);

  const root =
    getTruthyValue(document.scrollingElement) ?? document.documentElement;

  const port = getScrollPort(scrollView, view, viewStyle, scrollView === root);

  const y =
    initialY +
    getScrollOffset(
      target.top - styleNumber(itemStyle.scrollMarginTop),
      target.bottom + styleNumber(itemStyle.scrollMarginBottom),
      port.top,
      port.bottom,
      block
    );

  const x =
    initialX +
    getScrollOffset(
      target.left - styleNumber(itemStyle.scrollMarginLeft),
      target.right + styleNumber(itemStyle.scrollMarginRight),
      port.left,
      port.right,
      inline
    );

  if (process.env.NODE_ENV === "test") {
    scrollView.scrollLeft = x;
    scrollView.scrollTop = y;

    return;
  }

  scrollView.scrollTo({ left: x, top: y });
}

function styleNumber(value: string): number {
  return Number(value) || 0;
}

function getScrollOffset(
  start: number,
  end: number,
  portStart: number,
  portEnd: number,
  alignment: ScrollLogicalPosition
): number {
  if (!(start < portStart) && !(end > portEnd)) {
    return 0;
  }

  switch (alignment) {
    case "start": {
      return start - portStart;
    }

    case "center": {
      return (start + end) / 2 - (portStart + portEnd) / 2;
    }

    case "end": {
      return end - portEnd;
    }

    case "nearest": {
      const startOffset = start - portStart;
      const endOffset = end - portEnd;

      return Math.abs(startOffset) <= Math.abs(endOffset)
        ? startOffset
        : endOffset;
    }

    default: {
      return 0;
    }
  }
}

function getScrollPort(
  scrollView: HTMLElement,
  view: DOMRect,
  style: CSSStyleDeclaration,
  isRoot: boolean
): Pick<DOMRect, "top" | "bottom" | "left" | "right"> {
  const top = isRoot ? 0 : view.top;
  const bottom = isRoot ? scrollView.clientHeight : view.bottom;
  const left = isRoot ? 0 : view.left;
  const right = isRoot ? scrollView.clientWidth : view.right;
  const borderTop = styleNumber(style.borderTopWidth);
  const borderBottom = styleNumber(style.borderBottomWidth);
  const borderLeft = styleNumber(style.borderLeftWidth);
  const borderRight = styleNumber(style.borderRightWidth);

  const scrollBarWidth = isRoot
    ? 0
    : scrollView.offsetWidth -
      scrollView.clientWidth -
      (borderLeft + borderRight);

  const scrollBarHeight = isRoot
    ? 0
    : scrollView.offsetHeight -
      scrollView.clientHeight -
      (borderTop + borderBottom);

  const portTop =
    top + (isRoot ? 0 : borderTop) + styleNumber(style.scrollPaddingTop);

  const portBottom =
    bottom -
    (isRoot ? 0 : borderBottom) -
    styleNumber(style.scrollPaddingBottom) -
    scrollBarHeight;

  let portLeft =
    left + (isRoot ? 0 : borderLeft) + styleNumber(style.scrollPaddingLeft);

  let portRight =
    right - (isRoot ? 0 : borderRight) - styleNumber(style.scrollPaddingRight);

  // WebKit on iOS always positions the scrollbar on the right.
  if ((isIOS() && isWebKit()) || style.direction === "ltr") {
    portRight -= scrollBarWidth;
  } else if (style.direction === "rtl") {
    portLeft += scrollBarWidth;
  }

  return { bottom: portBottom, left: portLeft, right: portRight, top: portTop };
}

/**
 * Scrolls the `targetElement` so it is visible in the viewport. Accepts an optional
 * `opts.containingElement` that will be centered in the viewport prior to scrolling the
 * targetElement into view. If scrolling is prevented on the body (e.g. targetElement is in a
 * popover), this will only scroll the scroll parents of the targetElement up to but not including
 * the body itself.
 */
export function scrollIntoViewport(
  targetElement: Element | null,
  opts: ScrollIntoViewportOpts = {}
): void {
  const { containingElement } = opts;

  if (targetElement && targetElement.isConnected) {
    const root =
      getTruthyValue(document.scrollingElement) ?? document.documentElement;

    const isScrollPrevented =
      window.getComputedStyle(root).overflow === "hidden";

    const { left: originalLeft, top: originalTop } =
      targetElement.getBoundingClientRect();

    if (isScrollPrevented) {
      let scrollParents = getScrollParents(targetElement, true);

      for (const scrollParent of scrollParents) {
        scrollIntoView(
          requireHTMLElement(scrollParent),
          requireHTMLElement(targetElement)
        );
      }

      const { left: newLeft, top: newTop } =
        targetElement.getBoundingClientRect();

      // Account for sub pixel differences from rounding
      if (
        Math.abs(originalLeft - newLeft) > 1 ||
        Math.abs(originalTop - newTop) > 1
      ) {
        scrollParents = containingElement
          ? getScrollParents(containingElement, true)
          : [];

        // scroll containing element into view first, then rescroll target element into view like the non chrome flow above
        for (const scrollParent of scrollParents) {
          scrollIntoView(
            requireHTMLElement(scrollParent),
            requireHTMLElement(containingElement),
            {
              block: "center",
              inline: "center",
            }
          );
        }

        for (const scrollParent of getScrollParents(targetElement, true)) {
          scrollIntoView(
            requireHTMLElement(scrollParent),
            requireHTMLElement(targetElement)
          );
        }
      }
    } else {
      targetElement?.scrollIntoView?.({ block: "nearest" });

      const { left: newLeft, top: newTop } =
        targetElement.getBoundingClientRect();

      // Account for sub pixel differences from rounding
      if (
        Math.abs(originalLeft - newLeft) > 1 ||
        Math.abs(originalTop - newTop) > 1
      ) {
        containingElement?.scrollIntoView?.({
          block: "center",
          inline: "center",
        });
        targetElement.scrollIntoView?.({ block: "nearest" });
      }
    }
  }
}
