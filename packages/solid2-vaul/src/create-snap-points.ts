/*
 * Derived from Vaul (https://github.com/emilkowalski/vaul): src/use-snap-points.ts.
 * Copyright (c) 2023 Emil Kowalski
 * Modified for Solid Aria: pure snap geometry and selection, bounded sequential swipes, and container dimensions.
 * MIT licensed. See LICENSE, VAUL-LICENSE, and NOTICE.txt in the package root.
 */

import { VELOCITY_THRESHOLD } from "./constants";
import { clamp, directionSign } from "./helpers";
import type { DrawerDirection, SnapPoint } from "./types";

export function getSnapPointOffsets(
  points: readonly SnapPoint[],
  dimension: number,
  direction: DrawerDirection
): number[] {
  return points.map((point) => {
    const visible =
      typeof point === "number"
        ? point * dimension
        : Number(point.replace(/px$/u, ""));

    return (dimension - visible) * directionSign(direction);
  });
}

export function getOverlayOpacity(
  offsets: readonly number[],
  offset: number,
  fadeFromIndex: number,
  dimension: number
): number {
  const faded = Math.abs(offsets[fadeFromIndex] ?? 0);

  const clear =
    fadeFromIndex === 0
      ? dimension
      : Math.abs(offsets[fadeFromIndex - 1] ?? faded);

  if (clear === faded) {
    return offset <= faded ? 1 : 0;
  }

  return clamp((clear - offset) / (clear - faded));
}

export function selectSnapPoint(options: {
  offsets: readonly number[];
  activeIndex: number;
  /** Positive distance moves toward the closed edge. */
  distance: number;
  velocity: number;
  dimension: number;
  dismissible: boolean;
  sequential: boolean;
}): number | "close" {
  const {
    offsets,
    activeIndex,
    distance,
    velocity,
    dimension,
    dismissible,
    sequential,
  } = options;

  const [first] = offsets;

  if (first === undefined) {
    return activeIndex;
  }

  const active = Math.abs(offsets[activeIndex] ?? first);
  const position = active + distance;

  if (!sequential && velocity > 2) {
    if (distance <= 0) {
      return offsets.length - 1;
    }

    return dismissible ? "close" : 0;
  }

  if (velocity > VELOCITY_THRESHOLD && Math.abs(distance) < dimension * 0.4) {
    if (distance > 0 && activeIndex === 0 && dismissible) {
      return "close";
    }

    return clamp(activeIndex + (distance > 0 ? -1 : 1), 0, offsets.length - 1);
  }

  const remaining = dimension - Math.abs(first);

  if (
    dismissible &&
    distance > 0 &&
    position > Math.abs(first) + remaining / 2
  ) {
    return "close";
  }

  let closest = 0;
  let difference = Infinity;

  for (const [index, offset] of offsets.entries()) {
    if (sequential && Math.abs(index - activeIndex) > 1) {
      continue;
    }

    const nextDifference = Math.abs(Math.abs(offset) - position);

    if (nextDifference < difference) {
      difference = nextDifference;
      closest = index;
    }
  }

  return closest;
}
