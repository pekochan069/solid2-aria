/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/helpers.ts and src/browser.ts.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: typed geometry and property-scoped style restoration without shared style caches.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import type { DrawerDirection } from "./types";

export function isVertical(direction: DrawerDirection): boolean {
  return direction === "top" || direction === "bottom";
}

export function directionSign(direction: DrawerDirection): 1 | -1 {
  return direction === "bottom" || direction === "right" ? 1 : -1;
}

export function translate(
  distance: number,
  direction: DrawerDirection
): string {
  return isVertical(direction)
    ? `translate3d(0, ${distance}px, 0)`
    : `translate3d(${distance}px, 0, 0)`;
}

export function dampenValue(value: number): number {
  return Math.max(0, 8 * (Math.log(value + 1) - 2));
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/** Restore only the properties this operation owns, including priorities. */
export function assignStyle(
  element: HTMLElement,
  styles: Record<string, string>
): () => void {
  const previous = Object.keys(styles).map((property) => ({
    priority: element.style.getPropertyPriority(property),
    property,
    value: element.style.getPropertyValue(property),
  }));

  for (const [property, value] of Object.entries(styles)) {
    element.style.setProperty(property, value);
  }

  return () => {
    for (const { property, value, priority } of previous) {
      if (value) {
        element.style.setProperty(property, value, priority);
      } else {
        element.style.removeProperty(property);
      }
    }
  };
}

export function isSafari(view: Window): boolean {
  return /^(?:(?!chrome|android).)*safari/iu.test(view.navigator.userAgent);
}

export function canScroll(
  target: HTMLElement,
  content: HTMLElement,
  direction: DrawerDirection,
  distance: number
): boolean {
  const vertical = isVertical(direction);
  const forward = distance * directionSign(direction) < 0;

  for (
    let node: HTMLElement | null = target;
    node && content.contains(node);
    node = node.parentElement
  ) {
    const scrollSize = vertical ? node.scrollHeight : node.scrollWidth;
    const size = vertical ? node.clientHeight : node.clientWidth;

    if (scrollSize <= size) {
      continue;
    }

    const position = vertical ? node.scrollTop : node.scrollLeft;

    if (
      (forward && position < scrollSize - size) ||
      (!forward && position > 0)
    ) {
      return true;
    }
  }

  return false;
}
