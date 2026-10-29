/*
 * Copyright 2026 Adobe. All rights reserved.
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
 * Derived from Adobe React Spectrum: packages/react-aria/src/tooltip/useSafeArea.ts.
 * Modified for Solid Aria: adapted hooks, reactive getters, DOM types, and imports for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

import { getOwnerDocument, getOwnerWindow } from "../utils/dom-helpers";
import { requireValue } from "../utils/require-value";
import { isTruthy } from "../utils/truthy";

interface Point {
  x: number;
  y: number;
}

interface SafeAreaOptions {
  /** Ref for the trigger element. */
  triggerRef: Accessor<Element | null>;
  /** Ref for the overlay element. */
  overlayRef: Accessor<Element | null>;
  /** Whether the overlay is open. */
  isOpen: boolean;
  /** Whether this feature is disabled. */
  isDisabled?: boolean;
  /**
   * Called on pointer move (and when the pointer leaves the document) with whether the pointer is
   * currently within the "safe area" — the trigger, the overlay, or the region between them. This
   * lets an overlay stay open while the pointer travels from the trigger to the overlay, even
   * diagonally and regardless of placement.
   */
  onSafeAreaChange: (isInSafeArea: boolean) => void;
}

// A small amount of padding (in pixels) added around the trigger and overlay so the safe area is
// slightly forgiving of sub-pixel jitter and the gap between the elements.
const PADDING = 8;

/**
 * Tracks whether the pointer is within a "safe area" connecting a trigger and its overlay, so the
 * overlay can stay open while the pointer moves between them. The safe area is the union of the
 * trigger rect, the overlay rect, and the convex hull connecting the two (a polygon), which works
 * for any placement of the overlay relative to the trigger.
 */
export function createSafeArea(options: SafeAreaOptions): void {
  const _result0 = options;

  const onSafeAreaChange = (value: boolean) => {
    options.onSafeAreaChange(value);
  };

  const onPointerLeave = () => {
    onSafeAreaChange(false);
  };

  createEffect(
    () => ({
      input3: _result0.overlayRef(),
      isDisabled: _result0.isDisabled,
      isOpen: _result0.isOpen,
      triggerElement: _result0.triggerRef(),
    }),
    ({ isOpen, isDisabled, triggerElement }): undefined | (() => void) => {
      const trigger = triggerElement;

      if (isTruthy(isDisabled) || !isOpen || !trigger) {
        return undefined;
      }

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") {
          return;
        }

        const point = { x: e.clientX, y: e.clientY };
        const triggerRect = trigger.getBoundingClientRect();

        const overlayRect = _result0.overlayRef()?.getBoundingClientRect();

        onSafeAreaChange(isPointInSafeArea(point, triggerRect, overlayRect));
      };

      // If the pointer leaves the document entirely, it is no longer in the safe area.

      const win = getOwnerWindow(trigger);
      const doc = getOwnerDocument(trigger);
      win.addEventListener("pointermove", onPointerMove);
      doc.documentElement.addEventListener("pointerleave", onPointerLeave);

      return () => {
        win.removeEventListener("pointermove", onPointerMove);
        doc.documentElement.removeEventListener("pointerleave", onPointerLeave);
      };
    },
    { ssrSource: "client" }
  );
}

function isPointInSafeArea(
  point: Point,
  triggerRect: DOMRect,
  overlayRect?: DOMRect
): boolean {
  if (rectContains(triggerRect, point)) {
    return true;
  }

  if (!overlayRect) {
    return false;
  }

  if (rectContains(overlayRect, point)) {
    return true;
  }

  // Otherwise, check whether the point is within the convex hull connecting the two rects.
  const hull = convexHull([
    ...rectCorners(triggerRect),
    ...rectCorners(overlayRect),
  ]);

  return hull.length >= 3 && isPointInPolygon(point, hull);
}

function rectContains(rect: DOMRect, point: Point): boolean {
  return (
    point.x >= rect.left - PADDING &&
    point.x <= rect.right + PADDING &&
    point.y >= rect.top - PADDING &&
    point.y <= rect.bottom + PADDING
  );
}

function rectCorners(rect: DOMRect): Point[] {
  const left = rect.left - PADDING;
  const right = rect.right + PADDING;
  const top = rect.top - PADDING;
  const bottom = rect.bottom + PADDING;

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

// Computes the convex hull of a set of points using the monotone chain algorithm.
function convexHull(points: Point[]): Point[] {
  const sorted = [...points].toSorted((a, b) => a.x - b.x || a.y - b.y);

  if (sorted.length < 3) {
    return sorted;
  }

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];

  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(
        requireValue(lower.at(-2), "Expected lower.at(-2)"),
        requireValue(lower.at(-1), "Expected lower.at(-1)"),
        p
      ) <= 0
    ) {
      lower.pop();
    }

    lower.push(p);
  }

  const upper: Point[] = [];

  for (const p of sorted.toReversed()) {
    while (
      upper.length >= 2 &&
      cross(
        requireValue(upper.at(-2), "Expected upper.at(-2)"),
        requireValue(upper.at(-1), "Expected upper.at(-1)"),
        p
      ) <= 0
    ) {
      upper.pop();
    }

    upper.push(p);
  }

  lower.pop();
  upper.pop();

  return [...lower, ...upper];
}

// Ray casting point-in-polygon test.
function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  const { x, y } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = requireValue(polygon[i], "Expected polygon[i]").x;
    const yi = requireValue(polygon[i], "Expected polygon[i]").y;
    const xj = requireValue(polygon[j], "Expected polygon[j]").x;
    const yj = requireValue(polygon[j], "Expected polygon[j]").y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
